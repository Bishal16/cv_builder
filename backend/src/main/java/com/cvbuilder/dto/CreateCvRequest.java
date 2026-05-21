package com.cvbuilder.dto;

import com.cvbuilder.model.TemplateId;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateCvRequest {
    private String title;
    private TemplateId templateId;
    private List<String> sectionOrder;
    private PersonalInfoDto personalInfo;
    private List<ExperienceDto> experiences;
    private List<EducationDto> educations;
    private List<SkillDto> skills;
    private List<ProjectDto> projects;
}
