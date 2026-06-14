package com.cvbuilder.service;

import com.cvbuilder.dto.CvDto;
import com.cvbuilder.entity.Cv;
import com.cvbuilder.entity.ShareLink;
import com.cvbuilder.entity.User;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.mapper.CvMapper;
import com.cvbuilder.repository.CvRepository;
import com.cvbuilder.repository.ShareLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final ShareLinkRepository shareLinkRepository;
    private final CvRepository cvRepository;
    private final CvMapper cvMapper;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public String createOrEnableLink(UUID cvId) {
        Cv cv = cvRepository.findByIdAndUser(cvId, getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found or access denied"));

        Optional<ShareLink> existing = shareLinkRepository.findByCvId(cvId);
        if (existing.isPresent()) {
            ShareLink link = existing.get();
            link.setEnabled(true);
            shareLinkRepository.save(link);
            return link.getToken();
        }

        ShareLink link = ShareLink.builder()
                .cv(cv)
                .token(UUID.randomUUID().toString())
                .enabled(true)
                .build();
        shareLinkRepository.save(link);
        return link.getToken();
    }

    public void disableLink(UUID cvId) {
        cvRepository.findByIdAndUser(cvId, getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found or access denied"));

        shareLinkRepository.findByCvId(cvId).ifPresent(link -> {
            link.setEnabled(false);
            shareLinkRepository.save(link);
        });
    }

    public Optional<String> getActiveToken(UUID cvId) {
        cvRepository.findByIdAndUser(cvId, getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found or access denied"));

        return shareLinkRepository.findByCvId(cvId)
                .filter(ShareLink::isEnabled)
                .map(ShareLink::getToken);
    }

    public CvDto getPublicCv(String token) {
        ShareLink link = shareLinkRepository.findByToken(token)
                .filter(ShareLink::isEnabled)
                .orElseThrow(() -> new ResourceNotFoundException("Share link not found or disabled"));
        return cvMapper.toDto(link.getCv());
    }
}
