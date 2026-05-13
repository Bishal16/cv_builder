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
    <div className="p-6 bg-bg-surface rounded-2xl micro-border">
      <div className="flex justify-between items-start mb-6">
        <span className="text-text-muted font-mono text-xs">#{experience.id.substring(0, 4)}</span>
        <button
          onClick={onRemove}
          className="text-text-muted hover:text-rose-400 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Company</label>
          <input
            type="text"
            value={experience.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className="input-field"
            placeholder="Company name"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Role</label>
          <input
            type="text"
            value={experience.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="input-field"
            placeholder="Job title"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Start Date</label>
          <input
            type="text"
            value={experience.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="input-field"
            placeholder="Jan 2020"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">End Date</label>
          <input
            type="text"
            value={experience.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="input-field"
            placeholder="Dec 2023 or Present"
          />
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Description</label>
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