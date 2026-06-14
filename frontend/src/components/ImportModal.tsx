import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { importResume } from '../api/aiApi';
import { useCvStore } from '../store/cvStore';
import type { CreateCvRequest } from '../types/cv';

interface Props {
  onClose: () => void;
}

export function ImportModal({ onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const { createCv } = useCvStore();
  const navigate = useNavigate();

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10 MB)');
      return;
    }
    setFileName(file.name);
    setLoading(true);
    try {
      const parsed = await importResume(file) as CreateCvRequest;
      const cv = await createCv({
        ...parsed,
        title: parsed.title || file.name.replace(/\.(pdf|docx)$/i, '') + ' (imported)',
      });
      toast.success('Resume imported successfully');
      navigate(`/cv/${cv.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
      setLoading(false);
      setFileName('');
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-[#3a3a3a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111111] dark:text-white">Import resume</h3>
            <p className="text-[11px] text-gray-400 dark:text-[#666] mt-0.5">PDF or DOCX → auto-filled form</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors disabled:opacity-40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-[13.5px] font-semibold text-[#111111] dark:text-white">{fileName}</p>
                <p className="text-[12px] text-gray-400 dark:text-[#666] mt-1">Claude is parsing your resume…</p>
              </div>
            </div>
          ) : (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl cursor-pointer transition-all p-8 text-center ${
                  dragging
                    ? 'border-[#F97316] bg-orange-50 dark:bg-orange-900/10'
                    : 'border-gray-200 dark:border-[#3a3a3a] hover:border-[#F97316]/50 hover:bg-gray-50 dark:hover:bg-[#222]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-[13.5px] font-semibold text-[#111111] dark:text-white mb-1">
                  Drop your resume here
                </p>
                <p className="text-[12px] text-gray-400 dark:text-[#666]">
                  or click to browse · PDF or DOCX · max 10 MB
                </p>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={onFileChange} />

              <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/15 border border-blue-100 dark:border-blue-800 p-3">
                <p className="text-[11.5px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  <strong>How it works:</strong> Claude reads the text from your file and fills in the form. You can review and edit everything before saving.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
