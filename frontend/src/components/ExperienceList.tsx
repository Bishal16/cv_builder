import { useState } from 'react';
import type { Experience } from '../types/cv';
import { ConfirmDialog } from './ConfirmDialog';
import { ExperienceItem } from './ExperienceItem';

interface ExperienceListProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function ExperienceList({ experiences, onChange }: ExperienceListProps) {
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  const addExperience = () => {
    const newExperience: Experience = {
      id: generateId(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    onChange([...experiences, newExperience]);
  };

  const updateExperience = (index: number, updated: Experience) => {
    const updatedList = [...experiences];
    updatedList[index] = updated;
    onChange(updatedList);
  };

  const requestRemoveExperience = (index: number) => {
    setPendingRemoveIndex(index);
  };

  const confirmRemoveExperience = () => {
    if (pendingRemoveIndex === null) {
      return;
    }

    onChange(experiences.filter((_, i) => i !== pendingRemoveIndex));
    setPendingRemoveIndex(null);
  };

  const cancelRemoveExperience = () => {
    setPendingRemoveIndex(null);
  };

  const pendingExperience = pendingRemoveIndex !== null ? experiences[pendingRemoveIndex] : null;
  const pendingLabel =
    pendingExperience?.role ||
    pendingExperience?.company ||
    (pendingRemoveIndex !== null ? `experience #${pendingRemoveIndex + 1}` : 'this experience');

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addExperience}
          aria-label="Add experience"
          title="Add experience"
          className="h-10 w-10 rounded-xl border border-border-subtle bg-bg-surface text-text-base transition-all hover:bg-bg-muted hover:shadow-sm active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>
      {experiences.map((exp, index) => (
        <ExperienceItem
          key={exp.id}
          experience={exp}
          onChange={(updated) => updateExperience(index, updated)}
          onRemove={() => requestRemoveExperience(index)}
        />
      ))}
      {experiences.length === 0 && (
        <p className="py-3 text-center text-sm text-text-dim">No experience added yet. Click + to start.</p>
      )}
      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title="Remove experience?"
        message={`You're about to remove ${pendingLabel}. This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={confirmRemoveExperience}
        onCancel={cancelRemoveExperience}
      />
    </div>
  );
}
