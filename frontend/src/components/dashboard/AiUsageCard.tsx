import { useEffect, useState } from 'react';
import { getAiUsage, type AiUsageStatus } from '../../api/aiApi';

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'now';
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) {
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s}s`;
  }
  return `${Math.floor(ms / 1000)}s`;
}

export function AiUsageCard() {
  const [usage, setUsage] = useState<AiUsageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = () => {
    setLoading(true);
    setError(null);
    getAiUsage()
      .then((u) => setUsage(u))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load usage'))
      .finally(() => setLoading(false));
  };

  // initial fetch — state is set only inside async callbacks (not synchronously)
  useEffect(() => {
    let active = true;
    getAiUsage()
      .then((u) => { if (active) { setUsage(u); setError(null); } })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : 'Could not load usage'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // tick the countdown every second while a window is active
  useEffect(() => {
    if (!usage?.resetsAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [usage?.resetsAt]);

  const pct = usage && usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;
  const barColor = pct >= 100 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
  const resetMs = usage?.resetsAt ? new Date(usage.resetsAt).getTime() - now : 0;

  return (
    <section
      id="usage"
      className="scroll-mt-24 rounded-xl border border-gray-200 dark:border-[#383838] bg-white dark:bg-[#232323] overflow-hidden"
    >
      <div className="px-6 pt-5 pb-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[14.5px] font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">
            AI Usage
          </h3>
          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            className="text-[12px] text-gray-400 hover:text-[#111] dark:hover:text-white transition-colors disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>
        <p className="text-[13px] text-gray-500 dark:text-[#8d8d8d] mt-1 leading-relaxed">
          Shared daily allowance for all AI features (suggestions, tailoring, cover letters, grammar, import).
        </p>

        <div className="mt-4">
          {loading && !usage ? (
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#2a2a2a] animate-pulse" />
          ) : error ? (
            <p className="text-[12.5px] text-rose-600 dark:text-rose-400">{error}</p>
          ) : usage ? (
            <>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-[13px] font-semibold text-[#111111] dark:text-white tabular-nums">
                  {usage.used} <span className="text-gray-400 dark:text-[#777] font-normal">/ {usage.limit} requests</span>
                </span>
                <span className="text-[12px] font-medium" style={{ color: barColor }}>
                  {usage.remaining} left
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-150 dark:bg-[#2a2a2a] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[12px]">
                {usage.resetsAt ? (
                  <span className="text-gray-500 dark:text-[#8d8d8d]">
                    Resets in <span className="font-semibold text-[#111111] dark:text-white tabular-nums">{formatCountdown(resetMs)}</span>
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-[#777]">Full — the window starts on your next AI action</span>
                )}
                {pct >= 100 && (
                  <span className="text-rose-500 font-medium">Limit reached</span>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="px-6 py-3 border-t border-gray-100 dark:border-[#2e2e2e] bg-gray-50/80 dark:bg-[#1e1e1e]">
        <p className="text-[12px] text-gray-400 dark:text-[#6a6a6a]">
          Free tier shared across the app. Hitting the cap often? Bring your own API key for unlimited use.
        </p>
      </div>
    </section>
  );
}
