package com.cvbuilder.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@cvbuilder.app}")
    private String fromAddress;

    @Value("${cvbuilder.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${spring.mail.host:}")
    private String mailHost;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendBaseUrl + "/reset-password?token=" + token;

        if (mailHost == null || mailHost.isBlank()) {
            log.info("=== PASSWORD RESET (no SMTP configured) ===");
            log.info("To: {}", toEmail);
            log.info("Reset URL: {}", resetUrl);
            log.info("===========================================");
            return;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Reset your CV Builder password");
            helper.setText(buildHtml(resetUrl), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send reset email");
        }
    }

    public void sendOtpEmail(String toEmail, String code) {
        if (mailHost == null || mailHost.isBlank()) {
            log.info("=== EMAIL VERIFICATION OTP (no SMTP configured) ===");
            log.info("To: {}", toEmail);
            log.info("Code: {}", code);
            log.info("===================================================");
            return;
        }
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(code + " is your CV Builder verification code");
            helper.setText(buildOtpHtml(code), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send verification code");
        }
    }

    private String buildOtpHtml(String code) {
        return """
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff">
              <h2 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 8px">Verify your email</h2>
              <p style="font-size:14px;color:#6b7280;margin:0 0 20px">
                Enter this code in CV Builder to finish creating your account. It expires in 10 minutes.
              </p>
              <div style="font-size:34px;font-weight:800;letter-spacing:10px;color:#111111;
                          background:#f3f4f6;border-radius:10px;padding:16px 0;text-align:center">
                %s
              </div>
              <p style="font-size:12px;color:#9ca3af;margin:20px 0 0">
                If you didn't try to sign up, you can ignore this email.
              </p>
            </div>
            """.formatted(code);
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String verifyUrl = frontendBaseUrl + "/verify-email?token=" + token;

        if (mailHost == null || mailHost.isBlank()) {
            log.info("=== EMAIL VERIFICATION (no SMTP configured) ===");
            log.info("To: {}", toEmail);
            log.info("Verify URL: {}", verifyUrl);
            log.info("===============================================");
            return;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Verify your CV Builder email");
            helper.setText(buildVerifyHtml(verifyUrl), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
            // Non-fatal: registration still succeeds, user can resend later.
        }
    }

    private String buildVerifyHtml(String verifyUrl) {
        return """
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff">
              <h2 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 8px">Welcome to CV Builder</h2>
              <p style="font-size:14px;color:#6b7280;margin:0 0 24px">
                Confirm your email address to secure your account. This link expires in 24 hours.
              </p>
              <a href="%s"
                 style="display:inline-block;padding:12px 24px;background:#F97316;color:#ffffff;
                        font-size:14px;font-weight:600;text-decoration:none;border-radius:8px">
                Verify email
              </a>
              <p style="font-size:12px;color:#9ca3af;margin:24px 0 0">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
            """.formatted(verifyUrl);
    }

    private String buildHtml(String resetUrl) {
        return """
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff">
              <h2 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 8px">Reset your password</h2>
              <p style="font-size:14px;color:#6b7280;margin:0 0 24px">
                Click the button below to set a new password. This link expires in 1 hour.
              </p>
              <a href="%s"
                 style="display:inline-block;padding:12px 24px;background:#F97316;color:#ffffff;
                        font-size:14px;font-weight:600;text-decoration:none;border-radius:8px">
                Reset password
              </a>
              <p style="font-size:12px;color:#9ca3af;margin:24px 0 0">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
            """.formatted(resetUrl);
    }
}
