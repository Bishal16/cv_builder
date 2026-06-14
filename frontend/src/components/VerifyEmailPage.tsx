import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';

type Status = 'verifying' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [status, setStatus] = useState<Status>(() => (token ? 'verifying' : 'error'));
  const [message, setMessage] = useState(() => (token ? '' : 'This verification link is invalid.'));
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !token) return;
    ran.current = true;

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        if (user) updateUser({ ...user, emailVerified: true });
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e instanceof Error ? e.message : 'Verification failed. The link may have expired.');
      });
  }, [token, user, updateUser]);

  return (
    <div className="min-h-screen bg-[#FEFCF9] flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <Logo size={28} />
        <span className="font-black text-[17px] tracking-tight" style={{ color: '#F97316' }}>CV Builder</span>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[14px] text-gray-500">Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-[17px] font-bold text-[#111111] mb-2">Email verified</h2>
            <p className="text-[13px] text-gray-500 mb-5">Your account is now fully verified. Thanks!</p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="w-full py-2.5 rounded-lg text-[13.5px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
            >
              {user ? 'Go to dashboard →' : 'Sign in →'}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-[17px] font-bold text-[#111111] mb-2">Verification failed</h2>
            <p className="text-[13px] text-gray-500 mb-5">{message}</p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="w-full py-2.5 rounded-lg text-[13.5px] font-semibold border border-gray-300 text-[#111111] hover:bg-gray-50 transition-colors"
            >
              {user ? 'Back to dashboard' : 'Back to sign in'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
