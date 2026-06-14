package com.cvbuilder.mapper;

import com.cvbuilder.dto.*;
import com.cvbuilder.entity.*;
import com.cvbuilder.model.SkillLevel;
import com.cvbuilder.model.TemplateId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure unit tests for {@link CvMapper}. No Spring context, no mocks — the mapper is a
 * stateless POJO, so we instantiate it directly.
 */
class CvMapperTest {

    private CvMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new CvMapper();
    }

    // ---------------------------------------------------------------------
    // toEntity(CreateCvRequest)
    // ---------------------------------------------------------------------

    @Test
    void toEntity_mapsScalarAndCustomizationFields() {
        CreateCvRequest request = CreateCvRequest.builder()
                .title("My Resume")
                .templateId(TemplateId.MODERN)
                .accentColor("#ff0000")
                .fontFamily("serif")
                .density("compact")
                .build();

        Cv cv = mapper.toEntity(request);

        assertThat(cv.getTitle()).isEqualTo("My Resume");
        assertThat(cv.getTemplateId()).isEqualTo(TemplateId.MODERN);
        assertThat(cv.getAccentColor()).isEqualTo("#ff0000");
        assertThat(cv.getFontFamily()).isEqualTo("serif");
        assertThat(cv.getDensity()).isEqualTo("compact");
    }

    @Test
    void toEntity_mapsPersonalInfoIncludingPhotoUrl() {
        PersonalInfoDto pi = PersonalInfoDto.builder()
                .name("Ada Lovelace")
                .email("ada@example.com")
                .phone("123-456")
                .location("London")
                .linkedinUrl("https://linkedin.com/in/ada")
                .githubUrl("https://github.com/ada")
                .summary("<p>Pioneer</p>")
                .photoUrl("https://cdn.example.com/ada.png")
                .build();
        CreateCvRequest request = CreateCvRequest.builder()
                .title("t").templateId(TemplateId.CLASSIC).personalInfo(pi).build();

        PersonalInfo result = mapper.toEntity(request).getPersonalInfo();

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Ada Lovelace");
        assertThat(result.getEmail()).isEqualTo("ada@example.com");
        assertThat(result.getPhone()).isEqualTo("123-456");
        assertThat(result.getLocation()).isEqualTo("London");
        assertThat(result.getLinkedinUrl()).isEqualTo("https://linkedin.com/in/ada");
        assertThat(result.getGithubUrl()).isEqualTo("https://github.com/ada");
        assertThat(result.getSummary()).isEqualTo("<p>Pioneer</p>");
        assertThat(result.getPhotoUrl()).isEqualTo("https://cdn.example.com/ada.png");
    }

    @Test
    void toEntity_mapsAllNestedCollectionFields() {
        ExperienceDto exp = ExperienceDto.builder()
                .company("Acme").role("Engineer")
                .startDate("2020").endDate("2022")
                .description("<p>Built things</p>").build();
        EducationDto edu = EducationDto.builder()
                .institution("MIT").degree("BSc").field("CS").graduationYear(2019).build();
        SkillDto skill = SkillDto.builder()
                .name("Java").category("Backend").level(SkillLevel.EXPERT).build();
        ProjectDto proj = ProjectDto.builder()
                .name("OpenSource").description("<p>desc</p>").url("https://x.test").build();

        CreateCvRequest request = CreateCvRequest.builder()
                .title("t").templateId(TemplateId.ATS)
                .experiences(List.of(exp))
                .educations(List.of(edu))
                .skills(List.of(skill))
                .projects(List.of(proj))
                .build();

        Cv cv = mapper.toEntity(request);

        assertThat(cv.getExperiences()).hasSize(1);
        Experience e = cv.getExperiences().iterator().next();
        assertThat(e.getCompany()).isEqualTo("Acme");
        assertThat(e.getRole()).isEqualTo("Engineer");
        assertThat(e.getStartDate()).isEqualTo("2020");
        assertThat(e.getEndDate()).isEqualTo("2022");
        assertThat(e.getDescription()).isEqualTo("<p>Built things</p>");
        assertThat(e.getCv()).isSameAs(cv);

        assertThat(cv.getEducations()).hasSize(1);
        Education ed = cv.getEducations().iterator().next();
        assertThat(ed.getInstitution()).isEqualTo("MIT");
        assertThat(ed.getDegree()).isEqualTo("BSc");
        assertThat(ed.getField()).isEqualTo("CS");
        assertThat(ed.getGraduationYear()).isEqualTo(2019);
        assertThat(ed.getCv()).isSameAs(cv);

        assertThat(cv.getSkills()).hasSize(1);
        Skill s = cv.getSkills().iterator().next();
        assertThat(s.getName()).isEqualTo("Java");
        assertThat(s.getCategory()).isEqualTo("Backend");
        assertThat(s.getLevel()).isEqualTo(SkillLevel.EXPERT);
        assertThat(s.getCv()).isSameAs(cv);

        assertThat(cv.getProjects()).hasSize(1);
        Project p = cv.getProjects().iterator().next();
        assertThat(p.getName()).isEqualTo("OpenSource");
        assertThat(p.getDescription()).isEqualTo("<p>desc</p>");
        assertThat(p.getUrl()).isEqualTo("https://x.test");
        assertThat(p.getCv()).isSameAs(cv);
    }

    @Test
    void toEntity_dropsIncomingChildIdsOnCreate() {
        UUID expId = UUID.randomUUID();
        UUID eduId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        UUID projId = UUID.randomUUID();

        CreateCvRequest request = CreateCvRequest.builder()
                .title("t").templateId(TemplateId.PRO)
                .experiences(List.of(ExperienceDto.builder().id(expId).company("c").role("r").build()))
                .educations(List.of(EducationDto.builder().id(eduId).institution("i").build()))
                .skills(List.of(SkillDto.builder().id(skillId).name("n").build()))
                .projects(List.of(ProjectDto.builder().id(projId).name("p").build()))
                .build();

        Cv cv = mapper.toEntity(request);

        assertThat(cv.getExperiences().iterator().next().getId()).isNull();
        assertThat(cv.getEducations().iterator().next().getId()).isNull();
        assertThat(cv.getSkills().iterator().next().getId()).isNull();
        assertThat(cv.getProjects().iterator().next().getId()).isNull();
    }

    // ---------------------------------------------------------------------
    // updateEntityFromRequest(UpdateCvRequest, Cv)
    // ---------------------------------------------------------------------

    @Test
    void updateEntityFromRequest_preservesIncomingChildIds() {
        Cv cv = new Cv(); // collections default to empty LinkedHashSets

        UUID expId = UUID.randomUUID();
        UUID eduId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        UUID projId = UUID.randomUUID();

        UpdateCvRequest request = UpdateCvRequest.builder()
                .experiences(List.of(ExperienceDto.builder().id(expId).company("c").role("r").build()))
                .educations(List.of(EducationDto.builder().id(eduId).institution("i").build()))
                .skills(List.of(SkillDto.builder().id(skillId).name("n").build()))
                .projects(List.of(ProjectDto.builder().id(projId).name("p").build()))
                .build();

        mapper.updateEntityFromRequest(request, cv);

        assertThat(cv.getExperiences().iterator().next().getId()).isEqualTo(expId);
        assertThat(cv.getEducations().iterator().next().getId()).isEqualTo(eduId);
        assertThat(cv.getSkills().iterator().next().getId()).isEqualTo(skillId);
        assertThat(cv.getProjects().iterator().next().getId()).isEqualTo(projId);
    }

    @Test
    void updateEntityFromRequest_onlyOverwritesPresentFields() {
        Cv cv = new Cv();
        cv.setTitle("Original");
        cv.setTemplateId(TemplateId.CLASSIC);
        cv.setAccentColor("#000000");

        // Only title provided; other fields left null -> should be untouched.
        UpdateCvRequest request = UpdateCvRequest.builder().title("Changed").build();

        mapper.updateEntityFromRequest(request, cv);

        assertThat(cv.getTitle()).isEqualTo("Changed");
        assertThat(cv.getTemplateId()).isEqualTo(TemplateId.CLASSIC);
        assertThat(cv.getAccentColor()).isEqualTo("#000000");
    }

    @Test
    void updateEntityFromRequest_blankCustomizationClearsValueToNull() {
        Cv cv = new Cv();
        cv.setAccentColor("#abcabc");
        cv.setFontFamily("serif");
        cv.setDensity("compact");

        UpdateCvRequest request = UpdateCvRequest.builder()
                .accentColor("").fontFamily("   ").density("").build();

        mapper.updateEntityFromRequest(request, cv);

        assertThat(cv.getAccentColor()).isNull();
        assertThat(cv.getFontFamily()).isNull();
        assertThat(cv.getDensity()).isNull();
    }

    // ---------------------------------------------------------------------
    // toDto(Cv) round-trip
    // ---------------------------------------------------------------------

    @Test
    void toDto_roundTripsAllFields() {
        UUID cvId = UUID.randomUUID();
        UUID expId = UUID.randomUUID();
        UUID eduId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        UUID projId = UUID.randomUUID();

        PersonalInfo pi = PersonalInfo.builder()
                .name("Ada").email("ada@x.test").phone("1").location("L")
                .linkedinUrl("li").githubUrl("gh").summary("<p>s</p>")
                .photoUrl("https://cdn/p.png").build();

        Cv cv = new Cv();
        cv.setId(cvId);
        cv.setTitle("Title");
        cv.setTemplateId(TemplateId.MINIMAL);
        cv.setAccentColor("#123456");
        cv.setFontFamily("mono");
        cv.setDensity("relaxed");
        cv.setPersonalInfo(pi);

        Experience exp = Experience.builder().id(expId).company("Acme").role("Eng")
                .startDate("2020").endDate("2021").description("<p>d</p>").cv(cv).build();
        Education edu = Education.builder().id(eduId).institution("MIT").degree("BSc")
                .field("CS").graduationYear(2018).cv(cv).build();
        Skill skill = Skill.builder().id(skillId).name("Java").category("BE")
                .level(SkillLevel.ADVANCED).cv(cv).build();
        Project proj = Project.builder().id(projId).name("Proj").description("<p>pd</p>")
                .url("https://p.test").cv(cv).build();

        cv.getExperiences().add(exp);
        cv.getEducations().add(edu);
        cv.getSkills().add(skill);
        cv.getProjects().add(proj);

        CvDto dto = mapper.toDto(cv);

        assertThat(dto.getId()).isEqualTo(cvId);
        assertThat(dto.getTitle()).isEqualTo("Title");
        assertThat(dto.getTemplateId()).isEqualTo(TemplateId.MINIMAL);
        assertThat(dto.getAccentColor()).isEqualTo("#123456");
        assertThat(dto.getFontFamily()).isEqualTo("mono");
        assertThat(dto.getDensity()).isEqualTo("relaxed");

        PersonalInfoDto piDto = dto.getPersonalInfo();
        assertThat(piDto.getName()).isEqualTo("Ada");
        assertThat(piDto.getEmail()).isEqualTo("ada@x.test");
        assertThat(piDto.getSummary()).isEqualTo("<p>s</p>");
        assertThat(piDto.getPhotoUrl()).isEqualTo("https://cdn/p.png");

        assertThat(dto.getExperiences()).hasSize(1);
        assertThat(dto.getExperiences().get(0).getId()).isEqualTo(expId);
        assertThat(dto.getExperiences().get(0).getCompany()).isEqualTo("Acme");
        assertThat(dto.getExperiences().get(0).getDescription()).isEqualTo("<p>d</p>");

        assertThat(dto.getEducations()).hasSize(1);
        assertThat(dto.getEducations().get(0).getId()).isEqualTo(eduId);
        assertThat(dto.getEducations().get(0).getGraduationYear()).isEqualTo(2018);

        assertThat(dto.getSkills()).hasSize(1);
        assertThat(dto.getSkills().get(0).getId()).isEqualTo(skillId);
        assertThat(dto.getSkills().get(0).getLevel()).isEqualTo(SkillLevel.ADVANCED);

        assertThat(dto.getProjects()).hasSize(1);
        assertThat(dto.getProjects().get(0).getId()).isEqualTo(projId);
        assertThat(dto.getProjects().get(0).getUrl()).isEqualTo("https://p.test");
    }

    @Test
    void toDto_returnsNullForNullInput() {
        assertThat(mapper.toDto(null)).isNull();
    }

    // ---------------------------------------------------------------------
    // normalizeSectionOrder (exercised via toEntity)
    // ---------------------------------------------------------------------

    @Test
    void normalizeSectionOrder_fillsDefaultsWhenRequestOrderIsNull() {
        CreateCvRequest request = CreateCvRequest.builder()
                .title("t").templateId(TemplateId.CLASSIC).sectionOrder(null).build();

        Cv cv = mapper.toEntity(request);

        assertThat(cv.getSectionOrder())
                .containsExactly("personal", "experience", "education", "skills", "projects",
                        "certifications", "languages", "awards");
    }

    @Test
    void normalizeSectionOrder_honorsPartialOrderThenAppendsMissingDefaults() {
        CreateCvRequest request = CreateCvRequest.builder()
                .title("t").templateId(TemplateId.CLASSIC)
                .sectionOrder(List.of("skills", "personal"))
                .build();

        Cv cv = mapper.toEntity(request);

        // provided-and-valid first (in given order), then remaining defaults in canonical order
        assertThat(cv.getSectionOrder())
                .containsExactly("skills", "personal", "experience", "education", "projects",
                        "certifications", "languages", "awards");
    }

    @Test
    void normalizeSectionOrder_dropsUnknownAndDuplicateKeys() {
        CreateCvRequest request = CreateCvRequest.builder()
                .title("t").templateId(TemplateId.CLASSIC)
                .sectionOrder(List.of("bogus", "skills", "skills", "experience"))
                .build();

        Cv cv = mapper.toEntity(request);

        assertThat(cv.getSectionOrder())
                .containsExactly("skills", "experience", "personal", "education", "projects",
                        "certifications", "languages", "awards");
    }
}
