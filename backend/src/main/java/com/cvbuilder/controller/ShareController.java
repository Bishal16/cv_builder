package com.cvbuilder.controller;

import com.cvbuilder.dto.CvDto;
import com.cvbuilder.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

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
}
