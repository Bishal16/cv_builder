package com.cvbuilder.repository;

import com.cvbuilder.entity.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShareLinkRepository extends JpaRepository<ShareLink, UUID> {

    Optional<ShareLink> findByToken(String token);

    Optional<ShareLink> findByCvId(UUID cvId);
}
