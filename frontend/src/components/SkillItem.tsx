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

  const inputClass = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm";

  const levels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <div className="flex gap-3 items-center p-3 bg-white/5 rounded-xl border border-white/10">
      <div className="flex-1">
        <input
          type="text"
          value={skill.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={inputClass}
          placeholder="Skill name"
        />
      </div>
      <div className="w-40">
        <select
          value={skill.level}
          onChange={(e) => handleChange('level', e.target.value)}
          className={inputClass}
        >
          {levels.map(level => (
            <option key={level} value={level} className="bg-gray-800">
              {level || 'Level'}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-300 p-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}