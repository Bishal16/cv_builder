import { useState } from 'react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../api';

interface Props {
  onClose: () => void;
}

export function ForgotPasswordModal({ onClose }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-[#3a3a3a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
          <h3 className="text-[14px] font-semibold text-[#111111] dark:text-white">Reset password</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-[#111111] dark:text-white mb-1">Check your email</p>
              <p className="text-[12.5px] text-gray-500 dark:text-[#8d8d8d] leading-relaxed">
                If <strong>{email}</strong> is registered, you'll receive a reset link within a few minutes.
              </p>
              <button onClick={onClose} className="mt-4 px-5 py-2 rounded-lg text-[13px] font-semibold bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:opacity-85 transition-opacity">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] text-gray-500 dark:text-[#8d8d8d]">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="block text-[12px] font-semibold text-[#111111] dark:text-white mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 text-[13.5px] rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3a3a3a] text-[#111111] dark:text-white outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/15 transition-all placeholder:text-gray-400"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-2.5 rounded-lg text-[13.5px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
