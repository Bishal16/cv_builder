import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';
import { resolveCustomization } from './customization';

interface TimelineTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const toExternalUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function TimelineTemplate({ cv, containerClass = '', containerStyle = {} }: TimelineTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects, certifications, languages, awards } = cv;
  const c = resolveCustomization(cv);

  const styles = {
    container: {
      width: '794px',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontFamily: c.fontStack,
      fontSize: '12px',
      lineHeight: String(c.lineHeight),
      padding: `${Math.round(44 * c.padScale)}px ${Math.round(50 * c.padScale)}px`,
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    name: { fontSize: '27px', fontWeight: '700', color: '#111827', letterSpacing: '-0.015em' } as React.CSSProperties,
    contact: {
      fontSize: '11px', color: '#4b5563', marginTop: '6px',
      display: 'flex', flexWrap: 'wrap' as const, gap: '4px 14px',
      paddingBottom: `${Math.round(20 * c.gapScale)}px`,
      borderBottom: '1px solid #e5e7eb',
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' as const,
      letterSpacing: '0.1em', color: c.accent,
      marginTop: `${Math.round(24 * c.gapScale)}px`, marginBottom: '14px',
    } as React.CSSProperties,
    // timeline item
    item: { position: 'relative' as const, paddingLeft: '26px', paddingBottom: `${Math.round(16 * c.gapScale)}px` } as React.CSSProperties,
    line: { position: 'absolute' as const, left: '4px', top: '6px', bottom: '0', width: '2px', backgroundColor: c.accentTintStrong } as React.CSSProperties,
    dot: { position: 'absolute' as const, left: '0', top: '3px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.accent, border: '2px solid #fff', boxShadow: `0 0 0 2px ${c.accentTintStrong}` } as React.CSSProperties,
    role: { fontSize: '13px', fontWeight: '600', color: '#111827' } as React.CSSProperties,
    company: { fontSize: '11.5px', color: '#4b5563', marginTop: '1px' } as React.CSSProperties,
    date: { fontSize: '10.5px', color: '#6b7280', flexShrink: 0 } as React.CSSProperties,
    richText: { fontSize: '11.5px', lineHeight: String(c.lineHeight), color: '#374151', marginTop: '5px' } as React.CSSProperties,
    skillPill: {
      display: 'inline-block', fontSize: '10.5px', color: c.accent,
      background: c.accentTint, border: `1px solid ${c.accentTintStrong}`,
      borderRadius: '999px', padding: '3px 11px', marginRight: '6px', marginBottom: '6px',
    } as React.CSSProperties,
  };

  // Timeline entry with connector. `last` removes the trailing line.
  const TimelineEntry = ({ last, children }: { last: boolean; children: React.ReactNode }) => (
    <div style={styles.item}>
      {!last && <span style={styles.line} />}
      <span style={styles.dot} />
      {children}
    </div>
  );

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'personal':
        return personalInfo.summary ? (
          <section key="personal">
            <h2 style={styles.sectionTitle}>Profile</h2>
            <div className="cv-rich-text" style={styles.richText}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }} />
          </section>
        ) : null;
      case 'experience':
        return experiences.length > 0 ? (
          <section key="experience">
            <h2 style={styles.sectionTitle}>Experience</h2>
            {experiences.map((exp, i) => (
              <TimelineEntry key={exp.id} last={i === experiences.length - 1}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <span style={styles.role}>{exp.role}</span>
                  <span style={styles.date}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div style={styles.company}>{exp.company}</div>
                <div className="cv-rich-text" style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }} />
              </TimelineEntry>
            ))}
          </section>
        ) : null;
      case 'education':
        return educations.length > 0 ? (
          <section key="education">
            <h2 style={styles.sectionTitle}>Education</h2>
            {educations.map((edu, i) => (
              <TimelineEntry key={edu.id} last={i === educations.length - 1}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <span style={styles.role}>{edu.institution}</span>
                  <span style={styles.date}>{edu.graduationYear}</span>
                </div>
                <div style={styles.company}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
              </TimelineEntry>
            ))}
          </section>
        ) : null;
      case 'projects':
        return projects.length > 0 ? (
          <section key="projects">
            <h2 style={styles.sectionTitle}>Projects</h2>
            {projects.map((p, i) => (
              <TimelineEntry key={p.id} last={i === projects.length - 1}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
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
              </TimelineEntry>
            ))}
          </section>
        ) : null;
      case 'skills':
        return skills.length > 0 ? (
          <section key="skills">
            <h2 style={styles.sectionTitle}>Skills</h2>
            <div>{skills.map((s) => <span key={s.id} style={styles.skillPill}>{s.name}</span>)}</div>
          </section>
        ) : null;
      case 'certifications':
        return certifications.length > 0 ? (
          <section key="certifications">
            <h2 style={styles.sectionTitle}>Certifications</h2>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontWeight: '600', fontSize: '11px' }}>{cert.name}</span>
                  {cert.issuer && <span style={{ fontSize: '10px', color: '#6b7280' }}> · {cert.issuer}</span>}
                </div>
                {cert.issueDate && <span style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0 }}>{cert.issueDate}</span>}
              </div>
            ))}
          </section>
        ) : null;
      case 'languages':
        return languages.length > 0 ? (
          <section key="languages">
            <h2 style={styles.sectionTitle}>Languages</h2>
            <p style={{ fontSize: '11px', color: '#374151' }}>
              {languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' · ')}
            </p>
          </section>
        ) : null;
      case 'awards':
        return awards.length > 0 ? (
          <section key="awards">
            <h2 style={styles.sectionTitle}>Awards</h2>
            {awards.map((award) => (
              <div key={award.id} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontWeight: '600', fontSize: '11px' }}>{award.title}</span>
                  {award.date && <span style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0 }}>{award.date}</span>}
                </div>
                {award.issuer && <div style={{ fontSize: '10px', color: '#6b7280' }}>{award.issuer}</div>}
              </div>
            ))}
          </section>
        ) : null;
      default:
        return null;
    }
  };

  const contactItems = [
    personalInfo.email, personalInfo.phone, personalInfo.location,
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
                {i > 0 && <span style={{ color: '#cbd5e1', marginRight: '14px' }}>·</span>}
                {item}
              </span>
            ))}
          </div>
        )}
      </header>
      {orderedSections.map(renderSection)}
    </div>
  );
}
