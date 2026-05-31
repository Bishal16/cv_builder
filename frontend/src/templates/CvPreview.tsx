import { useEffect, useRef, useState } from 'react';
import type { Cv } from '../types/cv';
import { ClassicTemplate, ModernTemplate, AtsTemplate, ProTemplate, MinimalTemplate } from './index';

export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

interface CvPreviewProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

export function CvPreview({ cv, containerClass = '', containerStyle = {} }: CvPreviewProps) {
  switch (cv.templateId) {
    case 'MODERN':
      return <ModernTemplate cv={cv} containerClass={containerClass} containerStyle={containerStyle} />;
    case 'ATS':
      return <AtsTemplate cv={cv} containerClass={containerClass} containerStyle={containerStyle} />;
    case 'PRO':
      return <ProTemplate cv={cv} />;
    case 'MINIMAL':
      return <MinimalTemplate cv={cv} containerClass={containerClass} containerStyle={containerStyle} />;
    case 'CLASSIC':
    default:
      return <ClassicTemplate cv={cv} containerClass={containerClass} containerStyle={containerStyle} />;
  }
}

interface MultiPagePreviewProps {
  cv: Cv;
  onPageCountChange?: (count: number) => void;
}

export function MultiPagePreview({ cv, onPageCountChange }: MultiPagePreviewProps) {
  const [page, setPage] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(PAGE_HEIGHT);

  useEffect(() => {
    const measure = () => {
      if (measureRef.current) {
        setTotalHeight(measureRef.current.scrollHeight);
      }
    };

    const observer = new ResizeObserver(measure);
    if (measureRef.current) {
      observer.observe(measureRef.current);
    }

    requestAnimationFrame(measure);
    return () => observer.disconnect();
  }, [cv]);

  const pageCount = Math.max(1, Math.ceil(totalHeight / PAGE_HEIGHT));
  const offsetY = page * PAGE_HEIGHT;

  // Notify parent of page count changes
  useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [pageCount, onPageCountChange]);

  // Page break lines visible within the current page viewport
  const pageBreakLines = Array.from({ length: pageCount - 1 }, (_, i) => {
    const absoluteBreakY = (i + 1) * PAGE_HEIGHT;
    return absoluteBreakY - offsetY;
  }).filter(y => y > 0 && y < PAGE_HEIGHT);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, overflow: 'hidden' }}
      >
        <div
          className="absolute left-0 right-0"
          style={{ top: `${-offsetY}px` }}
        >
          <div ref={measureRef}>
            <CvPreview
              cv={cv}
              containerStyle={{ width: `${PAGE_WIDTH}px` }}
            />
          </div>
        </div>

        {/* Page break indicator lines */}
        {pageBreakLines.map((y) => (
          <div
            key={y}
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{ top: `${y}px` }}
          >
            <div
              style={{
                width: '100%',
                height: '1px',
                backgroundImage: 'repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 6px, transparent 6px, transparent 12px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '8px',
                top: '-10px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: '600',
                padding: '1px 6px',
                borderRadius: '3px',
                letterSpacing: '0.04em',
                pointerEvents: 'none',
              }}
            >
              PAGE BREAK
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs font-mono text-text-dim">
            {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {pageCount > 1 && (
        <p className="text-xs font-mono text-amber-500">
          Content spans {pageCount} pages
        </p>
      )}
    </div>
  );
}
