package com.cvbuilder.service;

import com.cvbuilder.dto.CreateCvRequest;
import com.cvbuilder.dto.CvDto;
import com.cvbuilder.dto.UpdateCvRequest;
import com.cvbuilder.entity.Cv;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.mapper.CvMapper;
import com.cvbuilder.repository.CvRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CvService {

    private final CvRepository cvRepository;
    private final CvMapper cvMapper;

    public CvService(CvRepository cvRepository, CvMapper cvMapper) {
        this.cvRepository = cvRepository;
        this.cvMapper = cvMapper;
    }

    public CvDto createCv(CreateCvRequest request) {
        Cv cv = cvMapper.toEntity(request);
        Cv savedCv = cvRepository.save(cv);
        return cvMapper.toDto(savedCv);
    }

    public CvDto getCvById(UUID id) {
        Cv cv = cvRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found with id: " + id));
        return cvMapper.toDto(cv);
    }

    public List<CvDto> getAllCvs() {
        return cvRepository.findAll().stream()
                .map(cvMapper::toDto)
                .collect(Collectors.toList());
    }

    public CvDto updateCv(UUID id, UpdateCvRequest request) {
        Cv cv = cvRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found with id: " + id));
        
        cvMapper.updateEntityFromRequest(request, cv);
        Cv updatedCv = cvRepository.save(cv);
        return cvMapper.toDto(updatedCv);
    }

    public void deleteCv(UUID id) {
        if (!cvRepository.existsById(id)) {
            throw new ResourceNotFoundException("CV not found with id: " + id);
        }
        cvRepository.deleteById(id);
    }
}