package com.cvbuilder.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;

/**
 * Remembers which frontend origin the user started the OAuth flow from, so the
 * success/failure handlers can redirect back to that exact origin instead of the
 * statically configured one. This keeps localhost users on localhost and LAN/prod
 * users on their LAN/prod address.
 *
 * <p>The origin is read (in priority order) from the {@code frontend_origin} query
 * param, the {@code Referer} header, then the {@code Origin} header — captured on the
 * {@code /oauth2/authorization/**} request and stashed in the HTTP session, which
 * survives the round trip through the identity provider.
 *
 * <p>Only allow-listed origins are stored, since the JWT is later appended to this
 * URL as a query param — echoing an attacker-controlled origin would leak the token
 * (open redirect). Allowed: localhost, private/LAN IPv4 ranges, and the configured
 * frontend host.
 */
@Component
public class OAuth2OriginCapturingFilter extends OncePerRequestFilter {

    static final String SESSION_ATTR = "FRONTEND_ORIGIN";

    @Value("${cvbuilder.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/oauth2/authorization/")) {
            String origin = firstNonBlank(
                    request.getParameter("frontend_origin"),
                    originOf(request.getHeader("Referer")),
                    originOf(request.getHeader("Origin")));
            String allowed = sanitize(origin);
            if (allowed != null) {
                request.getSession(true).setAttribute(SESSION_ATTR, allowed);
            }
        }
        chain.doFilter(request, response);
    }

    /** Extract the {@code scheme://host[:port]} origin from a full URL, or null. */
    private String originOf(String url) {
        if (url == null || url.isBlank()) return null;
        try {
            URI uri = URI.create(url.trim());
            if (uri.getScheme() == null || uri.getHost() == null) return null;
            int port = uri.getPort();
            return uri.getScheme() + "://" + uri.getHost() + (port > 0 ? ":" + port : "");
        } catch (Exception e) {
            return null;
        }
    }

    /** Normalise to an origin and return it only if the host is allow-listed. */
    private String sanitize(String value) {
        String origin = value != null && value.contains("://") ? originOf(value) : null;
        if (origin == null) return null;
        try {
            URI uri = URI.create(origin);
            String host = uri.getHost();
            if (host == null) return null;
            String scheme = uri.getScheme();
            if (!"http".equals(scheme) && !"https".equals(scheme)) return null;
            return isAllowedHost(host) ? origin : null;
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isAllowedHost(String host) {
        if ("localhost".equals(host) || "127.0.0.1".equals(host)) return true;
        if (host.equalsIgnoreCase(configuredHost())) return true;
        return isPrivateIpv4(host);
    }

    private String configuredHost() {
        try {
            return URI.create(frontendBaseUrl).getHost();
        } catch (Exception e) {
            return null;
        }
    }

    /** RFC 1918 private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. */
    private boolean isPrivateIpv4(String host) {
        String[] parts = host.split("\\.");
        if (parts.length != 4) return false;
        try {
            int a = Integer.parseInt(parts[0]);
            int b = Integer.parseInt(parts[1]);
            for (String p : parts) {
                int n = Integer.parseInt(p);
                if (n < 0 || n > 255) return false;
            }
            if (a == 10) return true;
            if (a == 172 && b >= 16 && b <= 31) return true;
            return a == 192 && b == 168;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }
}
