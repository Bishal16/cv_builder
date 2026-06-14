import type { Cv, TemplateId } from '../types/cv';
import { DEFAULT_SECTION_ORDER } from '../types/cv';

// Neutral sample avatar (inline SVG data-URL) so photo templates preview with an image.
const SAMPLE_PHOTO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></linearGradient></defs>' +
    '<rect width="160" height="160" fill="url(#g)"/>' +
    '<circle cx="80" cy="62" r="30" fill="#f8fafc"/>' +
    '<path d="M26 150c0-30 24-46 54-46s54 16 54 46z" fill="#f8fafc"/></svg>',
  );

/**
 * Realistic placeholder CV used for template previews
 * (Templates gallery, preview modals). Never persisted.
 */
export function makeSampleCv(templateId: TemplateId): Cv {
  return {
    id: `sample-${templateId}`,
    title: 'Sample Resume',
    templateId,
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    personalInfo: {
      name: 'Jordan Avery',
      email: 'jordan.avery@email.com',
      phone: '+1 (415) 555-0142',
      location: 'San Francisco, CA',
      linkedinUrl: 'linkedin.com/in/jordanavery',
      githubUrl: 'github.com/javery',
      summary:
        '<p>Product-minded software engineer with 7+ years building high-scale distributed systems and consumer-facing applications. Led teams of 4–8 engineers; shipped features used by millions.</p>',
      photoUrl: SAMPLE_PHOTO,
    },
    experiences: [
      {
        id: 'sample-exp-1',
        company: 'Stripe',
        role: 'Senior Software Engineer',
        startDate: 'Mar 2021',
        endDate: '',
        description:
          '<ul><li>Led migration of payment-routing layer to event-driven architecture, cutting p99 latency 38%</li><li>Designed idempotency framework adopted by 12 internal teams</li></ul>',
      },
      {
        id: 'sample-exp-2',
        company: 'Airbnb',
        role: 'Software Engineer',
        startDate: 'Jun 2018',
        endDate: 'Feb 2021',
        description:
          '<ul><li>Built search-ranking experimentation pipeline processing 40M events/day</li><li>Reduced infra cost $400K/yr through query optimization</li></ul>',
      },
    ],
    educations: [
      {
        id: 'sample-edu-1',
        institution: 'University of California, Berkeley',
        degree: 'B.S.',
        field: 'Computer Science',
        graduationYear: '2018',
      },
    ],
    skills: [
      { id: 'sample-skill-1', name: 'TypeScript', category: 'Languages', level: 'Expert' },
      { id: 'sample-skill-2', name: 'Go', category: 'Languages', level: 'Advanced' },
      { id: 'sample-skill-3', name: 'PostgreSQL', category: 'Infrastructure', level: '' },
      { id: 'sample-skill-4', name: 'Kubernetes', category: 'Infrastructure', level: '' },
      { id: 'sample-skill-5', name: 'React', category: 'Frontend', level: 'Expert' },
    ],
    projects: [
      {
        id: 'sample-proj-1',
        name: 'OpenMetrics Dashboard',
        description:
          '<p>Open-source observability dashboard with 2.3K GitHub stars. Real-time streaming charts over WebSocket.</p>',
        url: 'github.com/javery/openmetrics',
      },
    ],
    certifications: [
      { id: 'sample-cert-1', name: 'AWS Solutions Architect – Associate', issuer: 'Amazon Web Services', issueDate: '2023-06', expiryDate: '2026-06' },
    ],
    languages: [
      { id: 'sample-lang-1', name: 'English', proficiency: 'Native' as const },
      { id: 'sample-lang-2', name: 'Spanish', proficiency: 'Conversational' as const },
    ],
    awards: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
