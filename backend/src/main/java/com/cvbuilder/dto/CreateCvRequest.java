package com.cvbuilder.dto;

import com.cvbuilder.model.TemplateId;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateCvRequest {
    private String title;
    private TemplateId templateId;
    private PersonalInfoDto personalInfo;
    private List<ExperienceDto> experiences;
    private List<EducationDto> educations;
    private List<SkillDto> skills;
    private List<ProjectDto> projects;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public TemplateId getTemplateId() { return templateId; }
    public void setTemplateId(TemplateId templateId) { this.templateId = templateId; }
    public PersonalInfoDto getPersonalInfo() { return personalInfo; }
    public void setPersonalInfo(PersonalInfoDto personalInfo) { this.personalInfo = personalInfo; }
    public List<ExperienceDto> getExperiences() { return experiences; }
    public void setExperiences(List<ExperienceDto> experiences) { this.experiences = experiences; }
    public List<EducationDto> getEducations() { return educations; }
    public void setEducations(List<EducationDto> educations) { this.educations = educations; }
    public List<SkillDto> getSkills() { return skills; }
    public void setSkills(List<SkillDto> skills) { this.skills = skills; }
    public List<ProjectDto> getProjects() { return projects; }
    public void setProjects(List<ProjectDto> projects) { this.projects = projects; }
}