import type { Education } from '../types/cv';

interface EducationItemProps {
  education: Education;
  onChange: (education: Education) => void;
  onRemove: () => void;
}

export function EducationItem({ education, onChange, onRemove }: EducationItemProps) {
  const handleChange = (field: keyof Education, value: string) => {
    onChange({ ...education, [field]: value });
  };

  const inputClass = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm";

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="flex justify-end mb-3">
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Institution</label>
          <input
            type="text"
            value={education.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
            className={inputClass}
            placeholder="University name"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Degree</label>
          <input
            type="text"
            value={education.degree}
            onChange={(e) => handleChange('degree', e.target.value)}
            className={inputClass}
            placeholder="Bachelor's, Master's..."
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Field of Study</label>
          <input
            type="text"
            value={education.field}
            onChange={(e) => handleChange('field', e.target.value)}
            className={inputClass}
            placeholder="Computer Science"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Graduation Year</label>
          <input
            type="text"
            value={education.graduationYear}
            onChange={(e) => handleChange('graduationYear', e.target.value)}
            className={inputClass}
            placeholder="2024"
          />
        </div>
      </div>
    </div>
  );
}