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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            value={personalInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-field"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="input-field"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="input-field"
            placeholder="+1 234 567 8900"
          />
        </div>
        <div>
          <label className="form-label">Location</label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="input-field"
            placeholder="New York, NY"
          />
        </div>
        <div>
          <label className="form-label">LinkedIn URL</label>
          <input
            type="url"
            value={personalInfo.linkedinUrl}
            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
            className="input-field"
            placeholder="https://linkedin.com/in/your-handle"
          />
        </div>
        <div>
          <label className="form-label">GitHub URL</label>
          <input
            type="url"
            value={personalInfo.githubUrl}
            onChange={(e) => handleChange('githubUrl', e.target.value)}
            className="input-field"
            placeholder="https://github.com/your-username"
          />
        </div>
      </div>
      <div className="pt-1">
        <label className="form-label">Professional Summary</label>
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