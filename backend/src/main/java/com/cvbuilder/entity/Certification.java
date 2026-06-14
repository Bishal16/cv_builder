package com.cvbuilder.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "certifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String issuer;
    private String issueDate;
    private String expiryDate;

    @ManyToOne
    @JoinColumn(name = "cv_id")
    private Cv cv;
}
