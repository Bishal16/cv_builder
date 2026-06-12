import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';

interface ExecutiveTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const ACCENT = '#8a6d3b'; // muted bronze

const styles = {
  container: {
    width: '794px',
    backgroundColor: '#ffffff',
    color: '#222222',
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '12px',
    lineHeight: '1.6',
    padding: '56px 64px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  name: {
    fontSize: '30px',
    fontWeight: '400',
    color: '#1a1a1a',
    textAlign: 'center' as const,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    marginBottom: '10px',
  } as React.CSSProperties,
  accentRule: {
    width: '56px',
    height: '2px',
    backgroundColor: ACCENT,
    margin: '0 auto 14px auto',
  } as React.CSSProperties,
  contact: {
    fontSize: '10.5px',
    color: '#555555',
    textAlign: 'center' as const,
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: '0.04em',
    marginBottom: '36px',
  } as React.CSSProperties,
  contactSep: {
    color: '#bbbbbb',
    margin: '0 9px',
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '10.5px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.18em',
    color: '#1a1a1a',
    borderBottom: `1px solid ${ACCENT}`,
    paddingBottom: '6px',
    marginBottom: '14px',
    marginTop: '26px',
  } as React.CSSProperties,
  role: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#1a1a1a',
  } as React.CSSProperties,
  company: {
    fontSize: '12px',
    fontStyle: 'italic' as const,
    color: '#555555',
  } as React.CSSProperties,
  date: {
    fontSize: '10.5px',
    color: '#777777',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    flexShrink: 0,
    letterSpacing: '0.03em',
  } as React.CSSProperties,
  richText: {
    fontSize: '12px',
    lineHeight: '1.6',
    color: '#333333',
    marginTop: '5px',
  } as React.CSSProperties,
  itemSpacing: {
    marginBottom: '18px',
  } as React.CSSProperties,
};

const toExternalUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function ExecutiveTemplate({ cv, containerClass = '', containerStyle = {} }: ExecutiveTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  const contactParts: string[] = [
    personalInfo.phone,
    personalInfo.email,
    personalInfo.location,
    personalInfo.linkedinUrl ? toDisplayUrl(personalInfo.linkedinUrl) : '',
  ].filter(Boolean) as string[];

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'personal':
        return personalInfo.summary ? (
          <section key="personal">
            <h2 style={styles.sectionTitle}>Executive Summary</h2>
            <div
              className="cv-rich-text"
              style={{ ...styles.richText, marginTop: 0 }}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
            />
          </section>
        ) : null;

      case 'experience':
        return experiences.length > 0 ? (
          <section key="experience">
            <h2 style={styles.sectionTitle}>Professional Experience</h2>
            {experiences.map((exp) => (
              <div key={exp.id} style={styles.itemSpacing}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
                  <span style={styles.role}>{exp.role}</span>
                  <span style={styles.date}>{exp.startDate} — {exp.endDate || 'Present'}</span>
                </div>
                <div style={styles.company}>{exp.company}</div>
                <div
                  className="cv-rich-text"
                  style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }}
                />
              </div>
            ))}
          </section>
        ) : null;

      case 'education':
        return educations.length > 0 ? (
          <section key="education">
            <h2 style={styles.sectionTitle}>Education</h2>
            {educations.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
                  <span style={{ ...styles.role, fontSize: '12.5px' }}>{edu.institution}</span>
                  <span style={styles.date}>{edu.graduationYear}</span>
                </div>
                <div style={styles.company}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
              </div>
            ))}
          </section>
        ) : null;

      case 'skills':
        return skills.length > 0 ? (
          <section key="skills">
            <h2 style={styles.sectionTitle}>Core Competencies</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, columnGap: '0px', rowGap: '6px' }}>
              {skills.map((s, i) => (
                <span key={s.id} style={{ fontSize: '11.5px', color: '#333333' }}>
                  {s.name}
                  {i < skills.length - 1 && <span style={{ color: ACCENT, margin: '0 10px' }}>•</span>}
                </span>
              ))}
            </div>
          </section>
        ) : null;

      case 'projects':
        return projects.length > 0 ? (
          <section key="projects">
            <h2 style={styles.sectionTitle}>Notable Engagements</h2>
            {projects.map((p) => (
              <div key={p.id} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
                  <span style={{ ...styles.role, fontSize: '12.5px' }}>{p.name}</span>
                  {p.url && (
                    <a
                      href={toExternalUrl(p.url)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...styles.date, color: ACCENT, textDecoration: 'none' }}
                    >
                      {toDisplayUrl(p.url)}
                    </a>
                  )}
                </div>
                <div
                  className="cv-rich-text"
                  style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(p.description) }}
                />
              </div>
            ))}
          </section>
        ) : null;

      default:
        return null;
    }
  };

  const orderedSections = normalizeSectionOrder(cv.sectionOrder);

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      <header>
        <h1 style={styles.name}>{personalInfo.name || 'Your Name'}</h1>
        <div style={styles.accentRule} />
        {contactParts.length > 0 && (
          <div style={styles.contact}>
            {contactParts.map((part, i) => (
              <span key={part}>
                {i > 0 && <span style={styles.contactSep}>·</span>}
                {part}
              </span>
            ))}
          </div>
        )}
      </header>

      {orderedSections.map(renderSection)}
    </div>
  );
}
