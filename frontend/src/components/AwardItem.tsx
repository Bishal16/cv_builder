import type { Award } from '../types/cv';

interface Props {
  award: Award;
  onChange: (award: Award) => void;
  onRemove: () => void;
}

export function AwardItem({ award, onChange, onRemove }: Props) {
  const set = (field: keyof Award, value: string) => onChange({ ...award, [field]: value });

  return (
    <div className="card p-3 space-y-2">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            type="text"
            value={award.title}
            onChange={(e) => set('title', e.target.value)}
            className="input-field"
            placeholder="Award title (e.g. Employee of the Year)"
          />
        </div>
        <button
          onClick={onRemove}
          className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 mt-0.5 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={award.issuer}
          onChange={(e) => set('issuer', e.target.value)}
          className="input-field flex-1"
          placeholder="Issuing organization"
        />
        <input
          type="text"
          value={award.date}
          onChange={(e) => set('date', e.target.value)}
          className="input-field w-28"
          placeholder="Year (e.g. 2023)"
        />
      </div>
      <input
        type="text"
        value={award.description}
        onChange={(e) => set('description', e.target.value)}
        className="input-field w-full"
        placeholder="Brief description (optional)"
      />
    </div>
  );
}
