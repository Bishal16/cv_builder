import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Cv } from '../types/cv';
import { getPublicCv } from '../api/shareApi';
import { CvPreview, PAGE_WIDTH } from '../templates/CvPreview';

export function PublicCvView() {
  const { token } = useParams<{ token: string }>();
  const [cv, setCv] = useState<Cv | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || !token) return;
    fetched.current = true;

    getPublicCv(token)
      .then((data) => {
        setCv(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212]">
        <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-[#121212] px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#F97316]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12V16.5Zm9-4.5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-[#111111] dark:text-white mb-1">Resume unavailable</p>
        <p className="text-[13px] text-gray-500 dark:text-[#8d8d8d] max-w-sm">
          This resume link is unavailable or has been disabled.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212]">
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur border-b border-gray-200 dark:border-[#3a3a3a]">
        <a href="/" className="text-[13px] font-semibold text-[#111111] dark:text-white hover:text-[#F97316] transition-colors">
          Made with <span className="text-[#F97316]">CV Builder</span>
        </a>
      </div>

      <div className="flex justify-center px-4 py-8 sm:py-12">
        <div
          className="bg-white shadow-2xl"
          style={{ width: PAGE_WIDTH, maxWidth: '100%' }}
        >
          <CvPreview cv={cv} containerStyle={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
