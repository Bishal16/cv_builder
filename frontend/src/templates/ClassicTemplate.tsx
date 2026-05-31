import type { Cv } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';
import { getOrderedContentSections } from './sectionOrder';

interface ClassicTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const styles = {
  container: {
    width: '794px',
    backgroundColor: '#ffffff',
    color: '#333333',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '12px',
    lineHeight: '1.4',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  header: {
    padding: '37px 45px 30px 45px',
    borderBottom: '2px solid #333333',
  } as React.CSSProperties,
  name: {
    fontSize: '26px',
    fontWeight: 'bold' as const,
    marginBottom: '5px',
    color: '#1a202c',
  } as React.CSSProperties,
  contact: {
    fontSize: '11px',
    color: '#4a5568',
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '16px',
  } as React.CSSProperties,
  content: {
    display: 'flex' as const,
    minHeight: '941px',
  } as React.CSSProperties,
  sidebar: {
    width: '33.333%',
    backgroundColor: '#f7fafc',
    borderRight: '1px solid #e2e8f0',
    padding: '30px',
    flexShrink: 0,
  } as React.CSSProperties,
  main: {
    width: '66.666%',
    padding: '30px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 'bold' as const,
    color: '#2d3748',
    borderBottom: '1px solid #cbd5e0',
    paddingBottom: '3px',
    marginBottom: '10px',
    marginTop: '20px',
  } as React.CSSProperties,
  body: {
    fontSize: '12px',
    lineHeight: '1.4',
    color: '#333333',
  } as React.CSSProperties,
  muted: {
    color: '#4a5568',
  } as React.CSSProperties,
  skillLevel: {
    fontSize: '10px',
    color: '#718096',
    marginLeft: '4px',
  } as React.CSSProperties,
  itemSpacing: {
    marginBottom: '16px',
  } as React.CSSProperties,
  roleDate: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    marginBottom: '4px',
  } as React.CSSProperties,
  role: {
    fontWeight: 'bold' as const,
    fontSize: '12px',
  } as React.CSSProperties,
  date: {
    fontSize: '10px',
    color: '#718096',
    flexShrink: 0,
  } as React.CSSProperties,
  richText: {
    fontSize: '12px',
    lineHeight: '1.4',
    color: '#333333',
  } as React.CSSProperties,
};

const toExternalUrl = (value: string): string =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;
const toDisplayUrl = (value: string): string =>
  value.replace(/^https?:\/\//i, '');

export function ClassicTemplate({ cv, containerClass = '', containerStyle = {} }: ClassicTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;
  const orderedContentSections = getOrderedContentSections(cv);
  const rankBySection = (section: 'experience' | 'education' | 'skills' | 'projects'): number => {
    const rank = orderedContentSections.indexOf(section);
    return rank === -1 ? Number.MAX_SAFE_INTEGER : rank;
  };

  const sidebarSections = ['skills', 'education'] as const;
  const orderedSidebarSections = [...sidebarSections].sort(
    (a, b) => rankBySection(a) - rankBySection(b),
  );

  const mainSections = ['experience', 'projects'] as const;
  const orderedMainSections = [...mainSections].sort(
    (a, b) => rankBySection(a) - rankBySection(b),
  );

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
              style={{ color: '#2b6cb0', wordBreak: 'break-all' }}
            >
              {toDisplayUrl(personalInfo.linkedinUrl)}
            </a>
          )}
          {personalInfo.githubUrl && (
            <a
              href={toExternalUrl(personalInfo.githubUrl)}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#2b6cb0', wordBreak: 'break-all' }}
            >
              {toDisplayUrl(personalInfo.githubUrl)}
            </a>
          )}
        </div>
      </header>

      <div style={styles.content}>
        <aside style={styles.sidebar}>
          {orderedSidebarSections.map((sectionId, index) => (
            <section key={sectionId} style={{ marginTop: index === 0 ? 0 : '24px' }}>
              {sectionId === 'skills' ? (
                <>
                  <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>Skills</h2>
                  {skills.map((skill) => (
                    <div key={skill.id} style={{ ...styles.body, marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>{skill.name}</span>
                      {skill.level && (
                        <span style={styles.skillLevel}>({skill.level})</span>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>Education</h2>
                  {educations.map((edu) => (
                    <div key={edu.id} style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '500' }}>{edu.institution}</div>
                      <div style={{ fontSize: '11px', color: '#4a5568' }}>{edu.degree} {edu.field && `in ${edu.field}`}</div>
                      <div style={{ fontSize: '10px', color: '#718096' }}>{edu.graduationYear}</div>
                    </div>
                  ))}
                </>
              )}
            </section>
          ))}
        </aside>

        <main style={styles.main}>
          {personalInfo.summary && (
            <section>
              <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>Professional Summary</h2>
              <div
                className="cv-rich-text"
                style={styles.richText}
                dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
              />
            </section>
          )}

          {orderedMainSections.map((sectionId) => {
            if (sectionId === 'projects' && projects.length === 0) {
              return null;
            }

            if (sectionId === 'experience') {
              return (
                <section key="experience">
                  <h2 style={styles.sectionTitle}>Experience</h2>
                  {experiences.map((exp) => (
                    <div key={exp.id} style={{ marginBottom: '16px' }}>
                      <div style={styles.roleDate}>
                        <span style={styles.role}>{exp.role}</span>
                        <span style={styles.date}>{exp.startDate} - {exp.endDate || 'Present'}</span>
                      </div>
                      <div style={{ ...styles.muted, fontSize: '11px' }}>{exp.company}</div>
                      <div style={{ marginTop: '4px' }}>
                        <div
                          className="cv-rich-text"
                          style={styles.richText}
                          dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }}
                        />
                      </div>
                    </div>
                  ))}
                </section>
              );
            }

            return (
              <section key="projects">
                <h2 style={styles.sectionTitle}>Projects</h2>
                {projects.map((project) => (
                  <div key={project.id} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
                      <span style={{ fontWeight: '500', fontSize: '12px' }}>{project.name}</span>
                      {project.url && (
                        <span style={{ fontSize: '10px', color: '#3182ce', maxWidth: '180px', wordBreak: 'break-all', textAlign: 'right' }}>
                          {project.url}
                        </span>
                      )}
                    </div>
                    <div>
                      <div
                        className="cv-rich-text"
                        style={styles.richText}
                        dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(project.description) }}
                      />
                    </div>
                  </div>
                ))}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}