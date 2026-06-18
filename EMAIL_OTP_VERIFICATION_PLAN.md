# Plan: Verify a real email at signup (OTP)

> Status: **planned, not implemented.** Goal: guarantee a new user's email is
> actually theirs before they can use the app, via a 6-digit OTP emailed at
> signup. Builds on the link-based verification infra already in the repo.

## What already exists (from earlier work)
- `email_verification_tokens` table (V5), `EmailVerificationToken` entity + repo.
- On register: account created with `emailVerified = false`; a verification
  **link** token is generated; `EmailService.sendVerificationEmail` sends it
  (or **logs it to console when SMTP is unconfigured**).
- `POST /api/v1/auth/verify-email`, `/resend-verification`, a `/verify-email`
  page, and a dashboard "verify your email" banner.
- **Non-blocking today**: users can use the app before verifying.
- OAuth users are already `emailVerified = true` (provider-verified).

## Two gaps to close
1. **Make it blocking** — enforce verification before app access.
2. **Actually send email** — SMTP/transactional sender must be configured
   (`SMTP_*` are blank in `.env`; right now the code only logs the code/link).
   This is a hard prerequisite: no sender ⇒ no real email. Options: Gmail SMTP
   (app password) or Resend / SendGrid / Mailgun (free tiers, better delivery).

## Recommended approach — OTP at signup (blocking, in-app)
Keeps the user in the app (no leaving to click a link), modern + mobile-friendly,
and guarantees the email is real before any access.

### Flow
1. `POST /auth/register` → create user (`emailVerified=false`), generate a
   **6-digit code**, email it. **Do NOT return a usable JWT** — return a
   "verification required" response (e.g. `{ status: "VERIFY_REQUIRED", email }`).
2. Frontend shows an **OTP entry step** ("Enter the 6-digit code sent to …")
   with a resend button + expiry countdown.
3. `POST /auth/verify-otp { email, code }` → validate → set `emailVerified=true`
   → return the **real JWT** (logs them in).
4. `POST /auth/resend-otp { email }` → new code (rate-limited).
5. `POST /auth/login` → if `emailVerified=false`, reject with a specific error so
   the frontend routes them back into the OTP step (+ resend).

### Backend changes
- **Token store**: reuse `email_verification_tokens`; store the 6-digit code in
  `token`, look up by `user_id + token`. Migration **V8** to add an `attempts`
  column (lock after N wrong tries). Expiry ~**10 min**.
- **Endpoints**: adjust `register` (no JWT, send code), add `verify-otp`,
  `resend-otp`; `login` checks `emailVerified`. Keep them under the public
  matcher in `SecurityConfig` (`/auth/verify-otp`, `/auth/resend-otp`).
- **Security**: rate-limit register/resend (reuse `RateLimitFilter` / Bucket4j),
  cap OTP attempts (e.g. 5 → invalidate, force resend), short expiry, generic
  errors (don't leak which step failed).
- **EmailService**: `sendOtpEmail(email, code)` (HTML), logs in dev w/o SMTP.

### Frontend changes
- `AuthScreen`: after register, switch to an **OTP step** (6 inputs / single
  field), submit → `verify-otp` → store JWT → enter app. Resend + countdown.
- Login: on `VERIFY_REQUIRED` error, drop into the OTP step for that email.
- Keep the existing `/verify-email` link page as a fallback (optional).

### Edge cases / housekeeping
- **OAuth** signups skip OTP (already verified).
- **Existing users**: grandfathered verified (already done in V5).
- **Abandoned unverified accounts**: optional scheduled cleanup (delete
  `emailVerified=false` accounts older than e.g. 7 days).
- Verified accounts that change email later → would need re-verification (out of
  scope for now).

## Alternative (less preferred): keep the link, make it blocking
We already have the link plumbing; we'd just gate the app until verified and
block login for unverified users. Simpler to build, but worse UX (user must
leave to email and come back) than OTP.

## Files to add / touch
- `db/migration/V8__otp_attempts.sql` (attempts column; optional)
- `service/AuthService.java` (register no-JWT + sendOtp, verifyOtp, resendOtp,
  login gate)
- `service/EmailService.java` (`sendOtpEmail`)
- `controller/AuthController.java` (`/verify-otp`, `/resend-otp`)
- `config/SecurityConfig.java` (permit the new public endpoints)
- `dto/` (VerifyOtpRequest, ResendOtpRequest, a register response variant)
- `application.properties` / `.env` (SMTP creds + OTP expiry/attempts config)
- frontend `AuthScreen.tsx` (OTP step), `api/cvApi.ts` (verifyOtp/resendOtp)

## Open decisions before building
1. **OTP code (recommended) or verification link?**
2. **Email sender**: Gmail SMTP or a service (Resend/SendGrid/Mailgun)? — hard
   prerequisite for real emails. (Can build now and log the code in dev until
   creds are added.)
3. **Strictness**: hard-block login until verified (recommended) vs allow a
   limited grace session.
4. **Cleanup** of abandoned unverified accounts — yes/no + window.

## Tradeoffs / risks
- Adds a step to signup → small friction (worth it for real emails).
- Deliverability: Gmail SMTP can hit spam; a transactional service is better.
- Must rate-limit + cap attempts or OTP becomes a brute-force / spam vector.
