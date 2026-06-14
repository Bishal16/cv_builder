package com.cvbuilder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiSuggestRequest {

    /** "summary" | "experience" | "project" */
    @NotBlank
    @Pattern(regexp = "summary|experience|project")
    private String type;

    /** Current HTML or plain-text content to improve. */
    @NotBlank
    private String content;

    /** Optional context — job title / company for experience rewrites. */
    private String context;
}
