import { useState } from 'react';
import type { Language } from '../types/cv';
import { generateId } from '../utils/id';
import { ConfirmDialog } from './ConfirmDialog';
import { LanguageItem } from './LanguageItem';

interface Props {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

export function LanguageList({ languages, onChange }: Props) {
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  const add = () => onChange([...languages, { id: generateId(), name: '', proficiency: '' }]);
  const update = (i: number, updated: Language) => { const arr = [...languages]; arr[i] = updated; onChange(arr); };
  const confirm = () => { if (pendingRemoveIndex !== null) { onChange(languages.filter((_, i) => i !== pendingRemoveIndex)); setPendingRemoveIndex(null); } };

  const pending = pendingRemoveIndex !== null ? languages[pendingRemoveIndex] : null;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={add}
          aria-label="Add language"
          className="h-10 w-10 rounded-xl border border-border-subtle bg-bg-surface text-text-base transition-all hover:bg-bg-muted hover:shadow-sm active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>
      {languages.map((lang, i) => (
        <LanguageItem key={lang.id} language={lang} onChange={(u) => update(i, u)} onRemove={() => setPendingRemoveIndex(i)} />
      ))}
      {languages.length === 0 && (
        <p className="py-3 text-center text-sm text-text-dim">No languages added yet. Click + to start.</p>
      )}
      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title="Remove language?"
        message={`Remove "${pending?.name || `language #${(pendingRemoveIndex ?? 0) + 1}`}"? This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={confirm}
        onCancel={() => setPendingRemoveIndex(null)}
      />
    </div>
  );
}
