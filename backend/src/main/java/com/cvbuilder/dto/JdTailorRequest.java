package com.cvbuilder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class JdTailorRequest {
    @NotBlank
    @Size(max = 8000, message = "Job description must not exceed 8000 characters")
    private String jobDescription;

    private String cvSummary;
    private List<String> skills;
    private List<ExperienceSnippet> experiences;

    @Data
    public static class ExperienceSnippet {
        private String role;
        private String company;
        private String description;
    }
}
