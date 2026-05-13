import type { Skill } from '../types/cv';
import { SkillItem } from './SkillItem';

interface SkillListProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function SkillList({ skills, onChange }: SkillListProps) {
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

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

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
          onRemove={() => removeSkill(index)}
        />
      ))}
      {skills.length === 0 && (
        <p className="text-center py-4 text-text-dim">No skills added yet. Click "Add" to start.</p>
      )}
    </div>
  );
}