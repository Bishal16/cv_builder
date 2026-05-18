export type TemplateId = 'CLASSIC' | 'MODERN' | 'ATS' | 'PRO';
export type SectionId = 'personal' | 'experience' | 'education' | 'skills' | 'projects';

export const DEFAULT_SECTION_ORDER: SectionId[] = ['personal', 'experience', 'education', 'skills', 'projects'];

const SECTION_ID_SET = new Set<SectionId>(DEFAULT_SECTION_ORDER);

export function normalizeSectionOrder(sectionOrder?: readonly string[] | null): SectionId[] {
  const normalized: SectionId[] = [];

  for (const section of sectionOrder ?? []) {
    if (!SECTION_ID_SET.has(section as SectionId)) {
      continue;
    }

    const sectionId = section as SectionId;
    if (!normalized.includes(sectionId)) {
      normalized.push(sectionId);
    }
  }

  for (const sectionId of DEFAULT_SECTION_ORDER) {
    if (!normalized.includes(sectionId)) {
      normalized.push(sectionId);
    }
  }

  return normalized;
}

export type SkillLevel = '' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  level: SkillLevel;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface Cv {
  id: string;
  title: string;
  templateId: TemplateId;
  sectionOrder: SectionId[];
  personalInfo: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCvRequest {
  title: string;
  templateId: TemplateId;
  sectionOrder: SectionId[];
  personalInfo: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
}

export interface UpdateCvRequest {
  title?: string;
  templateId?: TemplateId;
  sectionOrder?: SectionId[];
  personalInfo?: PersonalInfo;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  projects?: Project[];
}

export type CreateCvData = CreateCvRequest;
export type UpdateCvData = UpdateCvRequest;

export interface CVFormData {
  title: string;
  templateId: TemplateId;
  sectionOrder: SectionId[];
  personalInfo: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
}