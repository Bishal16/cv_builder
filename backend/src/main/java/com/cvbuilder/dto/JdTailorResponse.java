package com.cvbuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class JdTailorResponse {
    private int matchScore;
    private List<String> missingKeywords;
    private List<String> presentKeywords;
    private List<String> suggestions;
}
