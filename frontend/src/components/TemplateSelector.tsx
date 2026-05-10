import type { TemplateId } from '../types/cv';

interface TemplateSelectorProps {
  templateId: TemplateId;
  onChange: (templateId: TemplateId) => void;
}

const templates = [
  { id: 'CLASSIC' as TemplateId, name: 'Classic', description: 'Traditional layout', icon: '📄' },
  { id: 'MODERN' as TemplateId, name: 'Modern', description: 'Clean & creative', icon: '✨' },
  { id: 'ATS' as TemplateId, name: 'ATS-Friendly', description: 'Optimized for bots', icon: '🤖' },
];

export function TemplateSelector({ templateId, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Select Template</h2>
      <div className="grid grid-cols-3 gap-3">
        {templates.map((template) => (
          <label
            key={template.id}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${
              templateId === template.id
                ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30'
                : 'border-white/20 bg-white/5 hover:border-white/40'
            }`}
          >
            <input
              type="radio"
              name="template"
              value={template.id}
              checked={templateId === template.id}
              onChange={() => onChange(template.id)}
              className="sr-only"
            />
            <div className="text-2xl mb-2">{template.icon}</div>
            <h3 className="font-medium text-white">{template.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{template.description}</p>
          </label>
        ))}
      </div>
    </div>
  );
}