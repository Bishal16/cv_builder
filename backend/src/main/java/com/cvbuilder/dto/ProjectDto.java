package com.cvbuilder.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectDto {
    private UUID id;

    @NotBlank(message = "Project name is required")
    @Size(max = 200)
    private String name;

    private String description;

    @Size(max = 500)
    private String url;
}
