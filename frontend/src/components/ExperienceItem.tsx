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

  const inputClass = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm";

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="flex justify-between items-start mb-3">
        <span className="text-gray-400 text-sm">#{experience.id.substring(0, 4)}</span>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Company</label>
          <input
            type="text"
            value={experience.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={inputClass}
            placeholder="Company name"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Role</label>
          <input
            type="text"
            value={experience.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className={inputClass}
            placeholder="Job title"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Start Date</label>
          <input
            type="text"
            value={experience.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className={inputClass}
            placeholder="Jan 2020"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">End Date</label>
          <input
            type="text"
            value={experience.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className={inputClass}
            placeholder="Dec 2023 or Present"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-xs text-gray-400 mb-1">Description</label>
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