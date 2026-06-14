import { useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import type { PersonalInfo } from '../types/cv';
import { AiSuggestPanel } from './AiSuggestPanel';
import { GrammarPanel } from './GrammarPanel';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
}

/**
 * Read an image File, downscale to a max dimension, and return a JPEG data-URL.
 * Keeps the stored base64 small enough to live inside the CV payload + PDF.
 */
function fileToScaledDataUrl(file: File, max = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unsupported'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function PhotoField({ personalInfo, onChange }: PersonalInfoFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const photo = personalInfo.photoUrl;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error('Image is too large (max 8MB)'); return; }
    setBusy(true);
    try {
      const dataUrl = await fileToScaledDataUrl(file);
      onChange({ ...personalInfo, photoUrl: dataUrl });
    } catch {
      toast.error('Could not process that image');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--muted-bg)' }}
      >
        {photo ? (
          <img src={photo} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-placeholder)' }}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75H4.5v-.75z" />
            </svg>
          </div>
        )}
      </div>
      <div>
        <label className="form-label">Profile Photo</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-secondary !py-1.5 !px-3 !text-[12px] disabled:opacity-50"
          >
            {busy ? 'Processing…' : photo ? 'Replace' : 'Upload photo'}
          </button>
          {photo && (
            <button
              type="button"
              onClick={() => onChange({ ...personalInfo, photoUrl: '' })}
              className="text-[12px] font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-dim)' }}>
          Used by photo templates (Aurora, Polished). JPG/PNG, auto-resized.
        </p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

export function PersonalInfoForm({ personalInfo, onChange }: PersonalInfoFormProps) {
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);

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
      <PhotoField personalInfo={personalInfo} onChange={onChange} />

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
        <div className="flex items-center justify-between mb-1">
          <label className="form-label !mb-0">Professional Summary</label>
          <div className="flex items-center gap-3">
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

      {showAiPanel && (
        <AiSuggestPanel
          request={{ type: 'summary', content: personalInfo.summary }}
          onApply={(text) => handleChange('summary', text)}
          onClose={() => setShowAiPanel(false)}
        />
      )}

      {showGrammar && (
        <GrammarPanel
          text={personalInfo.summary}
          onApply={(html) => handleChange('summary', html)}
          onClose={() => setShowGrammar(false)}
        />
      )}
    </div>
  );
}
