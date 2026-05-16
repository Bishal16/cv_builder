import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { Experience } from '../types/cv';

interface ExperienceItemProps {
  experience: Experience;
  onChange: (experience: Experience) => void;
  onRemove: () => void;
}

export function ExperienceItem({ experience, onChange, onRemove }: ExperienceItemProps) {
  const handleChange = (field: keyof Experience, value: string) => {
    onChange({ ...experience, [field]: value });
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-xs font-mono text-text-dim">#{experience.id.substring(0, 4)}</span>
        <button
          onClick={onRemove}
          className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-500 transition-colors hover:text-rose-600"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="form-label">Company</label>
          <input
            type="text"
            value={experience.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className="input-field"
            placeholder="Company name"
          />
        </div>
        <div>
          <label className="form-label">Role</label>
          <input
            type="text"
            value={experience.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="input-field"
            placeholder="Job title"
          />
        </div>
        <div>
          <label className="form-label">Start Date</label>
          <input
            type="text"
            value={experience.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="input-field"
            placeholder="Jan 2020"
          />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input
            type="text"
            value={experience.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="input-field"
            placeholder="Dec 2023 or Present"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="form-label">Description</label>
        <div className="rich-text-editor sm">
          <ReactQuill
            theme="snow"
            value={experience.description}
            onChange={(value) => handleChange('description', value)}
            modules={modules}
            placeholder="Describe your responsibilities and achievements..."
          />
        </div>
      </div>
    </div>
  );
}