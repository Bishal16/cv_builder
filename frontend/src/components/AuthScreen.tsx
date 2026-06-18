import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, register, type AuthResponse } from '../api';
import { ApiError } from '../api/cvApi';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { OtpStep } from './OtpStep';

interface AuthScreenProps {
  onSuccess: () => void;
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
function EyeOpen() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeClosed() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

/* ── Design tokens ───────────────────────────────────────────────────────── */
const A = {
  bg:         '#FEFCF9',
  bgElev:     '#FFFFFF',
  line:       '#E7E7E2',
  line2:      '#EFEFEA',
  ink:        '#0A0A0A',
  ink2:       '#1F1F1D',
  muted:      '#6B6B68',
  muted2:     '#98988F',
  orange:     '#F97316',
  orangeInk:  '#C2510A',
  orangeTint: '#FFF3E8',
} as const;

const font     = '"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif';
const fontMono = '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace';
const shadowCard = '0 1px 0 rgba(10,10,10,.04), 0 1px 2px rgba(10,10,10,.04)';

/* ── Input field ─────────────────────────────────────────────────────────── */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightSlot?: React.ReactNode;
}

function Field({ label, rightSlot, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: A.ink2, fontFamily: font, letterSpacing: '0.01em' }}>
          {label}
        </label>
        {rightSlot}
      </div>
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: '100%', padding: '10px 14px',
          fontSize: 14, fontFamily: font, color: A.ink,
          background: '#FAFAF8',
          border: `1px solid ${focused ? A.orange : A.line}`,
          borderRadius: 8, outline: 'none',
          boxShadow: focused
            ? `0 0 0 3px rgba(249,115,22,.15), ${shadowCard}`
            : shadowCard,
          boxSizing: 'border-box',
          transition: 'border-color .15s ease, box-shadow .15s ease',
        }}
      />
    </div>
  );
}

/* ── OAuth error messages ────────────────────────────────────────────────── */
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  email_not_found: 'No public email found on your account. Please make your email public in your provider settings and try again.',
  access_denied:   'Authorization was cancelled.',
  oauth_error:     'Sign-in failed. Please try again.',
};

/* ── Main component ──────────────────────────────────────────────────────── */
export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const navigate  = useNavigate();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(OAUTH_ERROR_MESSAGES[error] ?? OAUTH_ERROR_MESSAGES.oauth_error);
      window.history.replaceState({}, '', '/auth');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [isLogin,      setIsLogin]      = useState(true);
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwFocused,    setPwFocused]    = useState(false);
  const [showForgot,   setShowForgot]   = useState(false);
  const [otpEmail,     setOtpEmail]     = useState<string | null>(null); // non-null = OTP step
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });

  const completeAuth = (res: AuthResponse) => {
    if (res.token) {
      setAuth(res.user, res.token);
      onSuccess();
    }
  };

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const switchMode = () => {
    setIsLogin(v => !v);
    setFormData({ email: '', password: '', firstName: '', lastName: '' });
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login({ email: formData.email, password: formData.password });
        setAuth(res.user, res.token!);
        toast.success(`Welcome back, ${res.user.firstName}!`);
        onSuccess();
      } else {
        const res = await register(formData);
        if (res.emailVerificationRequired) {
          setOtpEmail(formData.email);
          toast.success('We emailed you a 6-digit code');
        } else {
          completeAuth(res);
          toast.success('Account created!');
        }
      }
    } catch (err) {
      // Unverified existing account → backend resent an OTP; go to the verify step.
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        setOtpEmail(formData.email);
        toast('Verify your email — we sent you a code', { icon: '✉️' });
      } else {
        toast.error(err instanceof Error ? err.message : 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: A.bg, fontFamily: font,
      WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ── Background — identical to landing page hero ─────────────────── */}
      <div style={{ position: 'absolute', top: -120, left: -100, width: 600, height: 600, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(249,115,22,.18), transparent 65%)', filter: 'blur(8px)' }} />
      <div style={{ position: 'absolute', top: -80, right: -120, width: 560, height: 560, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(234,88,12,.13), transparent 65%)', filter: 'blur(8px)' }} />
      <div style={{ position: 'absolute', bottom: -140, left: '35%', width: 500, height: 500, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(14,159,110,.10), transparent 65%)', filter: 'blur(8px)' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 380, height: 380, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(251,191,36,.11), transparent 65%)', filter: 'blur(12px)' }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(to right, rgba(10,10,10,.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,.03) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        WebkitMaskImage: 'radial-gradient(ellipse 100% 90% at 50% 20%, black 20%, transparent 75%)',
        maskImage: 'radial-gradient(ellipse 100% 90% at 50% 20%, black 20%, transparent 75%)',
      }} />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em', color: A.ink, padding: 0 }}
        >
          <Logo size={26} variant="light" />
          <span>CV Builder</span>
        </button>

        <button
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 13, fontWeight: 500, color: A.muted, padding: 0, transition: 'color .15s' }}
          onMouseOver={e => (e.currentTarget.style.color = A.ink)}
          onMouseOut={e => (e.currentTarget.style.color = A.muted)}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </button>
      </div>

      {/* ── Form area ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px 48px', position: 'relative' }}>

        {otpEmail ? (
          <OtpStep
            email={otpEmail}
            onVerified={(res) => completeAuth(res)}
            onBack={() => setOtpEmail(null)}
          />
        ) : (
        <>

        {/* Page heading — above the card */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, color: A.ink }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 15, color: A.muted, lineHeight: 1.5 }}>
            {isLogin
              ? 'Sign in to continue building your resume'
              : 'Start building your professional resume today'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 400,
          background: A.bgElev,
          border: `1px solid ${A.line}`,
          borderRadius: 16,
          padding: '32px 32px 28px',
          boxShadow: '0 1px 0 rgba(10,10,10,.04), 0 8px 32px -8px rgba(10,10,10,.09), 0 32px 64px -32px rgba(10,10,10,.07)',
        }}>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="First name" type="text" required placeholder="John"
                  value={formData.firstName} onChange={set('firstName')} autoComplete="given-name" />
                <Field label="Last name" type="text" required placeholder="Doe"
                  value={formData.lastName} onChange={set('lastName')} autoComplete="family-name" />
              </div>
            )}

            <Field
              label="Email address"
              type="email" required placeholder="you@example.com"
              value={formData.email} onChange={set('email')}
              autoComplete="email"
            />

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: A.ink2, fontFamily: font, letterSpacing: '0.01em' }}>Password</label>
                {isLogin && (
                  <button type="button" onClick={() => setShowForgot(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 500, color: A.muted, fontFamily: font, padding: 0 }}
                    onMouseOver={e => (e.currentTarget.style.color = A.orange)}
                    onMouseOut={e => (e.currentTarget.style.color = A.muted)}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required placeholder="••••••••"
                  value={formData.password} onChange={set('password')}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  style={{
                    width: '100%', padding: '10px 44px 10px 14px',
                    fontSize: 14, fontFamily: font, color: A.ink,
                    background: '#FAFAF8',
                    border: `1px solid ${pwFocused ? A.orange : A.line}`,
                    borderRadius: 8, outline: 'none',
                    boxShadow: pwFocused
                      ? `0 0 0 3px rgba(249,115,22,.15), ${shadowCard}`
                      : shadowCard,
                    boxSizing: 'border-box',
                    transition: 'border-color .15s ease, box-shadow .15s ease',
                  }}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: A.muted, display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  {showPassword ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 44, marginTop: 6,
                background: loading ? A.muted : 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                color: '#fff', border: 'none', borderRadius: 9,
                fontSize: 15, fontWeight: 600, fontFamily: font, letterSpacing: '-0.005em',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : 'inset 0 1px 0 rgba(255,255,255,.15), 0 1px 0 rgba(0,0,0,.12), 0 4px 16px -4px rgba(249,115,22,.45)',
                transition: 'background .15s ease',
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#C2510A'; }}
              onMouseOut={e => { if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                isLogin ? 'Sign in →' : 'Create account →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: A.line2 }} />
            <span style={{ fontFamily: fontMono, fontSize: 11, color: A.muted2, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: 1, background: A.line2 }} />
          </div>

          {/* OAuth */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <OAuthBtn onClick={() => { window.location.href = '/oauth2/authorization/google'; }} label="Google">
              <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </OAuthBtn>
            <OAuthBtn onClick={() => { window.location.href = '/oauth2/authorization/github'; }} label="GitHub">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.305 3.492.998.108-.776.417-1.305.76-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </OAuthBtn>
          </div>
        </div>

        {/* Switch mode + legal — below card */}
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: A.muted, fontFamily: font }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={switchMode}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 13, fontWeight: 600, color: A.orange, padding: 0 }}
            onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            {isLogin ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        <p style={{ marginTop: 10, textAlign: 'center', fontSize: 11, color: A.muted2, fontFamily: font, lineHeight: 1.6 }}>
          By continuing, you agree to our{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
          {' '}and{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
        </>
        )}
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* ── Feature strip ────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', borderTop: `1px solid ${A.line2}`, padding: '22px 40px 28px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontFamily: fontMono, fontSize: 11, color: A.muted2, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>
          Everything you need to ship a polished resume
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap', opacity: 0.7 }}>
          {['13 templates', 'Live preview', 'PDF export', 'Autosave', 'No watermarks'].map(name => (
            <span key={name} style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', color: A.ink2, fontFamily: font }}>{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── OAuth button ────────────────────────────────────────────────────────── */
function OAuthBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        height: 42,
        background: hovered ? '#FAFAF8' : A.bgElev,
        border: `1px solid ${hovered ? '#D4D4CE' : A.line}`,
        borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: font,
        color: A.ink2, cursor: 'pointer',
        boxShadow: hovered ? '0 2px 8px -2px rgba(10,10,10,.10)' : shadowCard,
        transition: 'background .15s ease, border-color .15s ease, box-shadow .15s ease',
      }}
    >
      {children}
      {label}
    </button>
  );
}
