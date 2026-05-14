import { useState } from 'react';
import type { Skill } from '../types/cv';
import { ConfirmDialog } from './ConfirmDialog';
import { SkillItem } from './SkillItem';

interface SkillListProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addSkill}
          className="btn-primary !py-2 !px-4 !text-sm"
        >
          + Add
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
        <p className="text-center py-4 text-text-dim">No skills added yet. Click "Add" to start.</p>
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
