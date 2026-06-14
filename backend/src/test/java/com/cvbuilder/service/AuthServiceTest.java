package com.cvbuilder.service;

import com.cvbuilder.dto.AuthResponse;
import com.cvbuilder.dto.LoginRequest;
import com.cvbuilder.dto.RegisterRequest;
import com.cvbuilder.entity.User;
import com.cvbuilder.exception.InvalidCredentialsException;
import com.cvbuilder.exception.UserAlreadyExistsException;
import com.cvbuilder.repository.EmailVerificationTokenRepository;
import com.cvbuilder.repository.PasswordResetTokenRepository;
import com.cvbuilder.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordResetTokenRepository resetTokenRepository;
    @Mock
    private EmailVerificationTokenRepository verificationTokenRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest() {
        return RegisterRequest.builder()
                .email("new@example.com")
                .password("password123")
                .firstName("New")
                .lastName("User")
                .build();
    }

    // ---------------------------------------------------------------------
    // register
    // ---------------------------------------------------------------------

    @Test
    void register_createsUserAndReturnsToken() {
        RegisterRequest request = registerRequest();
        UUID savedId = UUID.randomUUID();

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("ENCODED");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(savedId);
            return u;
        });
        when(jwtService.generateToken(savedId, "new@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser().getId()).isEqualTo(savedId);
        assertThat(response.getUser().getEmail()).isEqualTo("new@example.com");
        assertThat(response.getUser().getFirstName()).isEqualTo("New");
        assertThat(response.getUser().getLastName()).isEqualTo("User");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User persisted = userCaptor.getValue();
        assertThat(persisted.getPassword()).isEqualTo("ENCODED");
        assertThat(persisted.getProvider()).isEqualTo("local");
    }

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        RegisterRequest request = registerRequest();
        when(userRepository.findByEmail("new@example.com"))
                .thenReturn(Optional.of(User.builder().email("new@example.com").build()));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
        verify(jwtService, never()).generateToken(any(), anyString());
    }

    // ---------------------------------------------------------------------
    // login
    // ---------------------------------------------------------------------

    @Test
    void login_returnsTokenForValidCredentials() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId).email("a@example.com").password("ENCODED")
                .firstName("A").lastName("B").build();

        LoginRequest request = LoginRequest.builder()
                .email("a@example.com").password("raw-pass").build();

        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("raw-pass", "ENCODED")).thenReturn(true);
        when(jwtService.generateToken(userId, "a@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser().getId()).isEqualTo(userId);
        assertThat(response.getUser().getEmail()).isEqualTo("a@example.com");
    }

    @Test
    void login_throwsWhenEmailNotFound() {
        LoginRequest request = LoginRequest.builder()
                .email("missing@example.com").password("x").build();
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");

        verify(jwtService, never()).generateToken(any(), anyString());
    }

    @Test
    void login_throwsWhenPasswordDoesNotMatch() {
        User user = User.builder()
                .id(UUID.randomUUID()).email("a@example.com").password("ENCODED").build();
        LoginRequest request = LoginRequest.builder()
                .email("a@example.com").password("wrong").build();

        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "ENCODED")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");

        verify(jwtService, never()).generateToken(any(), anyString());
    }

    @Test
    void login_throwsForSocialLoginAccountWithNullPassword() {
        // OAuth-only user has a null password; matches() must not be invoked.
        User user = User.builder()
                .id(UUID.randomUUID()).email("oauth@example.com").password(null).build();
        LoginRequest request = LoginRequest.builder()
                .email("oauth@example.com").password("anything").build();

        when(userRepository.findByEmail("oauth@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(passwordEncoder, never()).matches(anyString(), eq(null));
        verify(jwtService, never()).generateToken(any(), anyString());
    }
}
