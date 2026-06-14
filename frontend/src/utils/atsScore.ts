import type { CVFormData, TemplateId } from '../types/cv';

export interface AtsCheck {
  id: string;
  label: string;
  pass: boolean;
  hint: string;       // shown when failing
  weight: number;     // contribution to total score (all weights sum to 100)
}

export interface AtsResult {
  score: number;       // 0–100
  checks: AtsCheck[];
  passed: number;
  total: number;
}

// Templates that are single-column and safe for ATS parsers.
const ATS_SAFE_TEMPLATES: TemplateId[] = ['ATS', 'MINIMAL', 'COMPACT', 'GRADUATE'];

// Common action verbs for bullet-point quality check.
const ACTION_VERBS = new Set([
  'led','built','designed','developed','implemented','launched','created','improved',
  'reduced','increased','managed','delivered','architected','optimized','automated',
  'deployed','migrated','integrated','mentored','owned','drove','shipped','scaled',
  'authored','established','streamlined','collaborated','coordinated','negotiated',
  'achieved','exceeded','generated','saved','transformed','modernized','spearheaded',
]);

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function countBullets(html: string): number {
  return (html.match(/<li/gi) ?? []).length;
}

function hasActionVerb(text: string): boolean {
  const firstWord = text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  return ACTION_VERBS.has(firstWord ?? '');
}

export function computeAtsScore(data: CVFormData): AtsResult {
  const { personalInfo: pi, experiences, educations, skills, certifications, languages, templateId } = data;
  const summaryText = stripHtml(pi.summary ?? '');
  const summaryWords = countWords(summaryText);

  // Full-CV plain-text word count
  const allText = [
    pi.name, pi.email, pi.phone, pi.location, summaryText,
    ...experiences.map(e => `${e.role} ${e.company} ${stripHtml(e.description)}`),
    ...educations.map(e => `${e.institution} ${e.degree} ${e.field}`),
    ...skills.map(s => s.name),
    ...certifications.map(c => `${c.name} ${c.issuer}`),
    ...languages.map(l => l.name),
  ].join(' ');
  const totalWords = countWords(allText);

  // Experience bullet quality
  const expBulletCounts = experiences.map(e => countBullets(e.description));
  const totalBullets = expBulletCounts.reduce((a, b) => a + b, 0);
  const actionVerbRatio = experiences.length > 0
    ? experiences.reduce((acc, exp) => {
        const bullets = exp.description.split(/<li[^>]*>/i).slice(1);
        const withVerb = bullets.filter(b => hasActionVerb(stripHtml(b))).length;
        return acc + (bullets.length > 0 ? withVerb / bullets.length : 0);
      }, 0) / experiences.length
    : 0;

  const checks: AtsCheck[] = [
    {
      id: 'name',
      label: 'Full name present',
      pass: (pi.name ?? '').trim().length >= 2,
      hint: 'Add your full name in Personal Info.',
      weight: 8,
    },
    {
      id: 'email',
      label: 'Email address',
      pass: /\S+@\S+\.\S+/.test(pi.email ?? ''),
      hint: 'Add a valid email address.',
      weight: 8,
    },
    {
      id: 'phone',
      label: 'Phone number',
      pass: (pi.phone ?? '').replace(/\D/g, '').length >= 7,
      hint: 'Add a phone number — most ATS systems require it.',
      weight: 5,
    },
    {
      id: 'location',
      label: 'Location / city',
      pass: (pi.location ?? '').trim().length >= 2,
      hint: 'Add at least a city — helps with location-based filtering.',
      weight: 4,
    },
    {
      id: 'summary',
      label: 'Summary 50–600 words',
      pass: summaryWords >= 50 && summaryWords <= 600,
      hint: summaryWords < 50
        ? `Summary too short (${summaryWords} words). Aim for 50–600.`
        : `Summary too long (${summaryWords} words). Trim to under 600.`,
      weight: 10,
    },
    {
      id: 'experience',
      label: 'At least one work experience',
      pass: experiences.length > 0,
      hint: 'Add at least one work experience entry.',
      weight: 12,
    },
    {
      id: 'bullets',
      label: 'Experience has bullet points',
      pass: experiences.length > 0 && totalBullets >= experiences.length,
      hint: 'Use bullet points (not paragraphs) in every experience — ATS parsers expect them.',
      weight: 10,
    },
    {
      id: 'action_verbs',
      label: 'Bullets start with action verbs',
      pass: actionVerbRatio >= 0.5,
      hint: 'Start bullets with action verbs (Led, Built, Reduced…) — at least half your bullets.',
      weight: 8,
    },
    {
      id: 'education',
      label: 'Education section',
      pass: educations.length > 0,
      hint: 'Add your education — most ATS systems flag missing education.',
      weight: 8,
    },
    {
      id: 'skills',
      label: '3+ skills listed',
      pass: skills.length >= 3,
      hint: `Add more skills (${skills.length} now). ATS keyword-matches against the job description.`,
      weight: 10,
    },
    {
      id: 'word_count',
      label: 'Resume length 300–800 words',
      pass: totalWords >= 300 && totalWords <= 800,
      hint: totalWords < 300
        ? `Too brief (${totalWords} words). Expand your experience bullets.`
        : `Too long (${totalWords} words). ATS systems may truncate beyond 800 words.`,
      weight: 8,
    },
    {
      id: 'ats_template',
      label: 'ATS-safe single-column layout',
      pass: ATS_SAFE_TEMPLATES.includes(templateId),
      hint: `"${templateId}" is a multi-column layout — ATS parsers can misread the order. Switch to ATS, Minimal, Compact, or Graduate for maximum parse accuracy.`,
      weight: 9,
    },
  ];

  const maxScore  = checks.reduce((s, c) => s + c.weight, 0);
  const earnedScore = checks.filter(c => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earnedScore / maxScore) * 100);
  const passed = checks.filter(c => c.pass).length;

  return { score, checks, passed, total: checks.length };
}
