import { useState } from 'react';
import type { Certification } from '../types/cv';
import { generateId } from '../utils/id';
import { ConfirmDialog } from './ConfirmDialog';
import { CertificationItem } from './CertificationItem';

interface Props {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export function CertificationList({ certifications, onChange }: Props) {
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  const add = () => onChange([...certifications, { id: generateId(), name: '', issuer: '', issueDate: '', expiryDate: '' }]);
  const update = (i: number, updated: Certification) => { const arr = [...certifications]; arr[i] = updated; onChange(arr); };
  const confirm = () => { if (pendingRemoveIndex !== null) { onChange(certifications.filter((_, i) => i !== pendingRemoveIndex)); setPendingRemoveIndex(null); } };

  const pending = pendingRemoveIndex !== null ? certifications[pendingRemoveIndex] : null;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={add}
          aria-label="Add certification"
          className="h-10 w-10 rounded-xl border border-border-subtle bg-bg-surface text-text-base transition-all hover:bg-bg-muted hover:shadow-sm active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>
      {certifications.map((cert, i) => (
        <CertificationItem key={cert.id} cert={cert} onChange={(u) => update(i, u)} onRemove={() => setPendingRemoveIndex(i)} />
      ))}
      {certifications.length === 0 && (
        <p className="py-3 text-center text-sm text-text-dim">No certifications added yet. Click + to start.</p>
      )}
      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title="Remove certification?"
        message={`Remove "${pending?.name || `certification #${(pendingRemoveIndex ?? 0) + 1}`}"? This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={confirm}
        onCancel={() => setPendingRemoveIndex(null)}
      />
    </div>
  );
}
