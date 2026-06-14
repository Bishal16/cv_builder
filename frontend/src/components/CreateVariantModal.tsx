import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCvStore } from '../store/cvStore';
import type { Cv, CreateCvData } from '../types/cv';

interface Props {
  cv: Cv;
  onClose: () => void;
  onCreated: (newCvId: string) => void;
}

export function CreateVariantModal({ cv, onClose, onCreated }: Props) {
  const { createCv } = useCvStore();
  const [variantName, setVariantName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const trimmedName = variantName.trim();
  const previewTitle = `${cv.title} — ${variantName || '…'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedName || submitting) return;

    const title = trimmedName ? `${cv.title} — ${trimmedName}` : `${cv.title} (Variant)`;

    const data: CreateCvData = {
      title,
      templateId: cv.templateId,
      sectionOrder: cv.sectionOrder,
      personalInfo: { ...cv.personalInfo },
      experiences: cv.experiences.map(item => ({ ...item, id: crypto.randomUUID() })),
      educations: cv.educations.map(item => ({ ...item, id: crypto.randomUUID() })),
      skills: cv.skills.map(item => ({ ...item, id: crypto.randomUUID() })),
      projects: cv.projects.map(item => ({ ...item, id: crypto.randomUUID() })),
      certifications: (cv.certifications ?? []).map(item => ({ ...item, id: crypto.randomUUID() })),
      languages: (cv.languages ?? []).map(item => ({ ...item, id: crypto.randomUUID() })),
      awards: (cv.awards ?? []).map(item => ({ ...item, id: crypto.randomUUID() })),
      ...(cv.accentColor !== undefined ? { accentColor: cv.accentColor } : {}),
      ...(cv.fontFamily !== undefined ? { fontFamily: cv.fontFamily } : {}),
      ...(cv.density !== undefined ? { density: cv.density } : {}),
    };

    setSubmitting(true);
    try {
      const newCv = await createCv(data);
      toast.success('Variant created');
      onCreated(newCv.id);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create variant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-[#3a3a3a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
          <h3 className="text-[14px] font-semibold text-[#111111] dark:text-white">Create a variant</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[13px] text-gray-500 dark:text-[#8d8d8d] leading-relaxed">
              Spin off a tailored copy of <strong className="text-[#111111] dark:text-white">"{cv.title}"</strong> — same content, new title. Great for targeting a specific company or role.
            </p>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-white mb-1.5">Variant name</label>
              <input
                type="text"
                value={variantName}
                onChange={e => setVariantName(e.target.value)}
                placeholder='e.g. "Google", "Startups", "Product roles"'
                className="w-full px-3 py-2.5 text-[13.5px] rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3a3a3a] text-[#111111] dark:text-white outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[#F97316]/15 transition-all placeholder:text-gray-400"
                autoFocus
              />
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-[#161616] border border-gray-100 dark:border-[#2a2a2a] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-[#6a6a6a] mb-0.5">New title</p>
              <p className="text-[13px] font-medium text-[#111111] dark:text-white truncate">{previewTitle}</p>
            </div>

            <button
              type="submit"
              disabled={submitting || !trimmedName}
              className="w-full py-2.5 rounded-lg text-[13.5px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
            >
              {submitting ? 'Creating…' : 'Create variant'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
