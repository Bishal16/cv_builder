import { useState } from 'react';
import { tailorToJd, type JdTailorResponse } from '../api/aiApi';
import type { CVFormData } from '../types/cv';

interface Props {
  formData: CVFormData;
  onClose: () => void;
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Strong match' : score >= 45 ? 'Partial match' : 'Weak match';
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-100 dark:text-[#2a2a2a]" />
          <circle
            cx="18" cy="18" r="15.9155" fill="none" strokeWidth="2.5"
            stroke={color}
            strokeDasharray={`${score} ${100 - score}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-black tabular-nums" style={{ color }}>{score}</span>
          <span className="text-[9px] text-gray-400 dark:text-[#666] font-medium uppercase tracking-wider">/100</span>
        </div>
      </div>
      <span className="text-[12px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

export function JdTailorPanel({ formData, onClose }: Props) {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JdTailorResponse | null>(null);

  const handleAnalyze = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await tailorToJd({
        jobDescription: jd,
        cvSummary: formData.personalInfo.summary,
        skills: formData.skills.map(s => s.name),
        experiences: formData.experiences.map(e => ({
          role: e.role,
          company: e.company,
          description: e.description,
        })),
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Check that an AI provider is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2d2d2d] overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a] flex-shrink-0">
          <div>
            <h3 className="font-semibold text-[14px] text-gray-900 dark:text-white">Tailor to Job Description</h3>
            <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">See how well your resume matches a specific role</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* JD textarea */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 dark:text-[#bbb] mb-1.5">
              Paste the job description
            </label>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description here…"
              rows={6}
              className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#111] text-gray-800 dark:text-white outline-none resize-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/12 transition-all placeholder:text-gray-400 dark:placeholder:text-[#555] leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-gray-400 dark:text-[#555]">{jd.length}/8000 chars</span>
              {!loading && (
                <button
                  onClick={handleAnalyze}
                  disabled={!jd.trim() || jd.length > 8000}
                  className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[12.5px] transition-colors"
                >
                  Analyse match
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-gray-400 dark:text-[#666]">Claude is analysing your resume…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 text-[12px] text-rose-700 dark:text-rose-300">
              {error.toLowerCase().includes('not configured') ? 'JD tailoring needs an AI provider configured on the server.' : error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Score */}
              <ScoreGauge score={result.matchScore} />

              {/* Present keywords */}
              {result.presentKeywords.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                    Keywords you already have
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.presentKeywords.map(k => (
                      <span key={k} className="px-2 py-0.5 rounded-md text-[11.5px] font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                        ✓ {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                    Keywords to add
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map(k => (
                      <span key={k} className="px-2 py-0.5 rounded-md text-[11.5px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
                        + {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-2">
                    Tailoring suggestions
                  </p>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-2.5 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-100 dark:border-[#2a2a2a] text-[12px] text-gray-700 dark:text-[#ccc] leading-relaxed">
                        <span className="text-[#F97316] font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                className="text-[11.5px] text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                ↻ Re-analyse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
