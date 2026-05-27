package com.cvbuilder.controller;

import com.cvbuilder.service.PdfService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cv")
public class PdfController {

    private static final Logger log = LoggerFactory.getLogger(PdfController.class);
    private final PdfService pdfService;

    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable UUID id,
            HttpServletRequest request) {

        // Forward the JWT so PdfService can inject it into the headless browser,
        // allowing the print view to authenticate and fetch CV data.
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7)
                : null;

        log.info("Exporting CV {} to PDF", id);
        byte[] pdfBytes = pdfService.generatePdf(id, token);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cv-" + id + ".pdf\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
