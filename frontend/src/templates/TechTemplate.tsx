import type { Cv, Skill } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';
import { getOrderedContentSections } from './sectionOrder';
import { resolveCustomization } from './customization';

interface TechTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const MONO = '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';

const makeStyles = (ACCENT: string) => ({
  container: {
    width: '794px',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontFamily: '"Inter", Helvetica, Arial, sans-serif',
    fontSize: '12px',
    lineHeight: '1.5',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  header: {
    padding: '38px 45px 24px 45px',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,
  name: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
  } as React.CSSProperties,
  contactRow: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '14px',
    fontSize: '10.5px',
    fontFamily: MONO,
    color: '#6b7280',
  } as React.CSSProperties,
  content: {
    display: 'flex' as const,
  } as React.CSSProperties,
  main: {
    width: '67%',
    padding: '24px 32px 45px 45px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  rail: {
    width: '33%',
    padding: '24px 45px 45px 0',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '10.5px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: ACCENT,
    marginBottom: '12px',
    marginTop: '24px',
  } as React.CSSProperties,
  role: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
  } as React.CSSProperties,
  company: {
    fontSize: '11.5px',
    color: '#4b5563',
    marginTop: '1px',
  } as React.CSSProperties,
  date: {
    fontSize: '10px',
    fontFamily: MONO,
    color: '#9ca3af',
    flexShrink: 0,
  } as React.CSSProperties,
  richText: {
    fontSize: '11.5px',
    lineHeight: '1.55',
    color: '#374151',
    marginTop: '5px',
  } as React.CSSProperties,
  skillCategory: {
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#6b7280',
    marginBottom: '5px',
    marginTop: '12px',
  } as React.CSSProperties,
  skillPill: {
    display: 'inline-block',
    fontSize: '10px',
    fontFamily: MONO,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '2px 7px',
    marginRight: '5px',
    marginBottom: '5px',
  } as React.CSSProperties,
});

const toExternalUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function TechTemplate({ cv, containerClass = '', containerStyle = {} }: TechTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;
  const c = resolveCustomization(cv);
  const ACCENT = c.accent;
  const styles = makeStyles(ACCENT);
  const orderedContentSections = getOrderedContentSections(cv);

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Skills';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const contactItems: Array<{ label: string; href?: string }> = [
    personalInfo.email ? { label: personalInfo.email } : null,
    personalInfo.phone ? { label: personalInfo.phone } : null,
    personalInfo.location ? { label: personalInfo.location } : null,
    personalInfo.githubUrl ? { label: toDisplayUrl(personalInfo.githubUrl), href: toExternalUrl(personalInfo.githubUrl) } : null,
    personalInfo.linkedinUrl ? { label: toDisplayUrl(personalInfo.linkedinUrl), href: toExternalUrl(personalInfo.linkedinUrl) } : null,
  ].filter((x): x is { label: string; href?: string } => x !== null);

  // Main column: experience + projects (in user's order). Rail: skills + education.
  const mainSections = orderedContentSections.filter((s) => s === 'experience' || s === 'projects');
  const railSections = orderedContentSections.filter((s) => s === 'skills' || s === 'education');

  const renderMain = (id: string, isFirst: boolean) => {
    const titleStyle = isFirst ? { ...styles.sectionTitle, marginTop: 0 } : styles.sectionTitle;
    if (id === 'experience' && experiences.length > 0) {
      return (
        <section key="experience">
          <h2 style={titleStyle}>Experience</h2>
          {experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <span style={styles.role}>{exp.role}</span>
                <span style={styles.date}>{exp.startDate} – {exp.endDate || 'Present'}</span>
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
      );
    }
    if (id === 'projects' && projects.length > 0) {
      return (
        <section key="projects">
          <h2 style={titleStyle}>Projects</h2>
          {projects.map((p) => (
            <div key={p.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <span style={styles.role}>{p.name}</span>
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
      );
    }
    return null;
  };

  const renderRail = (id: string, isFirst: boolean) => {
    const titleStyle = isFirst ? { ...styles.sectionTitle, marginTop: 0 } : styles.sectionTitle;
    if (id === 'skills' && skills.length > 0) {
      return (
        <section key="skills">
          <h2 style={titleStyle}>Tech Stack</h2>
          {Object.entries(groupedSkills).map(([category, items]) => (
            <div key={category}>
              {Object.keys(groupedSkills).length > 1 && (
                <div style={styles.skillCategory}>{category}</div>
              )}
              <div>
                {items.map((s) => (
                  <span key={s.id} style={styles.skillPill}>{s.name}</span>
                ))}
              </div>
            </div>
          ))}
        </section>
      );
    }
    if (id === 'education' && educations.length > 0) {
      return (
        <section key="education">
          <h2 style={titleStyle}>Education</h2>
          {educations.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{edu.institution}</div>
              <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '1px' }}>
                {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
              </div>
              <div style={{ ...styles.date, marginTop: '2px' }}>{edu.graduationYear}</div>
            </div>
          ))}
        </section>
      );
    }
    return null;
  };

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      <header style={styles.header}>
        <h1 style={styles.name}>{personalInfo.name || 'Your Name'}</h1>
        {contactItems.length > 0 && (
          <div style={styles.contactRow}>
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
        )}
      </header>

      <div style={styles.content}>
        <main style={styles.main}>
          {personalInfo.summary && (
            <section>
              <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>Summary</h2>
              <div
                className="cv-rich-text"
                style={{ ...styles.richText, marginTop: 0 }}
                dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
              />
            </section>
          )}
          {mainSections.map((id, i) => renderMain(id, i === 0 && !personalInfo.summary))}
        </main>

        <aside style={styles.rail}>
          {railSections.map((id, i) => renderRail(id, i === 0))}
        </aside>
      </div>
    </div>
  );
}
