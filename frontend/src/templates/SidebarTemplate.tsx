import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';
import { resolveCustomization } from './customization';

interface SidebarTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const toExternalUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function SidebarTemplate({ cv, containerClass = '', containerStyle = {} }: SidebarTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;
  const c = resolveCustomization(cv);

  const styles = {
    container: {
      width: '794px',
      minHeight: '1123px',
      display: 'flex',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontFamily: c.fontStack,
      fontSize: '12px',
      lineHeight: String(c.lineHeight),
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    rail: {
      width: '262px',
      flexShrink: 0,
      backgroundColor: c.accent,
      color: '#ffffff',
      padding: `${Math.round(40 * c.padScale)}px 26px`,
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    main: {
      flex: 1,
      padding: `${Math.round(40 * c.padScale)}px ${Math.round(38 * c.padScale)}px`,
      boxSizing: 'border-box' as const,
      minWidth: 0,
    } as React.CSSProperties,
    railName: {
      fontSize: '23px',
      fontWeight: '700',
      letterSpacing: '-0.01em',
      lineHeight: 1.15,
    } as React.CSSProperties,
    railTitle: {
      fontSize: '11px',
      color: 'rgba(255,255,255,0.7)',
      marginTop: '6px',
      lineHeight: 1.4,
    } as React.CSSProperties,
    railHeading: {
      fontSize: '10px',
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.14em',
      color: 'rgba(255,255,255,0.55)',
      marginBottom: '9px',
      marginTop: `${Math.round(26 * c.gapScale)}px`,
    } as React.CSSProperties,
    railText: {
      fontSize: '11px',
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 1.5,
      wordBreak: 'break-word' as const,
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      color: c.accent,
      paddingBottom: '5px',
      marginBottom: '12px',
      marginTop: `${Math.round(22 * c.gapScale)}px`,
      borderBottom: `2px solid ${c.accentTintStrong}`,
    } as React.CSSProperties,
    role: { fontSize: '13px', fontWeight: '600', color: '#111827' } as React.CSSProperties,
    company: { fontSize: '11.5px', color: '#4b5563', marginTop: '1px' } as React.CSSProperties,
    date: { fontSize: '10.5px', color: '#6b7280', flexShrink: 0 } as React.CSSProperties,
    richText: { fontSize: '11.5px', lineHeight: String(c.lineHeight), color: '#374151', marginTop: '5px' } as React.CSSProperties,
  };

  const railSkills = skills.length > 0 && (
    <div key="rail-skills">
      <p style={styles.railHeading}>Skills</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {skills.map((s) => (
          <span key={s.id} style={{ fontSize: '10px', color: '#fff', background: 'rgba(255,255,255,0.14)', borderRadius: '4px', padding: '2px 7px' }}>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );

  const railEducation = educations.length > 0 && (
    <div key="rail-edu">
      <p style={styles.railHeading}>Education</p>
      {educations.map((edu) => (
        <div key={edu.id} style={{ marginBottom: '11px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#fff' }}>{edu.institution}</div>
          <div style={{ ...styles.railText, color: 'rgba(255,255,255,0.75)' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>{edu.graduationYear}</div>
        </div>
      ))}
    </div>
  );

  const renderMain = (id: SectionId) => {
    switch (id) {
      case 'personal':
        return personalInfo.summary ? (
          <section key="personal">
            <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>Profile</h2>
            <div className="cv-rich-text" style={{ ...styles.richText, marginTop: 0 }}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }} />
          </section>
        ) : null;
      case 'experience':
        return experiences.length > 0 ? (
          <section key="experience">
            <h2 style={styles.sectionTitle}>Experience</h2>
            {experiences.map((exp) => (
              <div key={exp.id} style={{ marginBottom: `${Math.round(15 * c.gapScale)}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <span style={styles.role}>{exp.role}</span>
                  <span style={styles.date}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div style={styles.company}>{exp.company}</div>
                <div className="cv-rich-text" style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }} />
              </div>
            ))}
          </section>
        ) : null;
      case 'projects':
        return projects.length > 0 ? (
          <section key="projects">
            <h2 style={styles.sectionTitle}>Projects</h2>
            {projects.map((p) => (
              <div key={p.id} style={{ marginBottom: `${Math.round(13 * c.gapScale)}px` }}>
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
              </div>
            ))}
          </section>
        ) : null;
      default:
        return null; // education + skills live in the rail
    }
  };

  const orderedSections = normalizeSectionOrder(cv.sectionOrder);

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      {/* Coloured rail */}
      <aside style={styles.rail}>
        <h1 style={styles.railName}>{personalInfo.name || 'Your Name'}</h1>
        <p style={styles.railHeading}>Contact</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {personalInfo.email && <span style={styles.railText}>{personalInfo.email}</span>}
          {personalInfo.phone && <span style={styles.railText}>{personalInfo.phone}</span>}
          {personalInfo.location && <span style={styles.railText}>{personalInfo.location}</span>}
          {personalInfo.linkedinUrl && <span style={styles.railText}>{toDisplayUrl(personalInfo.linkedinUrl)}</span>}
          {personalInfo.githubUrl && <span style={styles.railText}>{toDisplayUrl(personalInfo.githubUrl)}</span>}
        </div>
        {railSkills}
        {railEducation}
      </aside>

      {/* Main column */}
      <main style={styles.main}>
        {orderedSections.map(renderMain)}
      </main>
    </div>
  );
}
