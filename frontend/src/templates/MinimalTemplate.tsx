import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';

interface MinimalTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const styles = {
  container: {
    width: '794px',
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '12px',
    lineHeight: '1.6',
    padding: '64px 72px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  name: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0a0a0a',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  } as React.CSSProperties,
  tagline: {
    fontSize: '11px',
    color: '#666666',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: '0.02em',
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '0px',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1.5px solid #0a0a0a',
  } as React.CSSProperties,
  contactSep: {
    margin: '0 10px',
    color: '#cccccc',
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.14em',
    color: '#888888',
    marginBottom: '12px',
    marginTop: '28px',
  } as React.CSSProperties,
  expRole: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0a0a0a',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  } as React.CSSProperties,
  expMeta: {
    fontSize: '11px',
    color: '#555555',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    marginBottom: '6px',
    marginTop: '1px',
  } as React.CSSProperties,
  richText: {
    fontSize: '12px',
    lineHeight: '1.65',
    color: '#333333',
  } as React.CSSProperties,
  divider: {
    height: '0.5px',
    backgroundColor: '#e5e5e5',
    margin: '14px 0',
  } as React.CSSProperties,
  skillItem: {
    display: 'inline-block' as const,
    fontSize: '11px',
    color: '#333333',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    marginRight: '16px',
    marginBottom: '4px',
  } as React.CSSProperties,
};

const toExternalUrl = (v: string) => /^https?:\/\//i.test(v) ? v : `https://${v}`;
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function MinimalTemplate({ cv, containerClass = '', containerStyle = {} }: MinimalTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  const contactParts: { label: string; href?: string }[] = [
    personalInfo.email    ? { label: personalInfo.email } : null,
    personalInfo.phone    ? { label: personalInfo.phone } : null,
    personalInfo.location ? { label: personalInfo.location } : null,
    personalInfo.linkedinUrl ? { label: toDisplayUrl(personalInfo.linkedinUrl), href: toExternalUrl(personalInfo.linkedinUrl) } : null,
    personalInfo.githubUrl   ? { label: toDisplayUrl(personalInfo.githubUrl),   href: toExternalUrl(personalInfo.githubUrl) } : null,
  ].filter((x): x is { label: string; href?: string } => x !== null);

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'personal':
        return personalInfo.summary ? (
          <section key="personal">
            <p style={styles.sectionTitle}>Profile</p>
            <div
              className="cv-rich-text"
              style={styles.richText}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
            />
          </section>
        ) : null;

      case 'experience':
        return experiences.length > 0 ? (
          <section key="experience">
            <p style={styles.sectionTitle}>Experience</p>
            {experiences.map((exp, i) => (
              <div key={exp.id}>
                {i > 0 && <div style={styles.divider} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={styles.expRole}>{exp.role}</span>
                  <span style={{ ...styles.expMeta, marginBottom: 0 }}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <p style={styles.expMeta}>{exp.company}</p>
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
            <p style={styles.sectionTitle}>Education</p>
            {educations.map((edu, i) => (
              <div key={edu.id}>
                {i > 0 && <div style={styles.divider} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={styles.expRole}>{edu.institution}</span>
                  <span style={{ ...styles.expMeta, marginBottom: 0 }}>{edu.graduationYear}</span>
                </div>
                <p style={styles.expMeta}>{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</p>
              </div>
            ))}
          </section>
        ) : null;

      case 'skills':
        return skills.length > 0 ? (
          <section key="skills">
            <p style={styles.sectionTitle}>Skills</p>
            <div>
              {skills.map((s) => (
                <span key={s.id} style={styles.skillItem}>
                  {s.name}{s.level ? ` · ${s.level}` : ''}
                </span>
              ))}
            </div>
          </section>
        ) : null;

      case 'projects':
        return projects.length > 0 ? (
          <section key="projects">
            <p style={styles.sectionTitle}>Projects</p>
            {projects.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div style={styles.divider} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={styles.expRole}>{p.name}</span>
                  {p.url && (
                    <a
                      href={toExternalUrl(p.url)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...styles.expMeta, marginBottom: 0, color: '#555', textDecoration: 'none', fontSize: '10px' }}
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
        <div style={styles.tagline}>
          {contactParts.map((item, i) => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <span style={styles.contactSep}>·</span>}
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" style={{ color: '#666666', textDecoration: 'none' }}>
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </header>

      {orderedSections.map(renderSection)}
    </div>
  );
}
