import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';
import { resolveCustomization } from './customization';

interface CompactTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const toExternalUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function CompactTemplate({ cv, containerClass = '', containerStyle = {} }: CompactTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects, certifications, languages, awards } = cv;
  const c = resolveCustomization(cv);

  const styles = {
    container: {
      width: '794px',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontFamily: c.fontStack,
      fontSize: '11px',
      lineHeight: String(c.lineHeight),
      padding: `${Math.round(34 * c.padScale)}px ${Math.round(40 * c.padScale)}px`,
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    name: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#111827',
      letterSpacing: '-0.02em',
    } as React.CSSProperties,
    contact: {
      fontSize: '10px',
      color: '#4b5563',
      marginTop: '3px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '3px 10px',
    } as React.CSSProperties,
    headerRule: {
      height: '2px',
      backgroundColor: c.accent,
      margin: `${Math.round(10 * c.gapScale)}px 0 ${Math.round(12 * c.gapScale)}px`,
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: '10.5px',
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      color: c.accent,
      marginTop: `${Math.round(13 * c.gapScale)}px`,
      marginBottom: '5px',
    } as React.CSSProperties,
    role: { fontSize: '11.5px', fontWeight: '600', color: '#111827' } as React.CSSProperties,
    company: { fontSize: '10.5px', color: '#4b5563' } as React.CSSProperties,
    date: { fontSize: '9.5px', color: '#6b7280', flexShrink: 0 } as React.CSSProperties,
    richText: { fontSize: '10.5px', lineHeight: String(c.lineHeight), color: '#374151', marginTop: '2px' } as React.CSSProperties,
  };

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'personal':
        return personalInfo.summary ? (
          <section key="personal">
            <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>Summary</h2>
            <div className="cv-rich-text" style={{ ...styles.richText, marginTop: 0 }}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }} />
          </section>
        ) : null;
      case 'experience':
        return experiences.length > 0 ? (
          <section key="experience">
            <h2 style={styles.sectionTitle}>Experience</h2>
            {experiences.map((exp) => (
              <div key={exp.id} style={{ marginBottom: `${Math.round(9 * c.gapScale)}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                  <span style={styles.role}>{exp.role} <span style={{ fontWeight: 400, color: '#6b7280' }}>· {exp.company}</span></span>
                  <span style={styles.date}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div className="cv-rich-text" style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }} />
              </div>
            ))}
          </section>
        ) : null;
      case 'education':
        return educations.length > 0 ? (
          <section key="education">
            <h2 style={styles.sectionTitle}>Education</h2>
            {educations.map((edu) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px' }}>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{edu.institution}</span>
                  <span style={styles.company}> — {edu.degree}{edu.field ? `, ${edu.field}` : ''}</span>
                </span>
                <span style={styles.date}>{edu.graduationYear}</span>
              </div>
            ))}
          </section>
        ) : null;
      case 'skills':
        return skills.length > 0 ? (
          <section key="skills">
            <h2 style={styles.sectionTitle}>Skills</h2>
            <p style={{ fontSize: '10.5px', color: '#374151', lineHeight: String(c.lineHeight) }}>
              {skills.map((s) => s.name).join(' · ')}
            </p>
          </section>
        ) : null;
      case 'projects':
        return projects.length > 0 ? (
          <section key="projects">
            <h2 style={styles.sectionTitle}>Projects</h2>
            {projects.map((p) => (
              <div key={p.id} style={{ marginBottom: `${Math.round(7 * c.gapScale)}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                  <span style={styles.role}>{p.name}</span>
                  {p.url && (
                    <a href={toExternalUrl(p.url)} target="_blank" rel="noreferrer"
                      style={{ ...styles.date, color: c.accent, textDecoration: 'none', wordBreak: 'break-all', maxWidth: '200px', textAlign: 'right' }}>
                      {toDisplayUrl(p.url)}
                    </a>
                  )}
                </div>
                <div className="cv-rich-text" style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(p.description) }} />
              </div>
            ))}
          </section>
        ) : null;
      case 'certifications':
        return certifications.length > 0 ? (
          <section key="certifications">
            <h2 style={styles.sectionTitle}>Certifications</h2>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '3px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#111827' }}>{cert.name}{cert.issuer ? <span style={styles.company}> — {cert.issuer}</span> : ''}</span>
                <span style={styles.date}>{cert.issueDate}</span>
              </div>
            ))}
          </section>
        ) : null;
      case 'languages':
        return languages.length > 0 ? (
          <section key="languages">
            <h2 style={styles.sectionTitle}>Languages</h2>
            <p style={{ fontSize: '10.5px', color: '#374151', lineHeight: String(c.lineHeight) }}>
              {languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' · ')}
            </p>
          </section>
        ) : null;
      case 'awards':
        return awards.length > 0 ? (
          <section key="awards">
            <h2 style={styles.sectionTitle}>Awards</h2>
            {awards.map((award) => (
              <div key={award.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '3px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#111827' }}>{award.title}{award.issuer ? <span style={styles.company}> — {award.issuer}</span> : ''}</span>
                <span style={styles.date}>{award.date}</span>
              </div>
            ))}
          </section>
        ) : null;
      default:
        return null;
    }
  };

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedinUrl ? toDisplayUrl(personalInfo.linkedinUrl) : '',
    personalInfo.githubUrl ? toDisplayUrl(personalInfo.githubUrl) : '',
  ].filter(Boolean);

  const orderedSections = normalizeSectionOrder(cv.sectionOrder);

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      <header>
        <h1 style={styles.name}>{personalInfo.name || 'Your Name'}</h1>
        {contactItems.length > 0 && (
          <div style={styles.contact}>
            {contactItems.map((item, i) => (
              <span key={item as string}>
                {i > 0 && <span style={{ color: '#cbd5e1', marginRight: '10px' }}>|</span>}
                {item}
              </span>
            ))}
          </div>
        )}
      </header>
      <div style={styles.headerRule} />
      {orderedSections.map(renderSection)}
    </div>
  );
}
