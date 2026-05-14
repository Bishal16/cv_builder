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
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addExperience}
          className="btn-primary !py-2 !px-4 !text-sm"
        >
          + Add
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
        <p className="text-center py-4 text-text-dim">No experience added yet. Click "Add" to start.</p>
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
