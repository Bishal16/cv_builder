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
public class ExperienceDto {
    private UUID id;

    @NotBlank(message = "Company is required")
    @Size(max = 200)
    private String company;

    @NotBlank(message = "Role is required")
    @Size(max = 200)
    private String role;

    private String startDate;
    private String endDate;
    private String description;
}
