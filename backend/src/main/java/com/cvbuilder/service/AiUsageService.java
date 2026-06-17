package com.cvbuilder.service;

import com.cvbuilder.dto.AiUsageStatus;
import com.cvbuilder.entity.AiUsageWindow;
import com.cvbuilder.repository.AiUsageWindowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Tracks app-wide AI usage as a fixed window anchored to first use (Claude-style):
 * the first call starts the window, subsequent calls increment it, and once the
 * window expires the next call resets it. Powers the Settings usage meter.
 */
@Service
@RequiredArgsConstructor
public class AiUsageService {

    private final AiUsageWindowRepository repository;

    @Value("${llm.usage.limit:50}")
    private int limit;

    @Value("${llm.usage.window-hours:24}")
    private int windowHours;

    /** Count one successful AI request. Resets the window if it has expired. */
    @Transactional
    public void record() {
        AiUsageWindow w = repository.findById(Boolean.TRUE).orElseGet(() ->
                AiUsageWindow.builder().id(Boolean.TRUE).windowStart(null).requestCount(0).build());

        LocalDateTime now = LocalDateTime.now();
        if (isExpired(w, now)) {
            w.setWindowStart(now);
            w.setRequestCount(1);
        } else {
            w.setRequestCount(w.getRequestCount() + 1);
        }
        repository.save(w);
    }

    @Transactional(readOnly = true)
    public AiUsageStatus getStatus() {
        AiUsageWindow w = repository.findById(Boolean.TRUE).orElse(null);
        LocalDateTime now = LocalDateTime.now();

        if (w == null || isExpired(w, now)) {
            // No active window — full quota, no countdown yet.
            return new AiUsageStatus(0, limit, limit, null, windowHours);
        }
        int used = w.getRequestCount();
        LocalDateTime resetsAt = w.getWindowStart().plusHours(windowHours);
        return new AiUsageStatus(used, limit, Math.max(0, limit - used), resetsAt, windowHours);
    }

    /** True if the limit for the current window has been reached. */
    @Transactional(readOnly = true)
    public boolean isLimitReached() {
        AiUsageWindow w = repository.findById(Boolean.TRUE).orElse(null);
        if (w == null || isExpired(w, LocalDateTime.now())) return false;
        return w.getRequestCount() >= limit;
    }

    private boolean isExpired(AiUsageWindow w, LocalDateTime now) {
        return w.getWindowStart() == null || now.isAfter(w.getWindowStart().plusHours(windowHours));
    }
}
