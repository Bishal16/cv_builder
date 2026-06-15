import { useState } from 'react';
import { getSuggestions, type AiSuggestRequest } from '../api/aiApi';

interface AiSuggestPanelProps {
  request: AiSuggestRequest;
  onApply: (text: string) => void;
  onClose: () => void;
}

export function AiSuggestPanel({ request, onApply, onClose }: AiSuggestPanelProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    setFetched(false);
    setSelected(null);
    try {
      const result = await getSuggestions(request);
      setSuggestions(result);
      setFetched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selected !== null && suggestions[selected]) {
      const text = suggestions[selected];
      // Wrap plain bullet text in list items for rich-text fields
      if (request.type !== 'summary' && text.includes('•')) {
        const items = text.split('\n').filter(l => l.trim().startsWith('•')).map(l => l.replace(/^•\s*/, '').trim());
        const html = '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
        onApply(html);
      } else {
        // Wrap plain text in <p> tags for the rich-text editor
        const html = text.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
        onApply(html);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2d2d2d] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-2.5">
            <span className="text-[18px]">✨</span>
            <div>
              <h3 className="font-semibold text-[14px] text-gray-900 dark:text-white">AI Suggestions</h3>
              <p className="text-[11px] text-gray-400 dark:text-[#666]">
                {request.type === 'summary' ? 'Professional summary rewrites' :
                 request.type === 'experience' ? 'Experience bullet rewrites' :
                 'Project description rewrites'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {!fetched && !loading && (
            <div className="text-center py-6">
              <p className="text-[13px] text-gray-500 dark:text-[#888] mb-4">
                Claude will generate 3 alternative versions. Pick the one you like best.
              </p>
              <button
                onClick={fetch}
                className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-semibold text-[13px] transition-colors"
              >
                ✨ Generate suggestions
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-gray-400 dark:text-[#666]">Claude is thinking…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 text-[12px] text-rose-700 dark:text-rose-300">
              {error.includes('not configured') ?
                'AI suggestions need an AI provider configured on the server.' :
                error}
            </div>
          )}

          {fetched && suggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] text-gray-400 dark:text-[#666] mb-2">Click a version to select it, then Apply.</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(selected === i ? null : i)}
                  className={`w-full text-left rounded-xl border p-4 transition-all text-[12px] leading-relaxed whitespace-pre-wrap ${
                    selected === i
                      ? 'border-[#F97316] bg-orange-50 dark:bg-orange-900/20 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-[#2d2d2d] hover:border-gray-300 dark:hover:border-[#444] text-gray-700 dark:text-[#ccc]'
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-400 dark:text-[#666]">
                    Version {i + 1}
                  </span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {fetched && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#161616]">
            <button
              onClick={fetch}
              className="text-[12px] text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              ↻ Regenerate
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-[12px] text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={selected === null}
                className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
