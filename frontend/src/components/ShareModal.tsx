import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { enableShare, disableShare, getShareToken, getShareConfig } from '../api/shareApi';

/**
 * Copy text to the clipboard, falling back to a temporary textarea +
 * execCommand for non-secure contexts. The async Clipboard API is only
 * available over HTTPS or on localhost, so plain-http LAN access
 * (e.g. http://192.168.x.x:5173) would otherwise throw.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path below
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

interface Props {
  cvId: string;
  onClose: () => void;
}

export function ShareModal({ cvId, onClose }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [shareBaseUrl, setShareBaseUrl] = useState(window.location.origin);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    Promise.all([
      getShareToken(cvId),
      getShareConfig(),
    ]).then(([t, baseUrl]) => {
      setToken(t);
      setShareBaseUrl(baseUrl);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [cvId]);

  const shareUrl = token ? `${shareBaseUrl}/r/${token}` : '';

  const handleCreate = async () => {
    setWorking(true);
    try {
      const t = await enableShare(cvId);
      setToken(t);
    } catch {
      toast.error('Could not create share link.');
    } finally {
      setWorking(false);
    }
  };

  const handleDisable = async () => {
    setWorking(true);
    try {
      await disableShare(cvId);
      setToken(null);
    } catch {
      toast.error('Could not disable share link.');
    } finally {
      setWorking(false);
    }
  };

  const handleCopy = async () => {
    if (await copyToClipboard(shareUrl)) {
      toast.success('Link copied');
    } else {
      toast.error('Could not copy link.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-[#3a3a3a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
          <h3 className="text-[14px] font-semibold text-[#111111] dark:text-white">Share resume</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin" />
            </div>
          ) : token ? (
            <div className="space-y-4">
              <p className="text-[13px] text-gray-500 dark:text-[#8d8d8d]">
                Anyone with this link can view a read-only version of your resume.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 px-3 py-2.5 text-[12.5px] rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3a3a3a] text-[#111111] dark:text-white outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/15 transition-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
                >
                  Copy
                </button>
              </div>
              <button
                onClick={handleDisable}
                disabled={working}
                className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-red-600 dark:text-red-400 border border-gray-200 dark:border-[#3a3a3a] hover:bg-gray-50 dark:hover:bg-[#2c2c2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {working ? 'Disabling…' : 'Disable link'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] text-gray-500 dark:text-[#8d8d8d]">
                Create a public link to let anyone view a read-only version of your resume.
              </p>
              <button
                onClick={handleCreate}
                disabled={working}
                className="w-full py-2.5 rounded-lg text-[13.5px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
              >
                {working ? 'Creating…' : 'Create share link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
