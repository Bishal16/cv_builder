package com.cvbuilder.dto;

import com.cvbuilder.model.TemplateId;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateCvRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @NotNull(message = "Template ID is required")
    private TemplateId templateId;

    private List<String> sectionOrder;

    @Valid
    private PersonalInfoDto personalInfo;

    @Valid
    private List<ExperienceDto> experiences;

    @Valid
    private List<EducationDto> educations;

    @Valid
    private List<SkillDto> skills;

    @Valid
    private List<ProjectDto> projects;

    private String accentColor;
    private String fontFamily;
    private String density;
}
