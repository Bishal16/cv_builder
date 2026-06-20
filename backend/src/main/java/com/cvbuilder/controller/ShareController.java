package com.cvbuilder.controller;

import com.cvbuilder.dto.CvDto;
import com.cvbuilder.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.URI;
import java.util.Enumeration;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @Value("${cvbuilder.frontend.base-url}")
    private String frontendBaseUrl;

    @PostMapping("/api/v1/cv/{id}/share")
    public ResponseEntity<Map<String, String>> createShare(@PathVariable UUID id) {
        String token = shareService.createOrEnableLink(id);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @DeleteMapping("/api/v1/cv/{id}/share")
    public ResponseEntity<Void> deleteShare(@PathVariable UUID id) {
        shareService.disableLink(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/cv/{id}/share")
    public ResponseEntity<Map<String, String>> getShare(@PathVariable UUID id) {
        return shareService.getActiveToken(id)
                .map(token -> ResponseEntity.ok(Map.of("token", token)))
                .orElseGet(() -> ResponseEntity.ok(Map.of()));
    }

    @GetMapping("/api/v1/public/cv/{token}")
    public ResponseEntity<CvDto> getPublicCv(@PathVariable String token) {
        return ResponseEntity.ok(shareService.getPublicCv(token));
    }

    @GetMapping("/api/v1/public/config")
    public ResponseEntity<Map<String, String>> getPublicConfig() {
        return ResponseEntity.ok(Map.of("shareBaseUrl", resolveShareBaseUrl()));
    }

    private String resolveShareBaseUrl() {
        try {
            URI uri = URI.create(frontendBaseUrl);
            String host = uri.getHost();
            if (!"localhost".equals(host) && !"127.0.0.1".equals(host)) {
                return frontendBaseUrl;
            }
            String lanIp = detectLanIp();
            int port = uri.getPort();
            return uri.getScheme() + "://" + lanIp + (port > 0 ? ":" + port : "");
        } catch (Exception e) {
            return frontendBaseUrl;
        }
    }

    private String detectLanIp() {
        String best = null;
        int bestScore = Integer.MIN_VALUE;
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || iface.isPointToPoint() || iface.isVirtual() || !iface.isUp()) continue;
                if (isVirtualInterface(iface.getName())) continue;
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (!(addr instanceof Inet4Address) || addr.isLoopbackAddress() || addr.isLinkLocalAddress()) continue;
                    int score = scoreCandidate(addr.getHostAddress());
                    if (score > bestScore) {
                        bestScore = score;
                        best = addr.getHostAddress();
                    }
                }
            }
        } catch (SocketException ignored) {}
        return best != null ? best : "localhost";
    }

    /** Skip Docker bridges, VPNs, and other virtual adapters that expose non-LAN private IPs. */
    private boolean isVirtualInterface(String name) {
        if (name == null) return false;
        String n = name.toLowerCase();
        return n.startsWith("docker") || n.startsWith("br-") || n.startsWith("veth")
                || n.startsWith("virbr") || n.startsWith("vmnet") || n.startsWith("vboxnet")
                || n.startsWith("tun") || n.startsWith("tap") || n.startsWith("zt")
                || n.startsWith("wg") || n.startsWith("utun");
    }

    /** Prefer typical home/office LAN ranges over Docker's 172.16.0.0/12 default. */
    private int scoreCandidate(String ip) {
        if (ip.startsWith("192.168.")) return 3;
        if (ip.startsWith("10.")) return 2;
        if (ip.startsWith("172.")) return 1; // Docker default range — last resort
        return 0;
    }
}
