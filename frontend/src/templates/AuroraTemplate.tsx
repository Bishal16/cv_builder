import type { Cv } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';
import { resolveCustomization } from './customization';
import { getOrderedContentSections } from './sectionOrder';

interface AuroraTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const toExternalUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function AuroraTemplate({ cv, containerClass = '', containerStyle = {} }: AuroraTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;
  const c = resolveCustomization(cv);
  const ordered = getOrderedContentSections(cv);
  const photo = personalInfo.photoUrl;

  const styles = {
    container: {
      width: '794px',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontFamily: c.fontStack,
      fontSize: '12px',
      lineHeight: String(c.lineHeight),
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    header: {
      background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent}d9 100%)`,
      color: '#fff',
      padding: '30px 45px',
      display: 'flex',
      alignItems: 'center',
      gap: '22px',
    } as React.CSSProperties,
    avatar: {
      width: '78px', height: '78px', borderRadius: '50%', objectFit: 'cover' as const,
      border: '3px solid rgba(255,255,255,0.6)', flexShrink: 0, background: 'rgba(255,255,255,0.15)',
    } as React.CSSProperties,
    avatarFallback: {
      width: '78px', height: '78px', borderRadius: '50%', flexShrink: 0,
      border: '3px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '28px', fontWeight: 700, color: '#fff',
    } as React.CSSProperties,
    name: { fontSize: '27px', fontWeight: '700', letterSpacing: '-0.015em', lineHeight: 1.1 } as React.CSSProperties,
    contact: { fontSize: '11px', color: 'rgba(255,255,255,0.85)', marginTop: '7px', display: 'flex', flexWrap: 'wrap' as const, gap: '3px 14px' } as React.CSSProperties,
    body: { display: 'flex' } as React.CSSProperties,
    main: { flex: 1, padding: `${Math.round(26 * c.padScale)}px 28px ${Math.round(40 * c.padScale)}px 45px`, boxSizing: 'border-box' as const, minWidth: 0 } as React.CSSProperties,
    rail: { width: '236px', flexShrink: 0, padding: `${Math.round(26 * c.padScale)}px 45px ${Math.round(40 * c.padScale)}px 0`, boxSizing: 'border-box' as const } as React.CSSProperties,
    sectionTitle: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: c.accent, marginTop: `${Math.round(22 * c.gapScale)}px`, marginBottom: '11px' } as React.CSSProperties,
    role: { fontSize: '13px', fontWeight: '600', color: '#111827' } as React.CSSProperties,
    company: { fontSize: '11.5px', color: '#4b5563', marginTop: '1px' } as React.CSSProperties,
    date: { fontSize: '10.5px', color: '#6b7280', flexShrink: 0 } as React.CSSProperties,
    richText: { fontSize: '11.5px', lineHeight: String(c.lineHeight), color: '#374151', marginTop: '5px' } as React.CSSProperties,
    skillPill: { display: 'inline-block', fontSize: '10px', color: c.accent, background: c.accentTint, border: `1px solid ${c.accentTintStrong}`, borderRadius: '5px', padding: '2px 8px', marginRight: '5px', marginBottom: '5px' } as React.CSSProperties,
  };

  const contactItems = [
    personalInfo.email, personalInfo.phone, personalInfo.location,
    personalInfo.linkedinUrl ? toDisplayUrl(personalInfo.linkedinUrl) : '',
    personalInfo.githubUrl ? toDisplayUrl(personalInfo.githubUrl) : '',
  ].filter(Boolean);

  const initials = (personalInfo.name || 'Y N').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const mainSections = ordered.filter((s) => s === 'experience' || s === 'projects');
  const railSections = ordered.filter((s) => s === 'skills' || s === 'education');

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
                {p.url && <a href={toExternalUrl(p.url)} target="_blank" rel="noreferrer" style={{ ...styles.date, color: c.accent, textDecoration: 'none', wordBreak: 'break-all', maxWidth: '180px', textAlign: 'right' }}>{toDisplayUrl(p.url)}</a>}
              </div>
              <div className="cv-rich-text" style={styles.richText} dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(p.description) }} />
            </div>
          ))}
        </section>
      );
    }
    return null;
  };

  const renderRail = (id: string, first: boolean) => {
    const t = first ? { ...styles.sectionTitle, marginTop: 0 } : styles.sectionTitle;
    if (id === 'skills' && skills.length > 0) {
      return (
        <section key="skills">
          <h2 style={t}>Skills</h2>
          <div>{skills.map((s) => <span key={s.id} style={styles.skillPill}>{s.name}</span>)}</div>
        </section>
      );
    }
    if (id === 'education' && educations.length > 0) {
      return (
        <section key="education">
          <h2 style={t}>Education</h2>
          {educations.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{edu.institution}</div>
              <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '1px' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
              <div style={{ ...styles.date, marginTop: '2px' }}>{edu.graduationYear}</div>
            </div>
          ))}
        </section>
      );
    }
    return null;
  };

  // Profile summary spans full width under the header, before the two columns.
  const showSummary = !!personalInfo.summary;

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      <header style={styles.header}>
        {photo
          ? <img src={photo} alt="" style={styles.avatar} />
          : <div style={styles.avatarFallback}>{initials}</div>}
        <div style={{ minWidth: 0 }}>
          <h1 style={styles.name}>{personalInfo.name || 'Your Name'}</h1>
          {contactItems.length > 0 && (
            <div style={styles.contact}>
              {contactItems.map((item, i) => (
                <span key={item as string}>
                  {i > 0 && <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: '14px' }}>·</span>}
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {showSummary && (
        <div style={{ padding: `${Math.round(24 * c.padScale)}px 45px 0` }}>
          <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>Profile</h2>
          <div className="cv-rich-text" style={styles.richText} dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }} />
        </div>
      )}

      <div style={styles.body}>
        <main style={styles.main}>
          {mainSections.map((id, i) => renderMain(id, i === 0))}
        </main>
        <aside style={styles.rail}>
          {railSections.map((id, i) => renderRail(id, i === 0))}
        </aside>
      </div>
    </div>
  );
}
