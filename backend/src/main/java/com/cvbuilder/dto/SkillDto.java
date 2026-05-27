package com.cvbuilder.dto;

import com.cvbuilder.model.SkillLevel;
import com.cvbuilder.model.SkillLevelDeserializer;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillDto {
    private UUID id;

    @NotBlank(message = "Skill name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String category;

    @JsonDeserialize(using = SkillLevelDeserializer.class)
    private SkillLevel level;
}
