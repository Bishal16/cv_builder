import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';

interface GraduateTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const ACCENT = '#0f766e'; // deep teal

const styles = {
  container: {
    width: '794px',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontFamily: '"Inter", Helvetica, Arial, sans-serif',
    fontSize: '12px',
    lineHeight: '1.55',
    padding: '48px 56px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  name: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.015em',
    marginBottom: '4px',
  } as React.CSSProperties,
  contact: {
    fontSize: '11px',
    color: '#4b5563',
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '6px 14px',
    marginBottom: '26px',
    paddingBottom: '18px',
    borderBottom: `2px solid ${ACCENT}`,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: ACCENT,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.09em',
    marginBottom: '11px',
    marginTop: '24px',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '8px',
  } as React.CSSProperties,
  titleBar: {
    display: 'inline-block',
    width: '18px',
    height: '3px',
    backgroundColor: ACCENT,
    borderRadius: '2px',
    flexShrink: 0,
  } as React.CSSProperties,
  itemTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
  } as React.CSSProperties,
  itemSub: {
    fontSize: '11.5px',
    color: '#4b5563',
    marginTop: '1px',
  } as React.CSSProperties,
  date: {
    fontSize: '10.5px',
    color: '#6b7280',
    flexShrink: 0,
  } as React.CSSProperties,
  richText: {
    fontSize: '11.5px',
    lineHeight: '1.6',
    color: '#374151',
    marginTop: '5px',
  } as React.CSSProperties,
  skillPill: {
    display: 'inline-block',
    fontSize: '10.5px',
    fontWeight: '500',
    color: '#134e4a',
    backgroundColor: '#f0fdfa',
    border: '1px solid #99f6e4',
    borderRadius: '999px',
    padding: '3px 11px',
    marginRight: '6px',
    marginBottom: '6px',
  } as React.CSSProperties,
};

const toExternalUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function GraduateTemplate({ cv, containerClass = '', containerStyle = {} }: GraduateTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  const contactItems: Array<{ label: string; href?: string }> = [
    personalInfo.email ? { label: personalInfo.email } : null,
    personalInfo.phone ? { label: personalInfo.phone } : null,
    personalInfo.location ? { label: personalInfo.location } : null,
    personalInfo.linkedinUrl ? { label: toDisplayUrl(personalInfo.linkedinUrl), href: toExternalUrl(personalInfo.linkedinUrl) } : null,
    personalInfo.githubUrl ? { label: toDisplayUrl(personalInfo.githubUrl), href: toExternalUrl(personalInfo.githubUrl) } : null,
  ].filter((x): x is { label: string; href?: string } => x !== null);

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 style={styles.sectionTitle}>
      <span style={styles.titleBar} />
      {children}
    </h2>
  );

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'personal':
        return personalInfo.summary ? (
          <section key="personal">
            <SectionTitle>About Me</SectionTitle>
            <div
              className="cv-rich-text"
              style={{ ...styles.richText, marginTop: 0, fontSize: '12px' }}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
            />
          </section>
        ) : null;

      case 'education':
        return educations.length > 0 ? (
          <section key="education">
            <SectionTitle>Education</SectionTitle>
            {educations.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '14px' }}>
                  <span style={styles.itemTitle}>{edu.institution}</span>
                  <span style={styles.date}>{edu.graduationYear}</span>
                </div>
                <div style={styles.itemSub}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
              </div>
            ))}
          </section>
        ) : null;

      case 'experience':
        return experiences.length > 0 ? (
          <section key="experience">
            <SectionTitle>Experience</SectionTitle>
            {experiences.map((exp) => (
              <div key={exp.id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '14px' }}>
                  <span style={styles.itemTitle}>{exp.role}</span>
                  <span style={styles.date}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div style={styles.itemSub}>{exp.company}</div>
                <div
                  className="cv-rich-text"
                  style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }}
                />
              </div>
            ))}
          </section>
        ) : null;

      case 'projects':
        return projects.length > 0 ? (
          <section key="projects">
            <SectionTitle>Projects</SectionTitle>
            {projects.map((p) => (
              <div key={p.id} style={{ marginBottom: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '14px' }}>
                  <span style={styles.itemTitle}>{p.name}</span>
                  {p.url && (
                    <a
                      href={toExternalUrl(p.url)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...styles.date, color: ACCENT, textDecoration: 'none', wordBreak: 'break-all' as const, maxWidth: '200px', textAlign: 'right' as const }}
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

      case 'skills':
        return skills.length > 0 ? (
          <section key="skills">
            <SectionTitle>Skills</SectionTitle>
            <div>
              {skills.map((s) => (
                <span key={s.id} style={styles.skillPill}>
                  {s.name}
                </span>
              ))}
            </div>
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
        <div style={styles.contact}>
          {contactItems.map((item) =>
            item.href ? (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                style={{ color: ACCENT, textDecoration: 'none', wordBreak: 'break-all' as const }}>
                {item.label}
              </a>
            ) : (
              <span key={item.label}>{item.label}</span>
            )
          )}
        </div>
      </header>

      {orderedSections.map(renderSection)}
    </div>
  );
}
