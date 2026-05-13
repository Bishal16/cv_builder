import type { TemplateId } from '../types/cv';
import { useThemeStore } from '../store/themeStore';

interface TemplateSelectorProps {
  templateId: TemplateId;
  onChange: (templateId: TemplateId) => void;
}

const templates = [
  { id: 'CLASSIC' as TemplateId, name: 'Classic', description: 'Traditional layout' },
  { id: 'MODERN' as TemplateId, name: 'Modern', description: 'Clean & creative' },
  { id: 'ATS' as TemplateId, name: 'ATS-Friendly', description: 'Optimized for bots' },
];

export function TemplateSelector({ templateId, onChange }: TemplateSelectorProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-text-base">Select Template</h2>
      <div className="grid grid-cols-3 gap-3">
        {templates.map((template) => (
          <label
            key={template.id}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${
              templateId === template.id
                ? isDark 
                  ? 'border-blue-500 bg-blue-500/20 text-white' 
                  : 'border-blue-500 bg-blue-50 text-blue-900'
                : isDark
                  ? 'border-white/10 bg-white/5 hover:border-white/30 text-white'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
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
            <div className={`text-2xl mb-2 ${templateId === template.id ? '' : isDark ? 'grayscale' : ''}`}>
              {template.id === 'CLASSIC' && '📄'}
              {template.id === 'MODERN' && '✨'}
              {template.id === 'ATS' && '🤖'}
            </div>
            <h3 className={`font-semibold ${templateId === template.id ? '' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {template.name}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {template.description}
            </p>
          </label>
        ))}
      </div>
    </div>
  );
}