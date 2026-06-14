package com.cvbuilder.dto;

import com.cvbuilder.model.TemplateId;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CvDto {
    private UUID id;
    private String title;
    private TemplateId templateId;
    private List<String> sectionOrder;
    private PersonalInfoDto personalInfo;
    private List<ExperienceDto> experiences;
    private List<EducationDto> educations;
    private List<SkillDto> skills;
    private List<ProjectDto> projects;
    private List<CertificationDto> certifications;
    private List<LanguageDto> languages;
    private List<AwardDto> awards;
    private String accentColor;
    private String fontFamily;
    private String density;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
