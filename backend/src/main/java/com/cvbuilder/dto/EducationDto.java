package com.cvbuilder.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EducationDto {
    private UUID id;
    private String institution;
    private String degree;
    private String field;
    private Integer graduationYear;
}
