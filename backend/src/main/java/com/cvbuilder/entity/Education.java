package com.cvbuilder.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "educations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Education {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String institution;

    private String degree;

    private String field;

    private Integer graduationYear;

    @ManyToOne
    @JoinColumn(name = "cv_id")
    private Cv cv;
}
