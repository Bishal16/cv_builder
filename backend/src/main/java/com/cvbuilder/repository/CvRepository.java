package com.cvbuilder.repository;

import com.cvbuilder.entity.Cv;
import com.cvbuilder.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvRepository extends JpaRepository<Cv, UUID> {

    @EntityGraph(attributePaths = {"experiences", "educations", "skills", "projects"})
    List<Cv> findAllByUserOrderByUpdatedAtDesc(User user);

    @EntityGraph(attributePaths = {"experiences", "educations", "skills", "projects"})
    Optional<Cv> findByIdAndUser(UUID id, User user);
}
