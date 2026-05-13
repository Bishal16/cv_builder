import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { PersonalInfo } from '../types/cv';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
}

export function PersonalInfoForm({ personalInfo, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...personalInfo, [field]: value });
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Full Name</label>
          <input
            type="text"
            value={personalInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-field"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Email Address</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="input-field"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Phone</label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="input-field"
            placeholder="+1 234 567 8900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Location</label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="input-field"
            placeholder="New York, NY"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Professional Summary</label>
        <div className="rich-text-editor">
          <ReactQuill
            theme="snow"
            value={personalInfo.summary}
            onChange={(value) => handleChange('summary', value)}
            modules={modules}
            placeholder="A brief summary about yourself..."
          />
        </div>
      </div>
    </div>
  );
}