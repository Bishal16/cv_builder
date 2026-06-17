package com.cvbuilder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Singleton row (id is always TRUE) tracking the app-wide AI request window.
 * Used to power the daily-usage meter against the shared free-tier limit.
 */
@Entity
@Table(name = "ai_usage_window")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiUsageWindow {

    @Id
    private Boolean id;

    private LocalDateTime windowStart;

    @Column(nullable = false)
    private int requestCount;
}
