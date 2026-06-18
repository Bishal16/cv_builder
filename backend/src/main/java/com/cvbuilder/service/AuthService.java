package com.cvbuilder.service;

import com.cvbuilder.dto.AuthResponse;
import com.cvbuilder.dto.ChangePasswordRequest;
import com.cvbuilder.dto.ForgotPasswordRequest;
import com.cvbuilder.dto.LoginRequest;
import com.cvbuilder.dto.RegisterRequest;
import com.cvbuilder.dto.ResetPasswordRequest;
import com.cvbuilder.dto.UpdateProfileRequest;
import com.cvbuilder.dto.VerifyEmailRequest;
import com.cvbuilder.entity.EmailVerificationToken;
import com.cvbuilder.entity.PasswordResetToken;
import com.cvbuilder.entity.User;
import com.cvbuilder.exception.EmailNotVerifiedException;
import com.cvbuilder.exception.InvalidCredentialsException;
import com.cvbuilder.exception.UserAlreadyExistsException;
import com.cvbuilder.repository.EmailVerificationTokenRepository;
import com.cvbuilder.repository.PasswordResetTokenRepository;
import com.cvbuilder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final SampleCvService sampleCvService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("User with this email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .provider("local")
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);
        sampleCvService.seedForUser(savedUser);
        sendOtp(savedUser);

        // No session yet — the client must verify the emailed OTP first.
        return AuthResponse.builder()
                .emailVerificationRequired(true)
                .user(toUserDetailsDto(savedUser))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            sendOtp(user); // re-send a fresh code so they can verify now
            throw new EmailNotVerifiedException(
                    "Please verify your email — we've sent a code to " + user.getEmail());
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return mapToAuthResponse(user, token);
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid verification request"));

        // Must NOT short-circuit for verified users — that would hand out a session
        // for any email + any code (auth bypass). A token is only issued after a
        // valid OTP for an unverified account below.
        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("This email is already verified. Please sign in.");
        }

        EmailVerificationToken evt = verificationTokenRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("No active code. Please request a new one."));

        if (evt.isUsed() || evt.isExpired()) {
            throw new IllegalArgumentException("This code has expired. Please request a new one.");
        }
        if (evt.getAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new IllegalArgumentException("Too many attempts. Please request a new code.");
        }
        if (evt.getCode() == null || !evt.getCode().equals(code.trim())) {
            evt.setAttempts(evt.getAttempts() + 1);
            verificationTokenRepository.save(evt);
            throw new InvalidCredentialsException("Incorrect code. Please try again.");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        evt.setUsed(true);
        verificationTokenRepository.save(evt);

        return mapToAuthResponse(user, jwtService.generateToken(user.getId(), user.getEmail()));
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.isEmailVerified()) {
            return; // stay quiet — don't reveal account state
        }
        verificationTokenRepository.findByUser_Id(user.getId()).ifPresent(evt -> {
            if (evt.getCreatedAt() != null
                    && evt.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(RESEND_COOLDOWN_SECONDS))) {
                throw new IllegalArgumentException("Please wait a few seconds before requesting another code.");
            }
        });
        sendOtp(user);
    }

    private void sendOtp(User user) {
        verificationTokenRepository.deleteAllByUserId(user.getId());
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        EmailVerificationToken evt = EmailVerificationToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .code(code)
                .attempts(0)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();
        verificationTokenRepository.save(evt);
        emailService.sendOtpEmail(user.getEmail(), code);
    }

    @Transactional
    public AuthResponse.UserDetailsDto updateProfile(User user, UpdateProfileRequest request) {
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        User saved = userRepository.save(user);
        return toUserDetailsDto(saved);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (user.getPassword() == null) {
            throw new IllegalArgumentException(
                    "Password change is not available for social-login accounts");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            resetTokenRepository.deleteAllByUserId(user.getId());
            PasswordResetToken prt = PasswordResetToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .used(false)
                    .build();
            resetTokenRepository.save(prt);
            emailService.sendPasswordResetEmail(user.getEmail(), prt.getToken());
        });
        // Always return 204 — don't reveal whether the email exists.
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken prt = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link"));
        if (prt.isUsed() || prt.isExpired()) {
            throw new IllegalArgumentException("This reset link has already been used or has expired");
        }
        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        prt.setUsed(true);
        resetTokenRepository.save(prt);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        EmailVerificationToken evt = verificationTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification link"));
        if (evt.isUsed() || evt.isExpired()) {
            throw new IllegalArgumentException("This verification link has already been used or has expired");
        }
        User user = evt.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        evt.setUsed(true);
        verificationTokenRepository.save(evt);
    }

    @Transactional
    public void resendVerification(User user) {
        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Your email is already verified");
        }
        sendVerificationToken(user);
    }

    private void sendVerificationToken(User user) {
        verificationTokenRepository.deleteAllByUserId(user.getId());
        EmailVerificationToken evt = EmailVerificationToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();
        verificationTokenRepository.save(evt);
        emailService.sendVerificationEmail(user.getEmail(), evt.getToken());
    }

    public static AuthResponse.UserDetailsDto toUserDetailsDto(User user) {
        return AuthResponse.UserDetailsDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    private AuthResponse mapToAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .user(toUserDetailsDto(user))
                .build();
    }
}
