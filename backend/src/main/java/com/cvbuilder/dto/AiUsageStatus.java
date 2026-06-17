package com.cvbuilder.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiUsageStatus {
    private int used;
    private int limit;
    private int remaining;
    /** When the current window expires; null when no window is active yet. */
    private LocalDateTime resetsAt;
    private int windowHours;
}
