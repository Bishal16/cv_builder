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

  return (
    <div className="card p-4">
      <div className="mb-3 flex justify-end">
        <button
          onClick={onRemove}
          className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-500 transition-colors hover:text-rose-600"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="form-label">Institution</label>
          <input
            type="text"
            value={education.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
            className="input-field"
            placeholder="University name"
          />
        </div>
        <div>
          <label className="form-label">Degree</label>
          <input
            type="text"
            value={education.degree}
            onChange={(e) => handleChange('degree', e.target.value)}
            className="input-field"
            placeholder="Bachelor's, Master's..."
          />
        </div>
        <div>
          <label className="form-label">Field of Study</label>
          <input
            type="text"
            value={education.field}
            onChange={(e) => handleChange('field', e.target.value)}
            className="input-field"
            placeholder="Computer Science"
          />
        </div>
        <div>
          <label className="form-label">Graduation Year</label>
          <input
            type="text"
            value={education.graduationYear}
            onChange={(e) => handleChange('graduationYear', e.target.value)}
            className="input-field"
            placeholder="2024"
          />
        </div>
      </div>
    </div>
  );
}