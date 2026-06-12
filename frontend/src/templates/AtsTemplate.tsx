import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';

interface AtsTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const styles = {
  container: {
    width: '794px',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    lineHeight: '1.5',
    padding: '45px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  header: {
    textAlign: 'center' as const,
    marginBottom: '23px',
    paddingBottom: '15px',
    borderBottom: '1px solid #000000',
  } as React.CSSProperties,
  name: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    marginBottom: '8px',
    wordBreak: 'break-word' as const,
  } as React.CSSProperties,
  contact: {
    fontSize: '11px',
    color: '#333333',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 'bold' as const,
    borderBottom: '1px solid #000000',
    paddingBottom: '4px',
    marginTop: '18px',
    marginBottom: '8px',
  } as React.CSSProperties,
  expItem: {
    marginBottom: '16px',
  } as React.CSSProperties,
  role: {
    fontWeight: 'bold' as const,
    fontSize: '12px',
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    gap: '16px',
  } as React.CSSProperties,
  date: {
    fontSize: '11px',
    flexShrink: 0,
  } as React.CSSProperties,
  company: {
    fontSize: '11px',
    fontStyle: 'italic' as const,
    marginTop: '2px',
    marginBottom: '6px',
    color: '#333333',
  } as React.CSSProperties,
  richText: {
    fontSize: '12px',
    lineHeight: '1.4',
  } as React.CSSProperties,
  eduRow: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    gap: '16px',
    marginBottom: '8px',
  } as React.CSSProperties,
  eduInstitution: {
    fontWeight: 'bold' as const,
    fontSize: '12px',
  } as React.CSSProperties,
  eduYear: {
    fontSize: '11px',
    flexShrink: 0,
  } as React.CSSProperties,
  eduDegree: {
    fontSize: '11px',
    color: '#333333',
  } as React.CSSProperties,
  skillsText: {
    fontSize: '12px',
    lineHeight: '1.5',
  } as React.CSSProperties,
};

const toExternalUrl = (value: string): string =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;
const toDisplayUrl = (value: string): string =>
  value.replace(/^https?:\/\//i, '');

export function AtsTemplate({ cv, containerClass = '', containerStyle = {} }: AtsTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  const contactItems: Array<{ label: string; href?: string }> = [
    personalInfo.email ? { label: personalInfo.email } : null,
    personalInfo.phone ? { label: personalInfo.phone } : null,
    personalInfo.location ? { label: personalInfo.location } : null,
    personalInfo.linkedinUrl ? { label: toDisplayUrl(personalInfo.linkedinUrl), href: toExternalUrl(personalInfo.linkedinUrl) } : null,
    personalInfo.githubUrl ? { label: toDisplayUrl(personalInfo.githubUrl), href: toExternalUrl(personalInfo.githubUrl) } : null,
  ].filter((item): item is { label: string; href?: string } => item !== null);

  const sectionNodes: Record<SectionId, React.ReactNode> = {
    personal: personalInfo.summary ? (
      <section key="personal">
        <h2 style={styles.sectionTitle}>Professional Summary</h2>
        <div
          className="cv-rich-text"
          style={styles.richText}
          dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
        />
      </section>
    ) : null,
    experience: experiences.length > 0 ? (
      <section key="experience">
        <h2 style={styles.sectionTitle}>Work Experience</h2>
        {experiences.map((exp) => (
          <div key={exp.id} style={styles.expItem}>
            <div style={styles.role}>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{exp.role}</span>
              <span style={styles.date}>{exp.startDate} - {exp.endDate || 'Present'}</span>
            </div>
            <p style={styles.company}>{exp.company}</p>
            <div
              className="cv-rich-text"
              style={styles.richText}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }}
            />
          </div>
        ))}
      </section>
    ) : null,
    education: educations.length > 0 ? (
      <section key="education">
        <h2 style={styles.sectionTitle}>Education</h2>
        {educations.map((edu) => (
          <div key={edu.id} style={{ marginBottom: '8px' }}>
            <div style={styles.eduRow}>
              <span style={styles.eduInstitution}>{edu.institution}</span>
              <span style={styles.eduYear}>{edu.graduationYear}</span>
            </div>
            <p style={styles.eduDegree}>{edu.degree} {edu.field && `in ${edu.field}`}</p>
          </div>
        ))}
      </section>
    ) : null,
    skills: skills.length > 0 ? (
      <section key="skills">
        <h2 style={styles.sectionTitle}>Skills</h2>
        <p style={styles.skillsText}>
          {skills.map((s) => s.name).join(', ')}
        </p>
      </section>
    ) : null,
    projects: projects.length > 0 ? (
      <section key="projects">
        <h2 style={styles.sectionTitle}>Projects</h2>
        {projects.map((project) => (
          <div key={project.id} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{project.name}</span>
              {project.url && (
                <span style={{ fontSize: '10px', color: '#333333', wordBreak: 'break-all' }}>
                  {project.url}
                </span>
              )}
            </div>
            <div
              className="cv-rich-text"
              style={styles.richText}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(project.description) }}
            />
          </div>
        ))}
      </section>
    ) : null,
  };

  const orderedSections = normalizeSectionOrder(cv.sectionOrder).filter((section) => sectionNodes[section] !== null);

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      <header style={styles.header}>
        <h1 style={styles.name}>{personalInfo.name || 'Your Name'}</h1>
        <p style={styles.contact}>
          {contactItems.map((item, i) => (
            <span key={`${item.label}-${i}`}>
              {i > 0 && ' | '}
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" style={{ color: '#1f2937' }}>
                  <span style={{ wordBreak: 'break-all' }}>{item.label}</span>
                </a>
              ) : (
                <span style={{ wordBreak: 'break-all' }}>{item.label}</span>
              )}
            </span>
          ))}
        </p>
      </header>

      {orderedSections.map((section) => sectionNodes[section])}
    </div>
  );
}