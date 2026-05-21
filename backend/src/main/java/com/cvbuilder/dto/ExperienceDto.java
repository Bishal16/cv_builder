package com.cvbuilder.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExperienceDto {
    private UUID id;
    private String company;
    private String role;
    private String startDate;
    private String endDate;
    private String description;
}
