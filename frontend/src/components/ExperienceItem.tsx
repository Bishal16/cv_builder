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
    <div className="card p-5">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-mono text-text-dim">#{experience.id.substring(0, 4)}</span>
        <button
          onClick={onRemove}
          className="text-rose-500 hover:text-rose-600 text-sm font-medium"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="mt-4">
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