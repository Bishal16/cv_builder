package com.cvbuilder.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "educations")
public class Education {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String institution;

    @Column(nullable = false)
    private String degree;

    private String field;

    private Integer graduationYear;

    @ManyToOne
    @JoinColumn(name = "cv_id")
    private Cv cv;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public String getField() { return field; }
    public void setField(String field) { this.field = field; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public Cv getCv() { return cv; }
    public void setCv(Cv cv) { this.cv = cv; }
}