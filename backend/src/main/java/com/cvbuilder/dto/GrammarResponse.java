package com.cvbuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GrammarResponse {
    private String correctedText;
    private List<GrammarIssue> issues;

    @Data
    @AllArgsConstructor
    public static class GrammarIssue {
        private String original;
        private String suggestion;
        private String explanation;
    }
}
