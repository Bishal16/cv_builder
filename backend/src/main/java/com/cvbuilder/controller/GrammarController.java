package com.cvbuilder.controller;

import com.cvbuilder.dto.GrammarRequest;
import com.cvbuilder.dto.GrammarResponse;
import com.cvbuilder.service.GrammarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/grammar")
@RequiredArgsConstructor
public class GrammarController {

    private final GrammarService grammarService;

    @PostMapping
    public ResponseEntity<GrammarResponse> suggest(@Valid @RequestBody GrammarRequest req) {
        return ResponseEntity.ok(grammarService.check(req));
    }
}
