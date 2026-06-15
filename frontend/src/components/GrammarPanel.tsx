import { useState } from 'react';
import { checkGrammar, type GrammarResponse } from '../api/grammarApi';

interface Props {
  text: string;
  onApply: (correctedHtml: string) => void;
  onClose: () => void;
}

function toHtml(corrected: string): string {
  return corrected
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export function GrammarPanel({ text, onApply, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GrammarResponse | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await checkGrammar(text);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Grammar check failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(toHtml(result.correctedText));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2d2d2d] overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a] flex-shrink-0">
          <div>
            <h3 className="font-semibold text-[14px] text-gray-900 dark:text-white">Grammar &amp; Spellcheck</h3>
            <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">Let Claude proofread this text for spelling, grammar, and clarity</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Source preview + check button */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 dark:text-[#bbb] mb-1.5">
              Text to check
            </label>
            <div className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-gray-200 dark:border-[#3a3a3a] bg-gray-50 dark:bg-[#111] text-gray-700 dark:text-[#ccc] leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap break-words">
              {text.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() || '(empty)'}
            </div>
            {!loading && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleCheck}
                  disabled={!text.trim()}
                  className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[12.5px] transition-colors"
                >
                  {result ? '↻ Re-check' : 'Check grammar'}
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-gray-400 dark:text-[#666]">Claude is proofreading…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 text-[12px] text-rose-700 dark:text-rose-300">
              {error.toLowerCase().includes('not configured')
                ? 'Grammar check needs an AI provider configured on the server.'
                : error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Issues */}
              {result.issues.length > 0 ? (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                    {result.issues.length} issue{result.issues.length === 1 ? '' : 's'} found
                  </p>
                  <div className="space-y-2">
                    {result.issues.map((issue, i) => (
                      <div key={i} className="px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
                          <span className="line-through text-gray-500 dark:text-[#888]">{issue.original}</span>
                          <span className="text-amber-500">→</span>
                          <span className="font-semibold text-amber-700 dark:text-amber-300">{issue.suggestion}</span>
                        </div>
                        {issue.explanation && (
                          <p className="text-[11.5px] text-gray-500 dark:text-[#888] mt-1 leading-relaxed">{issue.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-[12px] text-emerald-700 dark:text-emerald-300">
                  No issues found — your text looks clean.
                </div>
              )}

              {/* Corrected preview */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-2">
                  Corrected version
                </p>
                <textarea
                  readOnly
                  value={result.correctedText}
                  rows={6}
                  className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#111] text-gray-800 dark:text-white outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleApply}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-semibold text-[12.5px] transition-colors"
              >
                Apply corrected version
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
