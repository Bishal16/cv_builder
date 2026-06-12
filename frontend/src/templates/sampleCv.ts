import type { Cv, TemplateId } from '../types/cv';
import { DEFAULT_SECTION_ORDER } from '../types/cv';

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
