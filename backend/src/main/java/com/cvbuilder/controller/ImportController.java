package com.cvbuilder.controller;

import com.cvbuilder.dto.CreateCvRequest;
import com.cvbuilder.dto.ExtractResponse;
import com.cvbuilder.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    /** Stage 1: extract raw text from the uploaded file. */
    @PostMapping(value = "/extract", consumes = "multipart/form-data")
    public ResponseEntity<ExtractResponse> extract(@RequestParam("file") MultipartFile file) throws Exception {
        if (file.isEmpty()) return ResponseEntity.badRequest().build();
        String text = importService.extractText(file);
        return ResponseEntity.ok(new ExtractResponse(text));
    }

    /** Stage 2: parse extracted text into a structured CV using the LLM. */
    @PostMapping("/parse")
    public ResponseEntity<CreateCvRequest> parse(@RequestBody ExtractResponse body) {
        if (body.getText() == null || body.getText().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(importService.parseWithLlm(body.getText()));
    }

    /** Legacy single-call endpoint — kept for compatibility. */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<CreateCvRequest> importResume(@RequestParam("file") MultipartFile file) throws Exception {
        if (file.isEmpty()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(importService.importFromFile(file));
    }
}
