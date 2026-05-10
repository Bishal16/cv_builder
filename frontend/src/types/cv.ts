export type TemplateId = 'CLASSIC' | 'MODERN' | 'ATS';

export type SkillLevel = '' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
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
  personalInfo: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
}

export interface UpdateCvRequest {
  title?: string;
  templateId?: TemplateId;
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
  personalInfo: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
}