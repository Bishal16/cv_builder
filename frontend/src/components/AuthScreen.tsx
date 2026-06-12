import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, register } from '../api';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';

interface AuthScreenProps {
  onSuccess: () => void;
}

/* ── Icons ──────────────────────────────────────────────────────────────── */

function EyeOpen() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeClosed() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

/* ── Left brand panel ───────────────────────────────────────────────────── */

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col bg-[#0f0f0f] px-14 py-10 overflow-hidden relative">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <Logo size={24} variant="dark" />
        <span className="text-white font-black text-sm tracking-tight">CV Builder</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center py-12">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-600 mb-5">
          Professional · ATS-Ready · Instant PDF
        </p>
        <h2 className="text-[40px] font-black leading-[1.08] tracking-tight text-white mb-5">
          Build resumes<br />that get you<br />
          <span className="text-gray-500 italic">hired.</span>
        </h2>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-12 max-w-[280px]">
          Create ATS-friendly resumes with modern templates.
          Live preview as you type. Export in seconds.
        </p>

        {/* Mini CV mockup */}
        <div className="relative w-fit">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-[230px]">
            {/* header bar */}
            <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            {/* CV body */}
            <div className="p-4">
              <div className="text-center border-b border-gray-100 pb-3 mb-3">
                <div className="text-[12px] font-bold text-gray-900">Sam Carter</div>
                <div className="text-[9px] text-gray-400 mt-0.5">Senior Software Engineer</div>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="text-[7px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">Experience</div>
                  <div className="text-[9px] font-semibold text-gray-800">OpenAI · 2022 – Present</div>
                  <div className="mt-1 space-y-0.5">
                    <div className="h-[3px] bg-gray-100 rounded w-full" />
                    <div className="h-[3px] bg-gray-100 rounded w-5/6" />
                    <div className="h-[3px] bg-gray-100 rounded w-4/5" />
                  </div>
                </div>
                <div>
                  <div className="text-[7px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {['Python', 'Go', 'K8s', 'AWS'].map(s => (
                      <span key={s} className="text-[7px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ATS badge */}
          <div className="absolute -bottom-3 -right-4 bg-emerald-500 text-white rounded-xl px-3 py-2 shadow-xl">
            <div className="text-[7px] font-semibold opacity-80 uppercase tracking-wide">ATS Score</div>
            <div className="text-[15px] font-black leading-tight">98/100</div>
          </div>

          {/* Saved badge */}
          <div className="absolute -top-2.5 -left-3 bg-white rounded-lg px-2.5 py-1.5 shadow-lg flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-semibold text-gray-600">Auto-saved</span>
          </div>
        </div>

        {/* Trust row */}
        <div className="flex items-center gap-6 mt-14">
          {[
            { icon: '✓', text: 'ATS Friendly' },
            { icon: '▣', text: '8 Templates' },
            { icon: '⬡', text: 'PDF Export' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-1.5">
              <span className="text-gray-700 text-xs">{item.icon}</span>
              <span className="text-[11px] text-gray-600 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom testimonial */}
      <div className="border-t border-white/5 pt-7">
        <p className="text-[13px] text-gray-600 italic leading-relaxed">
          "Finally a resume builder that doesn't get in the way."
        </p>
        <p className="text-[11px] text-gray-700 mt-2 font-medium">
          — Software Engineer, hired at Shopify
        </p>
      </div>
    </div>
  );
}

/* ── Input component ────────────────────────────────────────────────────── */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightSlot?: React.ReactNode;
}

function Field({ label, rightSlot, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[12px] font-semibold text-gray-700">{label}</label>
        {rightSlot}
      </div>
      <input
        className="w-full px-3.5 py-2.5 text-[14px] text-[#111111] bg-white border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
        {...props}
      />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  email_not_found:
    'No public email found on your account. Please make your email public in your provider settings and try again.',
  access_denied: 'Authorization was cancelled.',
  oauth_error: 'Sign-in failed. Please try again.',
};

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(OAUTH_ERROR_MESSAGES[error] ?? OAUTH_ERROR_MESSAGES.oauth_error);
      window.history.replaceState({}, '', '/auth');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });

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
        setAuth(res.user, res.token);
        toast.success(`Welcome back, ${res.user.firstName}!`);
      } else {
        const res = await register(formData);
        setAuth(res.user, res.token);
        toast.success('Account created!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr]">
      <LeftPanel />

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <div className="bg-white flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6 shrink-0">
          {/* Mobile-only logo */}
          <button
            onClick={() => navigate('/')}
            className="lg:hidden flex items-center gap-2"
          >
            <Logo size={24} variant="light" />
            <span className="font-black text-sm text-[#111111]">CV Builder</span>
          </button>
          <div className="hidden lg:block" />

          <button
            onClick={() => navigate('/')}
            className="text-[13px] font-medium text-gray-400 hover:text-[#111111] transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-6">
          <div className="w-full max-w-[380px]">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[28px] font-black text-[#111111] tracking-tight leading-tight mb-2">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-[14px] text-gray-500 leading-snug">
                {isLogin
                  ? 'Sign in to continue building your resume'
                  : 'Start building your professional resume today'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-gray-700">Password</label>
                  {isLogin && (
                    <button type="button" tabIndex={-1}
                      className="text-[12px] text-gray-400 hover:text-[#111111] transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={set('password')}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className="w-full px-3.5 py-2.5 pr-10 text-[14px] text-[#111111] bg-white border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111111] hover:bg-[#2a2a2a] active:bg-black text-white text-[14px] font-semibold py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {isLogin ? 'Signing in…' : 'Creating account…'}
                    </span>
                  : isLogin ? 'Sign in' : 'Create account'
                }
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
                  or continue with
                </span>
              </div>
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { window.location.href = '/oauth2/authorization/google'; }}
                className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-lg py-2.5 text-[13px] font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all"
              >
                {/* Google colour SVG */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = '/oauth2/authorization/github'; }}
                className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-lg py-2.5 text-[13px] font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.305 3.492.998.108-.776.417-1.305.76-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Switch mode */}
            <p className="text-center text-[13px] text-gray-500 mt-8">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-[#111111] hover:underline underline-offset-2"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            {/* Legal */}
            <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="underline cursor-pointer">Terms</span> and{' '}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
