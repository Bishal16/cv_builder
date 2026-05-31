import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';

interface ModernTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const styles = {
  container: {
    width: '794px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '12px',
    lineHeight: '1.4',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  header: {
    backgroundColor: '#0f172a',
    padding: '37px 45px',
  } as React.CSSProperties,
  name: {
    fontSize: '30px',
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: '8px',
  } as React.CSSProperties,
  contact: {
    fontSize: '11px',
    color: '#94a3b8',
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '16px',
  } as React.CSSProperties,
  body: {
    padding: '30px 45px 45px 45px',
  } as React.CSSProperties,
  aboutCard: {
    backgroundColor: '#f8fafc',
    padding: '15px',
    borderLeft: '5px solid #3b82f6',
    marginBottom: '24px',
    width: '100%',
  } as React.CSSProperties,
  aboutTitle: {
    fontSize: '11px',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#6b7280',
    marginBottom: '8px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: '#0f172a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    borderBottom: '1.5px solid #0f172a',
    paddingBottom: '4px',
    marginBottom: '12px',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '8px',
  } as React.CSSProperties,
  expCard: {
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    marginBottom: '16px',
  } as React.CSSProperties,
  role: {
    fontWeight: 'bold' as const,
    fontSize: '12px',
    color: '#1e293b',
  } as React.CSSProperties,
  date: {
    fontSize: '10px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '4px',
    flexShrink: 0,
  } as React.CSSProperties,
  company: {
    fontSize: '11px',
    color: '#2563eb',
    marginTop: '4px',
    marginBottom: '8px',
  } as React.CSSProperties,
  richText: {
    fontSize: '12px',
    lineHeight: '1.4',
    color: '#475569',
  } as React.CSSProperties,
  eduCard: {
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    marginBottom: '12px',
  } as React.CSSProperties,
  projectCard: {
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    marginBottom: '12px',
  } as React.CSSProperties,
  skillPill: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '10px',
    marginRight: '6px',
    marginBottom: '6px',
  } as React.CSSProperties,
};

const toExternalUrl = (value: string): string =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;
const toDisplayUrl = (value: string): string =>
  value.replace(/^https?:\/\//i, '');

export function ModernTemplate({ cv, containerClass = '', containerStyle = {} }: ModernTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  const sectionNodes: Record<SectionId, React.ReactNode> = {
    personal: personalInfo.summary ? (
      <section key="personal" style={styles.aboutCard}>
        <h2 style={styles.aboutTitle}>About</h2>
        <div
          className="cv-rich-text"
          style={styles.richText}
          dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
        />
      </section>
    ) : null,
    skills: skills.length > 0 ? (
      <section key="skills" style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Skills</h2>
        <div>
          {skills.map((skill) => (
            <div key={skill.id} style={styles.skillPill}>
              <span style={{ fontWeight: '500' }}>{skill.name}</span>
              {skill.level && (
                <div style={{ fontSize: '9px', color: '#6b7280' }}>{skill.level}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,
    experience: experiences.length > 0 ? (
      <section key="experience" style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Experience</h2>
        {experiences.map((exp) => (
          <div key={exp.id} style={styles.expCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '16px' }}>
              <span style={styles.role}>{exp.role}</span>
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
      <section key="education" style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Education</h2>
        {educations.map((edu) => (
          <div key={edu.id} style={styles.eduCard}>
            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{edu.institution}</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>{edu.degree} {edu.field && `in ${edu.field}`}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>{edu.graduationYear}</div>
          </div>
        ))}
      </section>
    ) : null,
    projects: projects.length > 0 ? (
      <section key="projects" style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Projects</h2>
        {projects.map((project) => (
          <div key={project.id} style={styles.projectCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '4px' }}>
              <span style={{ fontWeight: '500', fontSize: '12px' }}>{project.name}</span>
              {project.url && (
                <span style={{ fontSize: '10px', color: '#6b7280', maxWidth: '180px', wordBreak: 'break-all', textAlign: 'right' }}>
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

  const orderedSections = normalizeSectionOrder(cv.sectionOrder).filter((id) => sectionNodes[id] !== null);

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      <header style={styles.header}>
        <h1 style={styles.name}>{personalInfo.name || 'Your Name'}</h1>
        <div style={styles.contact}>
          {personalInfo.email && <span style={{ wordBreak: 'break-all' }}>{personalInfo.email}</span>}
          {personalInfo.phone && <span style={{ wordBreak: 'break-all' }}>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedinUrl && (
            <a
              href={toExternalUrl(personalInfo.linkedinUrl)}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#94a3b8', textDecoration: 'none', wordBreak: 'break-all' }}
            >
              {toDisplayUrl(personalInfo.linkedinUrl)}
            </a>
          )}
          {personalInfo.githubUrl && (
            <a
              href={toExternalUrl(personalInfo.githubUrl)}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#94a3b8', textDecoration: 'none', wordBreak: 'break-all' }}
            >
              {toDisplayUrl(personalInfo.githubUrl)}
            </a>
          )}
        </div>
      </header>

      <div style={styles.body}>
        {orderedSections.map((id) => (
          <div key={id}>
            {sectionNodes[id]}
          </div>
        ))}
      </div>
    </div>
  );
}
