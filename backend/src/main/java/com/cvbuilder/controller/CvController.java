package com.cvbuilder.controller;

import com.cvbuilder.dto.*;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.service.CvService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cv")
public class CvController {

    private static final Logger log = LoggerFactory.getLogger(CvController.class);
    private final CvService cvService;

    public CvController(CvService cvService) {
        this.cvService = cvService;
    }

    @PostMapping
    public ResponseEntity<CvDto> createCv(@RequestBody CreateCvRequest request) {
        log.info("Creating new CV with title: {}", request.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(cvService.createCv(request));
    }

    @GetMapping
    public ResponseEntity<List<CvDto>> listCvs() {
        return ResponseEntity.ok(cvService.getAllCvs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CvDto> getCv(@PathVariable UUID id) {
        return ResponseEntity.ok(cvService.getCvById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CvDto> updateCv(@PathVariable UUID id, @RequestBody UpdateCvRequest request) {
        log.info("Updating CV with id: {}", id);
        return ResponseEntity.ok(cvService.updateCv(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCv(@PathVariable UUID id) {
        log.info("Deleting CV with id: {}", id);
        cvService.deleteCv(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String message) {}
}