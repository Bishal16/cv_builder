package com.cvbuilder.model;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class SkillLevelDeserializer extends JsonDeserializer<SkillLevel> {
    @Override
    public SkillLevel deserialize(JsonParser p, DeserializationContext c) throws IOException {
        return SkillLevel.fromString(p.getValueAsString());
    }
}