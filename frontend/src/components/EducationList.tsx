import { useState } from 'react';
import type { Education } from '../types/cv';
import { ConfirmDialog } from './ConfirmDialog';
import { EducationItem } from './EducationItem';

interface EducationListProps {
  education: Education[];
  onChange: (educations: Education[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function EducationList({ education, onChange }: EducationListProps) {
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  const addEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      graduationYear: '',
    };
    onChange([...education, newEducation]);
  };

  const updateEducation = (index: number, updated: Education) => {
    const updatedList = [...education];
    updatedList[index] = updated;
    onChange(updatedList);
  };

  const requestRemoveEducation = (index: number) => {
    setPendingRemoveIndex(index);
  };

  const confirmRemoveEducation = () => {
    if (pendingRemoveIndex === null) {
      return;
    }

    onChange(education.filter((_, i) => i !== pendingRemoveIndex));
    setPendingRemoveIndex(null);
  };

  const cancelRemoveEducation = () => {
    setPendingRemoveIndex(null);
  };

  const pendingEducation = pendingRemoveIndex !== null ? education[pendingRemoveIndex] : null;
  const pendingLabel =
    pendingEducation?.institution ||
    pendingEducation?.degree ||
    (pendingRemoveIndex !== null ? `education #${pendingRemoveIndex + 1}` : 'this education');

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addEducation}
          aria-label="Add education"
          title="Add education"
          className="h-10 w-10 rounded-xl border border-border-subtle bg-bg-surface text-text-base transition-all hover:bg-bg-muted hover:shadow-sm active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>
      {education.map((edu, index) => (
        <EducationItem
          key={edu.id}
          education={edu}
          onChange={(updated) => updateEducation(index, updated)}
          onRemove={() => requestRemoveEducation(index)}
        />
      ))}
      {education.length === 0 && (
        <p className="py-3 text-center text-sm text-text-dim">No education added yet. Click + to start.</p>
      )}
      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title="Remove education?"
        message={`You're about to remove ${pendingLabel}. This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={confirmRemoveEducation}
        onCancel={cancelRemoveEducation}
      />
    </div>
  );
}
