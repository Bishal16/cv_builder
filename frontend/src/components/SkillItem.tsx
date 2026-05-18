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
    <div className="card flex items-center gap-2.5 p-2.5">
      <div className="w-48">
        <input
          type="text"
          value={skill.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="input-field"
          placeholder="Category (e.g. Backend)"
        />
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={skill.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="input-field"
          placeholder="Skill name"
        />
      </div>
      <div className="w-32">
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
        className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}