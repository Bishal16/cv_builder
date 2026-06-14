import { useState } from 'react';
import type { Award } from '../types/cv';
import { generateId } from '../utils/id';
import { ConfirmDialog } from './ConfirmDialog';
import { AwardItem } from './AwardItem';

interface Props {
  awards: Award[];
  onChange: (awards: Award[]) => void;
}

export function AwardList({ awards, onChange }: Props) {
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  const add = () => onChange([...awards, { id: generateId(), title: '', issuer: '', date: '', description: '' }]);
  const update = (i: number, updated: Award) => { const arr = [...awards]; arr[i] = updated; onChange(arr); };
  const confirm = () => { if (pendingRemoveIndex !== null) { onChange(awards.filter((_, i) => i !== pendingRemoveIndex)); setPendingRemoveIndex(null); } };

  const pending = pendingRemoveIndex !== null ? awards[pendingRemoveIndex] : null;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={add}
          aria-label="Add award"
          className="h-10 w-10 rounded-xl border border-border-subtle bg-bg-surface text-text-base transition-all hover:bg-bg-muted hover:shadow-sm active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>
      {awards.map((award, i) => (
        <AwardItem key={award.id} award={award} onChange={(u) => update(i, u)} onRemove={() => setPendingRemoveIndex(i)} />
      ))}
      {awards.length === 0 && (
        <p className="py-3 text-center text-sm text-text-dim">No awards added yet. Click + to start.</p>
      )}
      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title="Remove award?"
        message={`Remove "${pending?.title || `award #${(pendingRemoveIndex ?? 0) + 1}`}"? This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={confirm}
        onCancel={() => setPendingRemoveIndex(null)}
      />
    </div>
  );
}
