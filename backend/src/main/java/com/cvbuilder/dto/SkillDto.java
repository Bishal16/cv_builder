package com.cvbuilder.dto;

import com.cvbuilder.model.SkillLevel;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.cvbuilder.model.SkillLevelDeserializer;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillDto {
    private UUID id;
    private String name;
    private String category;

    @JsonDeserialize(using = SkillLevelDeserializer.class)
    private SkillLevel level;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public SkillLevel getLevel() { return level; }
    public void setLevel(SkillLevel level) { this.level = level; }
}