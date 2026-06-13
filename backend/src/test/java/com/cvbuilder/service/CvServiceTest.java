package com.cvbuilder.service;

import com.cvbuilder.dto.CreateCvRequest;
import com.cvbuilder.dto.CvDto;
import com.cvbuilder.dto.UpdateCvRequest;
import com.cvbuilder.entity.Cv;
import com.cvbuilder.entity.User;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.mapper.CvMapper;
import com.cvbuilder.model.TemplateId;
import com.cvbuilder.repository.CvRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link CvService}. CvService reads the current user directly from
 * {@link SecurityContextHolder}, so we populate it per-test and clear it afterwards.
 * A real {@link CvMapper} is used (it's a trivial POJO); only the repository is mocked.
 */
@ExtendWith(MockitoExtension.class)
class CvServiceTest {

    @Mock
    private CvRepository cvRepository;

    private CvService cvService;

    private User currentUser;

    @BeforeEach
    void setUp() {
        cvService = new CvService(cvRepository, new CvMapper());
        currentUser = User.builder()
                .id(UUID.randomUUID()).email("owner@example.com").build();
        authenticateAs(currentUser);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    // ---------------------------------------------------------------------
    // ownership scoping
    // ---------------------------------------------------------------------

    @Test
    void getCvById_throwsNotFoundWhenCvBelongsToAnotherUser() {
        UUID id = UUID.randomUUID();
        // Repository scopes by (id, user); a CV owned by someone else returns empty.
        when(cvRepository.findByIdAndUser(id, currentUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.getCvById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found or access denied");
    }

    @Test
    void updateCv_throwsNotFoundWhenCvNotOwnedAndDoesNotSave() {
        UUID id = UUID.randomUUID();
        when(cvRepository.findByIdAndUser(id, currentUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.updateCv(id, new UpdateCvRequest()))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(cvRepository, never()).save(any());
    }

    @Test
    void deleteCv_throwsNotFoundWhenCvNotOwnedAndDoesNotDelete() {
        UUID id = UUID.randomUUID();
        when(cvRepository.findByIdAndUser(id, currentUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.deleteCv(id))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(cvRepository, never()).delete(any());
    }

    @Test
    void getCvById_returnsDtoWhenOwnedByCurrentUser() {
        UUID id = UUID.randomUUID();
        Cv cv = new Cv();
        cv.setId(id);
        cv.setTitle("Mine");
        cv.setTemplateId(TemplateId.CLASSIC);
        cv.setUser(currentUser);
        when(cvRepository.findByIdAndUser(id, currentUser)).thenReturn(Optional.of(cv));

        CvDto dto = cvService.getCvById(id);

        assertThat(dto.getId()).isEqualTo(id);
        assertThat(dto.getTitle()).isEqualTo("Mine");
    }

    // ---------------------------------------------------------------------
    // create scopes the CV to the authenticated user
    // ---------------------------------------------------------------------

    @Test
    void createCv_assignsCurrentUserAndPersists() {
        CreateCvRequest request = CreateCvRequest.builder()
                .title("New CV").templateId(TemplateId.MODERN).build();
        when(cvRepository.save(any(Cv.class))).thenAnswer(inv -> {
            Cv c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        CvDto dto = cvService.createCv(request);

        ArgumentCaptor<Cv> captor = ArgumentCaptor.forClass(Cv.class);
        verify(cvRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isSameAs(currentUser);
        assertThat(dto.getTitle()).isEqualTo("New CV");
    }
}
