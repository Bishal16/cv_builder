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
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (415) 555-0142',
      location: 'San Francisco, CA',
      linkedinUrl: 'linkedin.com/in/johndoe',
      githubUrl: 'github.com/johndoe',
      summary:
        '<p>Product-minded software engineer with 9+ years building high-scale distributed systems and consumer-facing applications. Led cross-functional teams of 4–10 engineers across two time zones; shipped features used by 50M+ users. Passionate about reliability engineering, developer tooling, and mentoring junior engineers.</p>',
      photoUrl: SAMPLE_PHOTO,
    },
    experiences: [
      {
        id: 'sample-exp-1',
        company: 'Stripe',
        role: 'Staff Software Engineer',
        startDate: 'Jan 2022',
        endDate: '',
        description:
          '<ul><li>Led migration of payment-routing layer to event-driven architecture, cutting p99 latency by 38% and eliminating 3 classes of race conditions</li><li>Designed idempotency framework adopted by 14 internal teams, reducing duplicate-charge incidents to zero</li><li>Drove engineering-wide initiative to standardise service observability; reduced MTTR from 42 min to 11 min</li><li>Mentored 5 engineers to promotion; conducted 30+ hiring interviews</li></ul>',
      },
      {
        id: 'sample-exp-2',
        company: 'Airbnb',
        role: 'Senior Software Engineer',
        startDate: 'Aug 2018',
        endDate: 'Dec 2021',
        description:
          '<ul><li>Built search-ranking experimentation pipeline processing 40M events/day with sub-second SLA</li><li>Reduced infrastructure cost by $400K/yr through query optimisation and cache redesign</li><li>Re-architected host-calendar sync service, cutting booking conflicts by 62%</li><li>Owned on-call rotation for core search; drove reliability from 99.7% → 99.97% uptime</li></ul>',
      },
      {
        id: 'sample-exp-3',
        company: 'Palantir Technologies',
        role: 'Software Engineer',
        startDate: 'Jul 2015',
        endDate: 'Jul 2018',
        description:
          '<ul><li>Delivered data-integration pipelines for three Fortune 500 clients in finance and healthcare verticals</li><li>Built internal ETL orchestration framework now used across 8 product lines</li><li>Improved pipeline throughput 4× by introducing columnar storage and vectorised processing</li></ul>',
      },
    ],
    educations: [
      {
        id: 'sample-edu-1',
        institution: 'University of California, Berkeley',
        degree: 'B.S.',
        field: 'Computer Science',
        graduationYear: '2015',
      },
      {
        id: 'sample-edu-2',
        institution: 'Stanford University',
        degree: 'M.S.',
        field: 'Distributed Systems (part-time)',
        graduationYear: '2019',
      },
    ],
    skills: [
      { id: 'sample-skill-1', name: 'TypeScript', category: 'Languages', level: 'Expert' },
      { id: 'sample-skill-2', name: 'Go', category: 'Languages', level: 'Expert' },
      { id: 'sample-skill-3', name: 'Python', category: 'Languages', level: 'Advanced' },
      { id: 'sample-skill-4', name: 'Java', category: 'Languages', level: 'Intermediate' },
      { id: 'sample-skill-5', name: 'PostgreSQL', category: 'Infrastructure', level: 'Expert' },
      { id: 'sample-skill-6', name: 'Kubernetes', category: 'Infrastructure', level: 'Advanced' },
      { id: 'sample-skill-7', name: 'Kafka', category: 'Infrastructure', level: 'Advanced' },
      { id: 'sample-skill-8', name: 'Terraform', category: 'Infrastructure', level: 'Intermediate' },
      { id: 'sample-skill-9', name: 'React', category: 'Frontend', level: 'Expert' },
      { id: 'sample-skill-10', name: 'GraphQL', category: 'Frontend', level: 'Advanced' },
    ],
    projects: [
      {
        id: 'sample-proj-1',
        name: 'OpenMetrics Dashboard',
        description:
          '<p>Open-source observability dashboard with 4.1K GitHub stars. Real-time streaming charts over WebSocket, pluggable datasource adapters for Prometheus, Datadog, and CloudWatch.</p>',
        url: 'github.com/johndoe/openmetrics',
      },
      {
        id: 'sample-proj-2',
        name: 'FlowQueue',
        description:
          '<p>Lightweight distributed task queue in Go with at-least-once delivery guarantees, dead-letter queues, and a web UI. Used in production by 3 startups.</p>',
        url: 'github.com/johndoe/flowqueue',
      },
    ],
    certifications: [
      { id: 'sample-cert-1', name: 'AWS Solutions Architect – Professional', issuer: 'Amazon Web Services', issueDate: '2023-04', expiryDate: '2026-04' },
      { id: 'sample-cert-2', name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Cloud Native Computing Foundation', issueDate: '2022-09', expiryDate: '2025-09' },
    ],
    languages: [
      { id: 'sample-lang-1', name: 'English', proficiency: 'Native' as const },
      { id: 'sample-lang-2', name: 'Spanish', proficiency: 'Conversational' as const },
      { id: 'sample-lang-3', name: 'Mandarin', proficiency: 'Basic' as const },
    ],
    awards: [
      { id: 'sample-award-1', title: 'Engineering Excellence Award', issuer: 'Stripe', date: '2023-11', description: 'Recognised for the payment-routing reliability initiative.' },
      { id: 'sample-award-2', title: 'Best Paper – Systems Track', issuer: 'Bay Area Systems Conference', date: '2020-08', description: 'Co-authored paper on low-latency event-sourcing patterns.' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
