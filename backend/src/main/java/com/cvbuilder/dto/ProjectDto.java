package com.cvbuilder.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectDto {
    private UUID id;
    private String name;
    private String description;
    private String url;
}
