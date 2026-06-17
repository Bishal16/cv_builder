import { useState } from 'react';
import toast from 'react-hot-toast';
import { generateCoverLetter } from '../api/aiApi';
import type { CVFormData } from '../types/cv';

interface Props {
  formData: CVFormData;
  onClose: () => void;
}

type Tone = 'professional' | 'enthusiastic' | 'concise';

const TONES: { id: Tone; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'enthusiastic', label: 'Enthusiastic' },
  { id: 'concise', label: 'Concise' },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function CoverLetterModal({ formData, onClose }: Props) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateCoverLetter({
        candidateName: formData.personalInfo.name,
        cvSummary: stripHtml(formData.personalInfo.summary ?? ''),
        skills: formData.skills.map(s => s.name),
        experiences: formData.experiences.map(e => ({
          role: e.role,
          company: e.company,
          description: stripHtml(e.description),
        })),
        companyName: company,
        roleTitle: role,
        jobDescription: jd,
        tone,
      });
      setLetter(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed. Check that an AI provider is configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter${company ? '-' + company.replace(/\s+/g, '-').toLowerCase() : ''}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2d2d2d] overflow-hidden max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[18px]">✉️</span>
            <div>
              <h3 className="font-semibold text-[14px] text-gray-900 dark:text-white">Cover Letter Generator</h3>
              <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">Generated from your resume by AI</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {!letter && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 dark:text-[#bbb] mb-1.5">Company</label>
                  <input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Acme Inc."
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#111] text-gray-800 dark:text-white outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/12 transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 dark:text-[#bbb] mb-1.5">Role</label>
                  <input
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Senior Engineer"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#111] text-gray-800 dark:text-white outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/12 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 dark:text-[#bbb] mb-1.5">Job description (optional)</label>
                <textarea
                  value={jd}
                  onChange={e => setJd(e.target.value)}
                  placeholder="Paste the JD to tailor the letter more precisely…"
                  rows={4}
                  className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#111] text-gray-800 dark:text-white outline-none resize-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/12 transition-all placeholder:text-gray-400 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 dark:text-[#bbb] mb-1.5">Tone</label>
                <div className="flex gap-1.5">
                  {TONES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                        tone === t.id
                          ? 'bg-[#F97316] text-white border-transparent'
                          : 'bg-white dark:bg-[#232323] text-gray-500 dark:text-[#8d8d8d] border-gray-200 dark:border-[#3a3a3a] hover:border-[#F97316]/50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-gray-400 dark:text-[#666]">Writing your cover letter…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 text-[12px] text-rose-700 dark:text-rose-300">
              {error.toLowerCase().includes('not configured') ? 'Cover letters need an AI provider configured on the server.' : error}
            </div>
          )}

          {letter && !loading && (
            <textarea
              value={letter}
              onChange={e => setLetter(e.target.value)}
              rows={16}
              className="w-full px-4 py-3.5 text-[13px] rounded-xl border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#111] text-gray-800 dark:text-white outline-none resize-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/12 transition-all leading-relaxed font-serif"
            />
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#161616] flex-shrink-0">
          {letter ? (
            <>
              <button onClick={() => setLetter('')} className="text-[12px] text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                ← Edit details
              </button>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="px-4 py-2 rounded-lg text-[12.5px] font-semibold border border-gray-200 dark:border-[#3a3a3a] text-[#111] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors">
                  Copy
                </button>
                <button onClick={handleDownload} className="px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}>
                  Download .txt
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-[11px] text-gray-400 dark:text-[#555]">Uses your resume content automatically</span>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-5 py-2 rounded-lg text-[12.5px] font-semibold text-white disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
              >
                {loading ? 'Generating…' : '✨ Generate'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
