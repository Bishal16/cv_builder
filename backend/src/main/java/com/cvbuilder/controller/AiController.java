package com.cvbuilder.controller;

import com.cvbuilder.dto.AiSuggestRequest;
import com.cvbuilder.dto.AiSuggestResponse;
import com.cvbuilder.dto.CoverLetterRequest;
import com.cvbuilder.dto.CoverLetterResponse;
import com.cvbuilder.dto.AiUsageStatus;
import com.cvbuilder.dto.JdTailorRequest;
import com.cvbuilder.dto.JdTailorResponse;
import com.cvbuilder.service.AiService;
import com.cvbuilder.service.AiUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final AiUsageService aiUsageService;

    @GetMapping("/usage")
    public ResponseEntity<AiUsageStatus> usage() {
        return ResponseEntity.ok(aiUsageService.getStatus());
    }

    @PostMapping("/suggest")
    public ResponseEntity<AiSuggestResponse> suggest(@Valid @RequestBody AiSuggestRequest request) {
        return ResponseEntity.ok(aiService.suggest(request));
    }

    @PostMapping("/tailor")
    public ResponseEntity<JdTailorResponse> tailor(@Valid @RequestBody JdTailorRequest request) {
        return ResponseEntity.ok(aiService.tailorForJd(request));
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<CoverLetterResponse> coverLetter(@Valid @RequestBody CoverLetterRequest request) {
        return ResponseEntity.ok(aiService.generateCoverLetter(request));
    }
}
