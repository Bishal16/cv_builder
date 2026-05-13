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
      <div className="flex justify-between items-center">
        <h3 className="text-white font-medium">Skills</h3>
        <button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
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
        <p className="text-gray-400 text-center py-4">No skills added yet. Click "Add" to start.</p>
      )}
    </div>
  );
}