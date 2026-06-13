import type { Cv } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';
import { resolveCustomization } from './customization';
import { getOrderedContentSections } from './sectionOrder';

interface PolishedTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const toExternalUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function PolishedTemplate({ cv, containerClass = '', containerStyle = {} }: PolishedTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;
  const c = resolveCustomization(cv);
  const ordered = getOrderedContentSections(cv);
  const photo = personalInfo.photoUrl;

  const styles = {
    container: {
      width: '794px', minHeight: '1123px', display: 'flex',
      backgroundColor: '#ffffff', color: '#2d3748',
      fontFamily: c.fontStack, fontSize: '12px', lineHeight: String(c.lineHeight),
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    main: { flex: 1, padding: `${Math.round(46 * c.padScale)}px 34px ${Math.round(46 * c.padScale)}px 48px`, boxSizing: 'border-box' as const, minWidth: 0 } as React.CSSProperties,
    rail: { width: '248px', flexShrink: 0, backgroundColor: c.accentTint, borderLeft: `1px solid ${c.accentTintStrong}`, padding: `${Math.round(38 * c.padScale)}px 30px`, boxSizing: 'border-box' as const } as React.CSSProperties,
    avatar: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' as const, display: 'block', margin: '0 auto 18px', border: `3px solid ${c.accent}` } as React.CSSProperties,
    avatarFallback: { width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 18px', background: c.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 700 } as React.CSSProperties,
    name: { fontSize: '28px', fontWeight: '700', color: c.accent, letterSpacing: '-0.01em', lineHeight: 1.12 } as React.CSSProperties,
    headRule: { width: '46px', height: '3px', backgroundColor: c.accent, margin: '12px 0 18px' } as React.CSSProperties,
    sectionTitle: { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: c.accent, borderBottom: `1px solid ${c.accentTintStrong}`, paddingBottom: '5px', marginTop: `${Math.round(24 * c.gapScale)}px`, marginBottom: '12px' } as React.CSSProperties,
    railHeading: { fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: c.accent, marginTop: `${Math.round(22 * c.gapScale)}px`, marginBottom: '9px' } as React.CSSProperties,
    railText: { fontSize: '11px', color: '#374151', lineHeight: 1.5, wordBreak: 'break-word' as const } as React.CSSProperties,
    role: { fontSize: '13px', fontWeight: '600', color: '#1a202c' } as React.CSSProperties,
    company: { fontSize: '11.5px', fontStyle: 'italic' as const, color: '#4b5563', marginTop: '1px' } as React.CSSProperties,
    date: { fontSize: '10.5px', color: '#718096', flexShrink: 0 } as React.CSSProperties,
    richText: { fontSize: '11.5px', lineHeight: String(c.lineHeight), color: '#374151', marginTop: '5px' } as React.CSSProperties,
  };

  const initials = (personalInfo.name || 'Y N').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const renderMain = (id: string, first: boolean) => {
    const t = first ? { ...styles.sectionTitle, marginTop: 0 } : styles.sectionTitle;
    if (id === 'experience' && experiences.length > 0) {
      return (
        <section key="experience">
          <h2 style={t}>Experience</h2>
          {experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: `${Math.round(15 * c.gapScale)}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <span style={styles.role}>{exp.role}</span>
                <span style={styles.date}>{exp.startDate} – {exp.endDate || 'Present'}</span>
              </div>
              <div style={styles.company}>{exp.company}</div>
              <div className="cv-rich-text" style={styles.richText} dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }} />
            </div>
          ))}
        </section>
      );
    }
    if (id === 'projects' && projects.length > 0) {
      return (
        <section key="projects">
          <h2 style={t}>Projects</h2>
          {projects.map((p) => (
            <div key={p.id} style={{ marginBottom: `${Math.round(13 * c.gapScale)}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <span style={styles.role}>{p.name}</span>
                {p.url && <a href={toExternalUrl(p.url)} target="_blank" rel="noreferrer" style={{ ...styles.date, color: c.accent, textDecoration: 'none', wordBreak: 'break-all', maxWidth: '200px', textAlign: 'right' }}>{toDisplayUrl(p.url)}</a>}
              </div>
              <div className="cv-rich-text" style={styles.richText} dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(p.description) }} />
            </div>
          ))}
        </section>
      );
    }
    return null;
  };

  // Experience + projects in main; summary always leads main.
  const mainSections = ordered.filter((s) => s === 'experience' || s === 'projects');

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      <main style={styles.main}>
        <h1 style={styles.name}>{personalInfo.name || 'Your Name'}</h1>
        <div style={styles.headRule} />
        {personalInfo.summary && (
          <section>
            <div className="cv-rich-text" style={{ ...styles.richText, marginTop: 0 }} dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }} />
          </section>
        )}
        {mainSections.map((id, i) => renderMain(id, !personalInfo.summary && i === 0))}
      </main>

      <aside style={styles.rail}>
        {photo
          ? <img src={photo} alt="" style={styles.avatar} />
          : <div style={styles.avatarFallback}>{initials}</div>}

        <p style={{ ...styles.railHeading, marginTop: 0 }}>Contact</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {personalInfo.email && <span style={styles.railText}>{personalInfo.email}</span>}
          {personalInfo.phone && <span style={styles.railText}>{personalInfo.phone}</span>}
          {personalInfo.location && <span style={styles.railText}>{personalInfo.location}</span>}
          {personalInfo.linkedinUrl && <span style={styles.railText}>{toDisplayUrl(personalInfo.linkedinUrl)}</span>}
          {personalInfo.githubUrl && <span style={styles.railText}>{toDisplayUrl(personalInfo.githubUrl)}</span>}
        </div>

        {skills.length > 0 && (
          <>
            <p style={styles.railHeading}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skills.map((s) => (
                <span key={s.id} style={{ fontSize: '10px', color: c.accent, background: '#fff', border: `1px solid ${c.accentTintStrong}`, borderRadius: '4px', padding: '2px 7px' }}>{s.name}</span>
              ))}
            </div>
          </>
        )}

        {educations.length > 0 && (
          <>
            <p style={styles.railHeading}>Education</p>
            {educations.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '11px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#1a202c' }}>{edu.institution}</div>
                <div style={styles.railText}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
                <div style={{ fontSize: '10px', color: '#718096', marginTop: '1px' }}>{edu.graduationYear}</div>
              </div>
            ))}
          </>
        )}
      </aside>
    </div>
  );
}
