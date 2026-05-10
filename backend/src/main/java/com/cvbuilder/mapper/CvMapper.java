package com.cvbuilder.mapper;

import com.cvbuilder.dto.*;
import com.cvbuilder.entity.*;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class CvMapper {

    public CvDto toDto(Cv cv) {
        if (cv == null) return null;
        
        CvDto dto = new CvDto();
        dto.setId(cv.getId());
        dto.setTitle(cv.getTitle());
        dto.setTemplateId(cv.getTemplateId());
        dto.setCreatedAt(cv.getCreatedAt());
        dto.setUpdatedAt(cv.getUpdatedAt());
        
        if (cv.getPersonalInfo() != null) {
            PersonalInfoDto personalInfo = new PersonalInfoDto();
            personalInfo.setName(cv.getPersonalInfo().getName());
            personalInfo.setEmail(cv.getPersonalInfo().getEmail());
            personalInfo.setPhone(cv.getPersonalInfo().getPhone());
            personalInfo.setLocation(cv.getPersonalInfo().getLocation());
            personalInfo.setSummary(cv.getPersonalInfo().getSummary());
            dto.setPersonalInfo(personalInfo);
        }
        
        if (cv.getExperiences() != null) {
            dto.setExperiences(cv.getExperiences().stream()
                    .map(this::toExperienceDto)
                    .collect(Collectors.toList()));
        }
        
        if (cv.getEducations() != null) {
            dto.setEducations(cv.getEducations().stream()
                    .map(this::toEducationDto)
                    .collect(Collectors.toList()));
        }
        
        if (cv.getSkills() != null) {
            dto.setSkills(cv.getSkills().stream()
                    .map(this::toSkillDto)
                    .collect(Collectors.toList()));
        }
        
        if (cv.getProjects() != null) {
            dto.setProjects(cv.getProjects().stream()
                    .map(this::toProjectDto)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    public Cv toEntity(CreateCvRequest request) {
        if (request == null) return null;
        
        Cv cv = new Cv();
        cv.setTitle(request.getTitle());
        cv.setTemplateId(request.getTemplateId());
        
        if (request.getPersonalInfo() != null) {
            PersonalInfo personalInfo = new PersonalInfo();
            personalInfo.setName(request.getPersonalInfo().getName());
            personalInfo.setEmail(request.getPersonalInfo().getEmail());
            personalInfo.setPhone(request.getPersonalInfo().getPhone());
            personalInfo.setLocation(request.getPersonalInfo().getLocation());
            personalInfo.setSummary(request.getPersonalInfo().getSummary());
            cv.setPersonalInfo(personalInfo);
        }
        
        if (request.getExperiences() != null) {
            cv.setExperiences(request.getExperiences().stream()
                    .map(this::toExperienceEntity)
                    .collect(Collectors.toList()));
        }
        
        if (request.getEducations() != null) {
            cv.setEducations(request.getEducations().stream()
                    .map(this::toEducationEntity)
                    .collect(Collectors.toList()));
        }
        
        if (request.getSkills() != null) {
            cv.setSkills(request.getSkills().stream()
                    .map(this::toSkillEntity)
                    .collect(Collectors.toList()));
        }
        
        if (request.getProjects() != null) {
            cv.setProjects(request.getProjects().stream()
                    .map(this::toProjectEntity)
                    .collect(Collectors.toList()));
        }
        
        return cv;
    }

    public void updateEntityFromRequest(UpdateCvRequest request, Cv cv) {
        if (request == null || cv == null) return;
        
        if (request.getTitle() != null) {
            cv.setTitle(request.getTitle());
        }
        if (request.getTemplateId() != null) {
            cv.setTemplateId(request.getTemplateId());
        }
        if (request.getPersonalInfo() != null) {
            PersonalInfo personalInfo = new PersonalInfo();
            personalInfo.setName(request.getPersonalInfo().getName());
            personalInfo.setEmail(request.getPersonalInfo().getEmail());
            personalInfo.setPhone(request.getPersonalInfo().getPhone());
            personalInfo.setLocation(request.getPersonalInfo().getLocation());
            personalInfo.setSummary(request.getPersonalInfo().getSummary());
            cv.setPersonalInfo(personalInfo);
        }
        if (request.getExperiences() != null) {
            cv.setExperiences(request.getExperiences().stream()
                    .map(this::toExperienceEntity)
                    .collect(Collectors.toList()));
        }
        if (request.getEducations() != null) {
            cv.setEducations(request.getEducations().stream()
                    .map(this::toEducationEntity)
                    .collect(Collectors.toList()));
        }
        if (request.getSkills() != null) {
            cv.setSkills(request.getSkills().stream()
                    .map(this::toSkillEntity)
                    .collect(Collectors.toList()));
        }
        if (request.getProjects() != null) {
            cv.setProjects(request.getProjects().stream()
                    .map(this::toProjectEntity)
                    .collect(Collectors.toList()));
        }
    }

    private ExperienceDto toExperienceDto(Experience exp) {
        ExperienceDto dto = new ExperienceDto();
        dto.setId(exp.getId());
        dto.setCompany(exp.getCompany());
        dto.setRole(exp.getRole());
        dto.setStartDate(exp.getStartDate());
        dto.setEndDate(exp.getEndDate());
        dto.setDescription(exp.getDescription());
        return dto;
    }

    private Experience toExperienceEntity(ExperienceDto dto) {
        Experience exp = new Experience();
        if (dto.getId() != null) exp.setId(dto.getId());
        exp.setCompany(dto.getCompany());
        exp.setRole(dto.getRole());
        exp.setStartDate(dto.getStartDate());
        exp.setEndDate(dto.getEndDate());
        exp.setDescription(dto.getDescription());
        return exp;
    }

    private EducationDto toEducationDto(Education edu) {
        EducationDto dto = new EducationDto();
        dto.setId(edu.getId());
        dto.setInstitution(edu.getInstitution());
        dto.setDegree(edu.getDegree());
        dto.setField(edu.getField());
        dto.setGraduationYear(edu.getGraduationYear());
        return dto;
    }

    private Education toEducationEntity(EducationDto dto) {
        Education edu = new Education();
        if (dto.getId() != null) edu.setId(dto.getId());
        edu.setInstitution(dto.getInstitution());
        edu.setDegree(dto.getDegree());
        edu.setField(dto.getField());
        edu.setGraduationYear(dto.getGraduationYear());
        return edu;
    }

    private SkillDto toSkillDto(Skill skill) {
        SkillDto dto = new SkillDto();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        dto.setLevel(skill.getLevel());
        return dto;
    }

    private Skill toSkillEntity(SkillDto dto) {
        Skill skill = new Skill();
        if (dto.getId() != null) skill.setId(dto.getId());
        skill.setName(dto.getName());
        skill.setLevel(dto.getLevel());
        return skill;
    }

    private ProjectDto toProjectDto(Project proj) {
        ProjectDto dto = new ProjectDto();
        dto.setId(proj.getId());
        dto.setName(proj.getName());
        dto.setDescription(proj.getDescription());
        dto.setUrl(proj.getUrl());
        return dto;
    }

    private Project toProjectEntity(ProjectDto dto) {
        Project proj = new Project();
        if (dto.getId() != null) proj.setId(dto.getId());
        proj.setName(dto.getName());
        proj.setDescription(dto.getDescription());
        proj.setUrl(dto.getUrl());
        return proj;
    }
}