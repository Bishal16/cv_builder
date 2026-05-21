package com.cvbuilder.service;

import com.cvbuilder.dto.CreateCvRequest;
import com.cvbuilder.dto.CvDto;
import com.cvbuilder.dto.UpdateCvRequest;
import com.cvbuilder.entity.Cv;
import com.cvbuilder.entity.User;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.mapper.CvMapper;
import com.cvbuilder.repository.CvRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CvService {

    private final CvRepository cvRepository;
    private final CvMapper cvMapper;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Transactional
    public CvDto createCv(CreateCvRequest request) {
        Cv cv = cvMapper.toEntity(request);
        cv.setUser(getCurrentUser());
        Cv savedCv = cvRepository.save(cv);
        return cvMapper.toDto(savedCv);
    }

    public CvDto getCvById(UUID id) {
        Cv cv = cvRepository.findByIdAndUser(id, getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found or access denied"));
        return cvMapper.toDto(cv);
    }

    public List<CvDto> getAllCvs() {
        return cvRepository.findAllByUserOrderByUpdatedAtDesc(getCurrentUser()).stream()
                .map(cvMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CvDto updateCv(UUID id, UpdateCvRequest request) {
        Cv cv = cvRepository.findByIdAndUser(id, getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found or access denied"));
        
        cvMapper.updateEntityFromRequest(request, cv);
        Cv updatedCv = cvRepository.save(cv);
        return cvMapper.toDto(updatedCv);
    }

    @Transactional
    public void deleteCv(UUID id) {
        Cv cv = cvRepository.findByIdAndUser(id, getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found or access denied"));
        cvRepository.delete(cv);
    }
}
