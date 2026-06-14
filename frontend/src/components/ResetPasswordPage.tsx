import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../api';
import { Logo } from './Logo';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFCF9]">
        <div className="text-center">
          <p className="text-[14px] text-gray-500">Invalid reset link.</p>
          <button onClick={() => navigate('/auth')} className="mt-4 text-[13px] font-semibold text-[#F97316] underline">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFCF9] flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <Logo size={28} />
        <span className="font-black text-[17px] tracking-tight" style={{ color: '#F97316' }}>CV Builder</span>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
        {done ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-[17px] font-bold text-[#111111] mb-2">Password updated</h2>
            <p className="text-[13px] text-gray-500 mb-5">You can now sign in with your new password.</p>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-2.5 rounded-lg text-[13.5px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
            >
              Sign in →
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[17px] font-bold text-[#111111] mb-1">Set new password</h2>
            <p className="text-[13px] text-gray-500 mb-5">Choose a strong password of at least 8 characters.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#111111] mb-1.5">New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 text-[13.5px] rounded-lg bg-white border border-gray-200 text-[#111111] outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/15 transition-all placeholder:text-gray-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#111111] mb-1.5">Confirm password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 text-[13.5px] rounded-lg bg-white border border-gray-200 text-[#111111] outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/15 transition-all placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-lg text-[13.5px] font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
              >
                {loading ? 'Updating…' : 'Update password →'}
              </button>
            </form>
          </>
        )}
      </div>

      <button onClick={() => navigate('/auth')} className="mt-5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
        ← Back to sign in
      </button>
    </div>
  );
}
