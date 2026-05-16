import { normalizeSectionOrder, type Cv, type SectionId } from '../types/cv';

export type ContentSectionId = Exclude<SectionId, 'personal'>;

export function getOrderedContentSections(cv: Cv): ContentSectionId[] {
  return normalizeSectionOrder(cv.sectionOrder).filter(
    (section): section is ContentSectionId => section !== 'personal',
  );
}
