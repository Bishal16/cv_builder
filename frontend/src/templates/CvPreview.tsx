import type { Cv } from '../types/cv';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { AtsTemplate } from './AtsTemplate';

interface CvPreviewProps {
  cv: Cv;
}

export function CvPreview({ cv }: CvPreviewProps) {
  switch (cv.templateId) {
    case 'MODERN':
      return <ModernTemplate cv={cv} />;
    case 'ATS':
      return <AtsTemplate cv={cv} />;
    case 'CLASSIC':
    default:
      return <ClassicTemplate cv={cv} />;
  }
}