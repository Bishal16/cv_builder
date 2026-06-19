package com.cvbuilder.service;

import com.cvbuilder.dto.CreateCvRequest;
import com.cvbuilder.entity.Cv;
import com.cvbuilder.entity.User;
import com.cvbuilder.mapper.CvMapper;
import com.cvbuilder.repository.CvRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;

/**
 * Seeds a complete, ready-to-explore "John Doe" sample CV into a brand-new
 * account so the dashboard is never empty — a showcase + first-run experience.
 * The seeded CV is a normal, fully editable/deletable CV owned by the user.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SampleCvService {

    private final CvRepository cvRepository;
    private final CvMapper cvMapper;
    private final ObjectMapper objectMapper;

    @Value("${cvbuilder.seed-sample-cv:true}")
    private boolean seedEnabled;

    /**
     * Create the sample CV for a newly-created user. Best-effort: never let a
     * seeding failure break signup.
     */
    @Transactional
    public void seedForUser(User user) {
        if (!seedEnabled) {
            return;
        }
        try {
            CreateCvRequest request;
            try (InputStream in = new ClassPathResource("sample-cv.json").getInputStream()) {
                request = objectMapper.readValue(in, CreateCvRequest.class);
            }
            Cv cv = cvMapper.toEntity(request); // CREATE path assigns fresh child IDs
            cv.setUser(user);
            cvRepository.save(cv);
            log.info("Seeded sample CV for user {}", user.getId());
        } catch (Exception e) {
            // Non-fatal: the account is still usable, just without the sample.
            log.warn("Could not seed sample CV for user {}: {}", user.getId(), e.getMessage());
        }
    }
}
