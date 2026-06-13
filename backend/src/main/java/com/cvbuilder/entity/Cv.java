package com.cvbuilder.entity;

import com.cvbuilder.model.TemplateId;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "cvs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cv {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(255)")
    private TemplateId templateId;

    @Embedded
    private PersonalInfo personalInfo;

    // Customization (Phase 3) — optional per-CV overrides of the template defaults.
    @Column(name = "accent_color", length = 32)
    private String accentColor;

    @Column(name = "font_family", length = 16)
    private String fontFamily;

    @Column(name = "density", length = 16)
    private String density;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Experience> experiences = new LinkedHashSet<>();

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Education> educations = new LinkedHashSet<>();

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Skill> skills = new LinkedHashSet<>();

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Project> projects = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cv_section_order", joinColumns = @JoinColumn(name = "cv_id"))
    @Column(name = "section_key")
    @OrderColumn(name = "sort_index")
    @Builder.Default
    private List<String> sectionOrder = new ArrayList<>(List.of("personal", "experience", "education", "skills", "projects"));

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
