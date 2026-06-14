import type { Certification } from '../types/cv';

interface Props {
  cert: Certification;
  onChange: (cert: Certification) => void;
  onRemove: () => void;
}

export function CertificationItem({ cert, onChange, onRemove }: Props) {
  const set = (field: keyof Certification, value: string) =>
    onChange({ ...cert, [field]: value });

  return (
    <div className="card p-3 space-y-2">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            type="text"
            value={cert.name}
            onChange={(e) => set('name', e.target.value)}
            className="input-field"
            placeholder="Certification name (e.g. AWS Solutions Architect)"
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
          value={cert.issuer}
          onChange={(e) => set('issuer', e.target.value)}
          className="input-field flex-1"
          placeholder="Issuing organization"
        />
        <input
          type="text"
          value={cert.issueDate}
          onChange={(e) => set('issueDate', e.target.value)}
          className="input-field w-28"
          placeholder="Issued (2024-03)"
        />
        <input
          type="text"
          value={cert.expiryDate}
          onChange={(e) => set('expiryDate', e.target.value)}
          className="input-field w-28"
          placeholder="Expires (optional)"
        />
      </div>
    </div>
  );
}
