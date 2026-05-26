import { useState } from 'react';
import type { Skill } from '../types/cv';
import { generateId } from '../utils/id';
import { ConfirmDialog } from './ConfirmDialog';
import { SkillItem } from './SkillItem';

interface SkillListProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillList({ skills, onChange }: SkillListProps) {
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  const addSkill = () => {
    const newSkill: Skill = {
      id: generateId(),
      name: '',
      level: '',
    };
    onChange([...skills, newSkill]);
  };

  const updateSkill = (index: number, updated: Skill) => {
    const updatedList = [...skills];
    updatedList[index] = updated;
    onChange(updatedList);
  };

  const requestRemoveSkill = (index: number) => {
    setPendingRemoveIndex(index);
  };

  const confirmRemoveSkill = () => {
    if (pendingRemoveIndex === null) {
      return;
    }

    onChange(skills.filter((_, i) => i !== pendingRemoveIndex));
    setPendingRemoveIndex(null);
  };

  const cancelRemoveSkill = () => {
    setPendingRemoveIndex(null);
  };

  const pendingSkill = pendingRemoveIndex !== null ? skills[pendingRemoveIndex] : null;
  const pendingLabel =
    pendingSkill?.name ||
    (pendingRemoveIndex !== null ? `skill #${pendingRemoveIndex + 1}` : 'this skill');

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addSkill}
          aria-label="Add skill"
          title="Add skill"
          className="h-10 w-10 rounded-xl border border-border-subtle bg-bg-surface text-text-base transition-all hover:bg-bg-muted hover:shadow-sm active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>
      {skills.map((skill, index) => (
        <SkillItem
          key={skill.id}
          skill={skill}
          onChange={(updated) => updateSkill(index, updated)}
          onRemove={() => requestRemoveSkill(index)}
        />
      ))}
      {skills.length === 0 && (
        <p className="py-3 text-center text-sm text-text-dim">No skills added yet. Click + to start.</p>
      )}
      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title="Remove skill?"
        message={`You're about to remove ${pendingLabel}. This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={confirmRemoveSkill}
        onCancel={cancelRemoveSkill}
      />
    </div>
  );
}
