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
public class EducationDto {
    private UUID id;

    @NotBlank(message = "Institution is required")
    @Size(max = 200)
    private String institution;

    @Size(max = 200)
    private String degree;

    @Size(max = 200)
    private String field;

    private Integer graduationYear;
}
