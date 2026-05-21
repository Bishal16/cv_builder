package com.cvbuilder.dto;

import com.cvbuilder.model.SkillLevel;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.cvbuilder.model.SkillLevelDeserializer;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillDto {
    private UUID id;
    private String name;
    private String category;

    @JsonDeserialize(using = SkillLevelDeserializer.class)
    private SkillLevel level;
}
