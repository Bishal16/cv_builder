import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getMe } from '../api/cvApi';

const ERROR_MESSAGES: Record<string, string> = {
  email_not_found:
    'No public email found on your account. Please make your email public in your provider settings and try again.',
  access_denied: 'Authorization was cancelled.',
  oauth_error: 'Sign-in failed. Please try again.',
};

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error(ERROR_MESSAGES[error] ?? ERROR_MESSAGES.oauth_error);
      navigate('/auth', { replace: true });
      return;
    }

    if (!token) {
      toast.error('Sign-in failed: no token received.');
      navigate('/auth', { replace: true });
      return;
    }

    getMe(token)
      .then((user) => {
        setAuth(user, token);
        toast.success(`Welcome, ${user.firstName || user.email}!`);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        toast.error('Sign-in failed. Please try again.');
        navigate('/auth', { replace: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <p className="text-sm text-gray-500 font-medium">Completing sign-in…</p>
      </div>
    </div>
  );
}
