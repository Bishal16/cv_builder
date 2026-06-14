import { useEffect } from 'react';
import { useCvStore } from '../store/cvStore';
import { useThemeStore } from '../store/themeStore';
import { CvPreview, PAGE_WIDTH } from '../templates/CvPreview';

interface CvPrintViewProps {
  cvId: string;
}

export function CvPrintView({ cvId }: CvPrintViewProps) {
  const { currentCv, selectCv, loading, error } = useCvStore();
  const { setMode } = useThemeStore();

  // Derived, not stored: the print view is "ready" once the requested CV is
  // the one loaded. Playwright waits for data-print-ready='true'.
  const ready = currentCv?.id === cvId;

  useEffect(() => {
    setMode('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.style.margin = '0';
    document.body.style.backgroundColor = '#ffffff';
  }, [setMode]);

  useEffect(() => {
    void selectCv(cvId).catch(() => { /* error surfaced via store `error` */ });
  }, [cvId, selectCv]);

  if (loading && !currentCv) {
    return <div style={{ padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading...</div>;
  }

  if (!currentCv) {
    return (
      <div style={{ padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {error ?? 'CV not found.'}
      </div>
    );
  }

  return (
    <div
      data-print-ready={ready ? 'true' : 'false'}
      style={{ backgroundColor: '#ffffff' }}
    >
      <CvPreview
        cv={currentCv}
        containerClass="shadow-none"
        containerStyle={{ width: `${PAGE_WIDTH}px` }}
      />
    </div>
  );
}
