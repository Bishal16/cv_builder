package com.cvbuilder.controller;

import com.cvbuilder.dto.AuthResponse;
import com.cvbuilder.dto.ChangePasswordRequest;
import com.cvbuilder.dto.ForgotPasswordRequest;
import com.cvbuilder.dto.LoginRequest;
import com.cvbuilder.dto.RegisterRequest;
import com.cvbuilder.dto.ResendOtpRequest;
import com.cvbuilder.dto.ResetPasswordRequest;
import com.cvbuilder.dto.UpdateProfileRequest;
import com.cvbuilder.dto.VerifyEmailRequest;
import com.cvbuilder.dto.VerifyOtpRequest;
import com.cvbuilder.entity.User;
import com.cvbuilder.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDetailsDto> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(AuthService.toUserDetailsDto(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse.UserDetailsDto> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(user, request));
    }

    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(user, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request.getEmail(), request.getCode()));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request.getEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@AuthenticationPrincipal User user) {
        authService.resendVerification(user);
        return ResponseEntity.noContent().build();
    }
}
