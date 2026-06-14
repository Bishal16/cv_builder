import type { Language, LanguageProficiency } from '../types/cv';

interface Props {
  language: Language;
  onChange: (language: Language) => void;
  onRemove: () => void;
}

const PROFICIENCY_LEVELS: LanguageProficiency[] = ['', 'Basic', 'Conversational', 'Fluent', 'Native'];

export function LanguageItem({ language, onChange, onRemove }: Props) {
  return (
    <div className="card flex items-center gap-2.5 p-2.5">
      <div className="flex-1">
        <input
          type="text"
          value={language.name}
          onChange={(e) => onChange({ ...language, name: e.target.value })}
          className="input-field"
          placeholder="Language (e.g. Spanish)"
        />
      </div>
      <div className="w-36">
        <select
          value={language.proficiency}
          onChange={(e) => onChange({ ...language, proficiency: e.target.value as LanguageProficiency })}
          className="input-field"
        >
          {PROFICIENCY_LEVELS.map((level) => (
            <option key={level} value={level}>{level || 'Proficiency'}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onRemove}
        className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
