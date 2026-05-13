package com.cvbuilder.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(using = SkillLevelDeserializer.class)
public enum SkillLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED,
    EXPERT;

    public static SkillLevel fromString(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return SkillLevel.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}