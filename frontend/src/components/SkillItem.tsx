import type { Skill } from '../types/cv';

interface SkillItemProps {
  skill: Skill;
  onChange: (skill: Skill) => void;
  onRemove: () => void;
}

export function SkillItem({ skill, onChange, onRemove }: SkillItemProps) {
  const handleChange = (field: keyof Skill, value: string) => {
    onChange({ ...skill, [field]: value });
  };

  const levels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <div className="flex gap-3 items-center p-3 card">
      <div className="flex-1">
        <input
          type="text"
          value={skill.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="input-field"
          placeholder="Skill name"
        />
      </div>
      <div className="w-44">
        <select
          value={skill.level}
          onChange={(e) => handleChange('level', e.target.value)}
          className="input-field"
        >
          {levels.map(level => (
            <option key={level} value={level}>
              {level || 'Level'}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onRemove}
        className="text-rose-500 hover:text-rose-600 p-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}