package com.cvbuilder.mapper;

import com.cvbuilder.dto.*;
import com.cvbuilder.entity.*;
import com.cvbuilder.entity.Award;
import com.cvbuilder.entity.Certification;
import com.cvbuilder.entity.Language;
import com.cvbuilder.service.HtmlSanitizerService;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Comparator;

@Component
public class CvMapper {

    private static final List<String> DEFAULT_SECTION_ORDER = List.of(
            "personal", "experience", "education", "skills", "projects",
            "certifications", "languages", "awards");

    private final HtmlSanitizerService sanitizer;

    public CvMapper(HtmlSanitizerService sanitizer) {
        this.sanitizer = sanitizer;
    }

    public CvMapper() {
        this.sanitizer = new HtmlSanitizerService();
    }

    public CvDto toDto(Cv cv) {
        if (cv == null) return null;
        
        CvDto dto = new CvDto();
        dto.setId(cv.getId());
        dto.setTitle(cv.getTitle());
        dto.setTemplateId(cv.getTemplateId());
        dto.setSectionOrder(normalizeSectionOrder(cv.getSectionOrder()));
        dto.setAccentColor(cv.getAccentColor());
        dto.setFontFamily(cv.getFontFamily());
        dto.setDensity(cv.getDensity());
        dto.setCreatedAt(cv.getCreatedAt());
        dto.setUpdatedAt(cv.getUpdatedAt());

        if (cv.getPersonalInfo() != null) {
            PersonalInfoDto personalInfo = new PersonalInfoDto();
            personalInfo.setName(cv.getPersonalInfo().getName());
            personalInfo.setEmail(cv.getPersonalInfo().getEmail());
            personalInfo.setPhone(cv.getPersonalInfo().getPhone());
            personalInfo.setLocation(cv.getPersonalInfo().getLocation());
            personalInfo.setLinkedinUrl(cv.getPersonalInfo().getLinkedinUrl());
            personalInfo.setGithubUrl(cv.getPersonalInfo().getGithubUrl());
            personalInfo.setSummary(cv.getPersonalInfo().getSummary());
            personalInfo.setPhotoUrl(cv.getPersonalInfo().getPhotoUrl());
            dto.setPersonalInfo(personalInfo);
        }
        
        if (cv.getExperiences() != null) {
            dto.setExperiences(cv.getExperiences().stream()
                    .sorted(Comparator.comparing(Experience::getId))
                    .map(this::toExperienceDto)
                    .collect(Collectors.toList()));
        }

        if (cv.getEducations() != null) {
            dto.setEducations(cv.getEducations().stream()
                    .sorted(Comparator.comparing(Education::getId))
                    .map(this::toEducationDto)
                    .collect(Collectors.toList()));
        }

        if (cv.getSkills() != null) {
            dto.setSkills(cv.getSkills().stream()
                    .sorted(Comparator.comparing(Skill::getId))
                    .map(this::toSkillDto)
                    .collect(Collectors.toList()));
        }

        if (cv.getProjects() != null) {
            dto.setProjects(cv.getProjects().stream()
                    .sorted(Comparator.comparing(Project::getId))
                    .map(this::toProjectDto)
                    .collect(Collectors.toList()));
        }

        if (cv.getCertifications() != null) {
            dto.setCertifications(cv.getCertifications().stream()
                    .sorted(Comparator.comparing(Certification::getId))
                    .map(this::toCertificationDto)
                    .collect(Collectors.toList()));
        }

        if (cv.getLanguages() != null) {
            dto.setLanguages(cv.getLanguages().stream()
                    .sorted(Comparator.comparing(Language::getId))
                    .map(this::toLanguageDto)
                    .collect(Collectors.toList()));
        }

        if (cv.getAwards() != null) {
            dto.setAwards(cv.getAwards().stream()
                    .sorted(Comparator.comparing(Award::getId))
                    .map(this::toAwardDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Cv toEntity(CreateCvRequest request) {
        if (request == null) return null;
        
        Cv cv = new Cv();
        cv.setTitle(request.getTitle());
        cv.setTemplateId(request.getTemplateId());
        cv.setSectionOrder(normalizeSectionOrder(request.getSectionOrder()));
        cv.setAccentColor(request.getAccentColor());
        cv.setFontFamily(request.getFontFamily());
        cv.setDensity(request.getDensity());

        if (request.getPersonalInfo() != null) {
            PersonalInfo personalInfo = new PersonalInfo();
            personalInfo.setName(request.getPersonalInfo().getName());
            personalInfo.setEmail(request.getPersonalInfo().getEmail());
            personalInfo.setPhone(request.getPersonalInfo().getPhone());
            personalInfo.setLocation(request.getPersonalInfo().getLocation());
            personalInfo.setLinkedinUrl(request.getPersonalInfo().getLinkedinUrl());
            personalInfo.setGithubUrl(request.getPersonalInfo().getGithubUrl());
            personalInfo.setSummary(sanitizer.sanitize(request.getPersonalInfo().getSummary()));
            personalInfo.setPhotoUrl(request.getPersonalInfo().getPhotoUrl());
            cv.setPersonalInfo(personalInfo);
        }

        // NOTE: incoming child IDs are intentionally dropped on CREATE.
        // The new Cv is persisted (not merged); children with preset IDs would
        // be treated as detached entities by Hibernate and fail the cascade.
        // Fresh IDs are generated by @GeneratedValue and returned in the response.
        if (request.getExperiences() != null) {
            cv.setExperiences(request.getExperiences().stream()
                    .map(dto -> toExperienceEntity(dto, cv, false))
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
        }

        if (request.getEducations() != null) {
            cv.setEducations(request.getEducations().stream()
                    .map(dto -> toEducationEntity(dto, cv, false))
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
        }

        if (request.getSkills() != null) {
            cv.setSkills(request.getSkills().stream()
                    .map(dto -> toSkillEntity(dto, cv, false))
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
        }

        if (request.getProjects() != null) {
            cv.setProjects(request.getProjects().stream()
                    .map(dto -> toProjectEntity(dto, cv, false))
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
        }

        if (request.getCertifications() != null) {
            cv.setCertifications(request.getCertifications().stream()
                    .map(dto -> toCertificationEntity(dto, cv, false))
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
        }

        if (request.getLanguages() != null) {
            cv.setLanguages(request.getLanguages().stream()
                    .map(dto -> toLanguageEntity(dto, cv, false))
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
        }

        if (request.getAwards() != null) {
            cv.setAwards(request.getAwards().stream()
                    .map(dto -> toAwardEntity(dto, cv, false))
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
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
        if (request.getSectionOrder() != null) {
            cv.setSectionOrder(normalizeSectionOrder(request.getSectionOrder()));
        }
        // Customization: only overwrite when the field is present in the request.
        if (request.getAccentColor() != null) {
            cv.setAccentColor(request.getAccentColor().isBlank() ? null : request.getAccentColor());
        }
        if (request.getFontFamily() != null) {
            cv.setFontFamily(request.getFontFamily().isBlank() ? null : request.getFontFamily());
        }
        if (request.getDensity() != null) {
            cv.setDensity(request.getDensity().isBlank() ? null : request.getDensity());
        }
        if (request.getPersonalInfo() != null) {
            PersonalInfo personalInfo = new PersonalInfo();
            personalInfo.setName(request.getPersonalInfo().getName());
            personalInfo.setEmail(request.getPersonalInfo().getEmail());
            personalInfo.setPhone(request.getPersonalInfo().getPhone());
            personalInfo.setLocation(request.getPersonalInfo().getLocation());
            personalInfo.setLinkedinUrl(request.getPersonalInfo().getLinkedinUrl());
            personalInfo.setGithubUrl(request.getPersonalInfo().getGithubUrl());
            personalInfo.setSummary(sanitizer.sanitize(request.getPersonalInfo().getSummary()));
            personalInfo.setPhotoUrl(request.getPersonalInfo().getPhotoUrl());
            cv.setPersonalInfo(personalInfo);
        }
        if (request.getExperiences() != null) {
            cv.getExperiences().clear();
            cv.getExperiences().addAll(request.getExperiences().stream()
                    .map(dto -> toExperienceEntity(dto, cv))
                    .collect(Collectors.toList()));
        }
        if (request.getEducations() != null) {
            cv.getEducations().clear();
            cv.getEducations().addAll(request.getEducations().stream()
                    .map(dto -> toEducationEntity(dto, cv))
                    .collect(Collectors.toList()));
        }
        if (request.getSkills() != null) {
            cv.getSkills().clear();
            cv.getSkills().addAll(request.getSkills().stream()
                    .map(dto -> toSkillEntity(dto, cv))
                    .collect(Collectors.toList()));
        }
        if (request.getProjects() != null) {
            cv.getProjects().clear();
            cv.getProjects().addAll(request.getProjects().stream()
                    .map(dto -> toProjectEntity(dto, cv))
                    .collect(Collectors.toList()));
        }
        if (request.getCertifications() != null) {
            cv.getCertifications().clear();
            cv.getCertifications().addAll(request.getCertifications().stream()
                    .map(dto -> toCertificationEntity(dto, cv))
                    .collect(Collectors.toList()));
        }
        if (request.getLanguages() != null) {
            cv.getLanguages().clear();
            cv.getLanguages().addAll(request.getLanguages().stream()
                    .map(dto -> toLanguageEntity(dto, cv))
                    .collect(Collectors.toList()));
        }
        if (request.getAwards() != null) {
            cv.getAwards().clear();
            cv.getAwards().addAll(request.getAwards().stream()
                    .map(dto -> toAwardEntity(dto, cv))
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

    private Experience toExperienceEntity(ExperienceDto dto, Cv cv) {
        return toExperienceEntity(dto, cv, true);
    }

    private Experience toExperienceEntity(ExperienceDto dto, Cv cv, boolean preserveId) {
        Experience exp = new Experience();
        if (preserveId && dto.getId() != null) exp.setId(dto.getId());
        exp.setCompany(dto.getCompany());
        exp.setRole(dto.getRole());
        exp.setStartDate(dto.getStartDate());
        exp.setEndDate(dto.getEndDate());
        exp.setDescription(sanitizer.sanitize(dto.getDescription()));
        exp.setCv(cv);
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

    private Education toEducationEntity(EducationDto dto, Cv cv) {
        return toEducationEntity(dto, cv, true);
    }

    private Education toEducationEntity(EducationDto dto, Cv cv, boolean preserveId) {
        Education edu = new Education();
        if (preserveId && dto.getId() != null) edu.setId(dto.getId());
        edu.setInstitution(dto.getInstitution());
        edu.setDegree(dto.getDegree());
        edu.setField(dto.getField());
        edu.setGraduationYear(dto.getGraduationYear());
        edu.setCv(cv);
        return edu;
    }

    private SkillDto toSkillDto(Skill skill) {
        SkillDto dto = new SkillDto();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        dto.setCategory(skill.getCategory());
        dto.setLevel(skill.getLevel());
        return dto;
    }

    private Skill toSkillEntity(SkillDto dto, Cv cv) {
        return toSkillEntity(dto, cv, true);
    }

    private Skill toSkillEntity(SkillDto dto, Cv cv, boolean preserveId) {
        Skill skill = new Skill();
        if (preserveId && dto.getId() != null) skill.setId(dto.getId());
        skill.setName(dto.getName());
        skill.setCategory(dto.getCategory());
        skill.setLevel(dto.getLevel());
        skill.setCv(cv);
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

    private Project toProjectEntity(ProjectDto dto, Cv cv) {
        return toProjectEntity(dto, cv, true);
    }

    private Project toProjectEntity(ProjectDto dto, Cv cv, boolean preserveId) {
        Project proj = new Project();
        if (preserveId && dto.getId() != null) proj.setId(dto.getId());
        proj.setName(dto.getName());
        proj.setDescription(sanitizer.sanitize(dto.getDescription()));
        proj.setUrl(dto.getUrl());
        proj.setCv(cv);
        return proj;
    }

    private CertificationDto toCertificationDto(Certification cert) {
        CertificationDto dto = new CertificationDto();
        dto.setId(cert.getId());
        dto.setName(cert.getName());
        dto.setIssuer(cert.getIssuer());
        dto.setIssueDate(cert.getIssueDate());
        dto.setExpiryDate(cert.getExpiryDate());
        return dto;
    }

    private Certification toCertificationEntity(CertificationDto dto, Cv cv) {
        return toCertificationEntity(dto, cv, true);
    }

    private Certification toCertificationEntity(CertificationDto dto, Cv cv, boolean preserveId) {
        Certification cert = new Certification();
        if (preserveId && dto.getId() != null) cert.setId(dto.getId());
        cert.setName(dto.getName());
        cert.setIssuer(dto.getIssuer());
        cert.setIssueDate(dto.getIssueDate());
        cert.setExpiryDate(dto.getExpiryDate());
        cert.setCv(cv);
        return cert;
    }

    private LanguageDto toLanguageDto(Language lang) {
        LanguageDto dto = new LanguageDto();
        dto.setId(lang.getId());
        dto.setName(lang.getName());
        dto.setProficiency(lang.getProficiency());
        return dto;
    }

    private Language toLanguageEntity(LanguageDto dto, Cv cv) {
        return toLanguageEntity(dto, cv, true);
    }

    private Language toLanguageEntity(LanguageDto dto, Cv cv, boolean preserveId) {
        Language lang = new Language();
        if (preserveId && dto.getId() != null) lang.setId(dto.getId());
        lang.setName(dto.getName());
        lang.setProficiency(dto.getProficiency());
        lang.setCv(cv);
        return lang;
    }

    private AwardDto toAwardDto(Award award) {
        AwardDto dto = new AwardDto();
        dto.setId(award.getId());
        dto.setTitle(award.getTitle());
        dto.setIssuer(award.getIssuer());
        dto.setDate(award.getDate());
        dto.setDescription(award.getDescription());
        return dto;
    }

    private Award toAwardEntity(AwardDto dto, Cv cv) {
        return toAwardEntity(dto, cv, true);
    }

    private Award toAwardEntity(AwardDto dto, Cv cv, boolean preserveId) {
        Award award = new Award();
        if (preserveId && dto.getId() != null) award.setId(dto.getId());
        award.setTitle(dto.getTitle());
        award.setIssuer(dto.getIssuer());
        award.setDate(dto.getDate());
        award.setDescription(dto.getDescription());
        award.setCv(cv);
        return award;
    }

    private List<String> normalizeSectionOrder(List<String> sectionOrder) {
        List<String> normalized = new ArrayList<>();
        if (sectionOrder != null) {
            for (String section : sectionOrder) {
                if (DEFAULT_SECTION_ORDER.contains(section) && !normalized.contains(section)) {
                    normalized.add(section);
                }
            }
        }
        for (String section : DEFAULT_SECTION_ORDER) {
            if (!normalized.contains(section)) {
                normalized.add(section);
            }
        }
        return normalized;
    }
}