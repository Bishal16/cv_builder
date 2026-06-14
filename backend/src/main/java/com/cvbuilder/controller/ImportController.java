package com.cvbuilder.controller;

import com.cvbuilder.dto.CreateCvRequest;
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

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<CreateCvRequest> importResume(@RequestParam("file") MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(importService.importFromFile(file));
    }
}
