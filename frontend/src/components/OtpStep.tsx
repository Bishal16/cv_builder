import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { verifyOtp, resendOtp, type AuthResponse } from '../api';

interface Props {
  email: string;
  onVerified: (res: AuthResponse) => void;
  onBack: () => void;
}

const ORANGE = '#F97316';

export function OtpStep({ email, onVerified, onBack }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;
    setLoading(true);
    try {
      onVerified(await verifyOtp(email, code.trim()));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      await resendOtp(email);
      toast.success('New code sent');
      setCooldown(30);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend');
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#0A0A0A' }}>
          Verify your email
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: '#6B6B68', lineHeight: 1.5 }}>
          Enter the 6-digit code we sent to <strong style={{ color: '#1F1F1D' }}>{email}</strong>
        </p>
      </div>

      <div style={{
        width: '100%', maxWidth: 400, background: '#FFFFFF',
        border: '1px solid #E7E7E2', borderRadius: 16, padding: '32px',
        boxShadow: '0 1px 0 rgba(10,10,10,.04), 0 8px 32px -8px rgba(10,10,10,.09)',
      }}>
        <form onSubmit={submit}>
          <input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="••••••"
            style={{
              width: '100%', textAlign: 'center', fontSize: 28, letterSpacing: 12,
              fontWeight: 700, padding: '12px 0', color: '#0A0A0A',
              border: '1px solid #E7E7E2', borderRadius: 10, outline: 'none',
              boxSizing: 'border-box', background: '#FAFAF8',
            }}
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            style={{
              width: '100%', height: 44, marginTop: 16, color: '#fff', border: 'none',
              borderRadius: 9, fontSize: 15, fontWeight: 600,
              background: code.length === 6 && !loading ? 'linear-gradient(135deg,#F97316,#EA580C)' : '#B8B8B0',
              cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Verifying…' : 'Verify & continue →'}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: '#6B6B68' }}>
          Didn't get it?{' '}
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0}
            style={{
              background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 600,
              cursor: cooldown > 0 ? 'default' : 'pointer',
              color: cooldown > 0 ? '#98988F' : ORANGE,
            }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        style={{ marginTop: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#98988F', fontSize: 13 }}
      >
        ← Back
      </button>
    </>
  );
}
