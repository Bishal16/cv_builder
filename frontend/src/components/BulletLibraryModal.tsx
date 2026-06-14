import { useMemo, useState } from 'react';
import { BULLET_LIBRARY, type BulletCategory } from '../data/bulletLibrary';

interface BulletLibraryModalProps {
  onInsert: (bulletsHtml: string) => void;
  onClose: () => void;
}

interface SearchResult {
  category: BulletCategory;
  bullets: string[];
}

export function BulletLibraryModal({ onInsert, onClose }: BulletLibraryModalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(BULLET_LIBRARY[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const query = search.trim().toLowerCase();

  // When searching, show matches across every category; otherwise show the active category.
  const results = useMemo<SearchResult[]>(() => {
    if (!query) {
      const active = BULLET_LIBRARY.find((c) => c.id === activeCategoryId);
      return active ? [{ category: active, bullets: active.bullets }] : [];
    }
    return BULLET_LIBRARY.map((category) => ({
      category,
      bullets: category.bullets.filter((b) => b.toLowerCase().includes(query)),
    })).filter((r) => r.bullets.length > 0);
  }, [query, activeCategoryId]);

  const toggle = (bullet: string) => {
    setSelected((prev) =>
      prev.includes(bullet) ? prev.filter((b) => b !== bullet) : [...prev, bullet]
    );
  };

  const handleInsert = () => {
    if (selected.length === 0) return;
    const html = '<ul>' + selected.map((b) => `<li>${b}</li>`).join('') + '</ul>';
    onInsert(html);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2d2d2d] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-2.5">
            <span className="text-[18px]">📋</span>
            <div>
              <h3 className="font-semibold text-[14px] text-gray-900 dark:text-white">Example bullets</h3>
              <p className="text-[11px] text-gray-400 dark:text-[#666]">
                Pick proven bullets and tailor them to your experience.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bullets across all categories…"
            className="w-full rounded-xl border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#161616] px-3.5 py-2 text-[12px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#666] focus:outline-none focus:border-[#F97316] transition-colors"
          />
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 px-5 py-4 gap-4">
          {/* Categories */}
          <div className="w-40 shrink-0 overflow-y-auto pr-1">
            <div className="flex flex-col gap-1">
              {BULLET_LIBRARY.map((category) => {
                const active = !query && category.id === activeCategoryId;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategoryId(category.id);
                      setSearch('');
                    }}
                    className={`text-left rounded-lg px-3 py-2 text-[12px] transition-colors ${
                      active
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-[#F97316] font-semibold'
                        : 'text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bullets */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-[12px] text-gray-400 dark:text-[#666] py-6 text-center">
                No bullets match “{search.trim()}”.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map(({ category, bullets }) => (
                  <div key={category.id}>
                    {query && (
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-400 dark:text-[#666]">
                        {category.label}
                      </p>
                    )}
                    <div className="space-y-2">
                      {bullets.map((bullet) => {
                        const isSelected = selected.includes(bullet);
                        return (
                          <label
                            key={bullet}
                            className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-all text-[12px] leading-relaxed ${
                              isSelected
                                ? 'border-[#F97316] bg-orange-50 dark:bg-orange-900/20 text-gray-900 dark:text-white'
                                : 'border-gray-200 dark:border-[#2d2d2d] hover:border-gray-300 dark:hover:border-[#444] text-gray-700 dark:text-[#ccc]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggle(bullet)}
                              className="mt-0.5 h-4 w-4 shrink-0 accent-[#F97316] cursor-pointer"
                            />
                            <span>{bullet}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#161616]">
          <span className="text-[12px] text-gray-400 dark:text-[#666]">
            {selected.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[12px] text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={selected.length === 0}
              className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-colors"
            >
              Insert {selected.length} selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
