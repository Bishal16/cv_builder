import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { Experience } from '../types/cv';
import { AiSuggestPanel } from './AiSuggestPanel';
import { BulletLibraryModal } from './BulletLibraryModal';
import { GrammarPanel } from './GrammarPanel';
import { RICH_TEXT_MODULES } from '../utils/quillConfig';

interface ExperienceItemProps {
  experience: Experience;
  onChange: (experience: Experience) => void;
  onRemove: () => void;
}

export function ExperienceItem({ experience, onChange, onRemove }: ExperienceItemProps) {
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showBulletLibrary, setShowBulletLibrary] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);

  const handleChange = (field: keyof Experience, value: string) => {
    onChange({ ...experience, [field]: value });
  };

  const modules = RICH_TEXT_MODULES;

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-xs font-mono text-text-dim">#{experience.id.substring(0, 4)}</span>
        <button
          onClick={onRemove}
          className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-500 transition-colors hover:text-rose-600"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="form-label">Company</label>
          <input
            type="text"
            value={experience.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className="input-field"
            placeholder="Company name"
          />
        </div>
        <div>
          <label className="form-label">Role</label>
          <input
            type="text"
            value={experience.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="input-field"
            placeholder="Job title"
          />
        </div>
        <div>
          <label className="form-label">Start Date</label>
          <input
            type="text"
            value={experience.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="input-field"
            placeholder="Jan 2020"
          />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input
            type="text"
            value={experience.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="input-field"
            placeholder="Dec 2023 or Present"
          />
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <label className="form-label !mb-0">Description</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowBulletLibrary(true)}
              className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-[#111] dark:text-[#999] dark:hover:text-white transition-colors"
              title="Insert example bullets"
            >
              <span>📋</span> Examples
            </button>
            <button
              type="button"
              onClick={() => setShowGrammar(true)}
              className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-[#111] dark:text-[#999] dark:hover:text-white transition-colors"
              title="Check grammar & spelling"
            >
              <span>🔤</span> Grammar
            </button>
            <button
              type="button"
              onClick={() => setShowAiPanel(true)}
              className="flex items-center gap-1 text-[11px] font-medium text-[#F97316] hover:text-orange-600 transition-colors"
              title="Improve with AI"
            >
              <span>✨</span> Improve with AI
            </button>
          </div>
        </div>
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

      {showAiPanel && (
        <AiSuggestPanel
          request={{
            type: 'experience',
            content: experience.description,
            context: `${experience.role} at ${experience.company}`,
          }}
          onApply={(text) => handleChange('description', text)}
          onClose={() => setShowAiPanel(false)}
        />
      )}

      {showBulletLibrary && (
        <BulletLibraryModal
          onInsert={(html) => handleChange('description', (experience.description ?? '') + html)}
          onClose={() => setShowBulletLibrary(false)}
        />
      )}

      {showGrammar && (
        <GrammarPanel
          text={experience.description}
          onApply={(html) => handleChange('description', html)}
          onClose={() => setShowGrammar(false)}
        />
      )}
    </div>
  );
}