import type { PersonalInfo } from '../types/cv';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
}

export function PersonalInfoForm({ personalInfo, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...personalInfo, [field]: value });
  };

  const inputClass = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={personalInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={inputClass}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClass}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Phone</label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClass}
            placeholder="+1 234 567 8900"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={inputClass}
            placeholder="New York, NY"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-2">Summary</label>
        <textarea
          value={personalInfo.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="A brief summary about yourself..."
        />
      </div>
    </div>
  );
}