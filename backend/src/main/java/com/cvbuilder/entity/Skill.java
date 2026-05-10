package com.cvbuilder.entity;

import com.cvbuilder.model.SkillLevel;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "skills")
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private SkillLevel level;

    @ManyToOne
    @JoinColumn(name = "cv_id")
    private Cv cv;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public SkillLevel getLevel() { return level; }
    public void setLevel(SkillLevel level) { this.level = level; }
    public Cv getCv() { return cv; }
    public void setCv(Cv cv) { this.cv = cv; }
}