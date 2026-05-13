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
      <div className="flex justify-end mb-3">
        <button
          onClick={onRemove}
          className="text-rose-500 hover:text-rose-600 text-sm font-medium"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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