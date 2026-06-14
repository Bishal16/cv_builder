package com.cvbuilder.controller;

import com.cvbuilder.service.DocxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cv")
@RequiredArgsConstructor
public class DocxController {

    private static final String DOCX_MIME =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    private final DocxService docxService;

    @GetMapping("/{id}/export/docx")
    public ResponseEntity<byte[]> exportDocx(@PathVariable UUID id) {
        byte[] bytes = docxService.generateDocx(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cv-" + id + ".docx\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .contentType(MediaType.parseMediaType(DOCX_MIME))
                .body(bytes);
    }
}
