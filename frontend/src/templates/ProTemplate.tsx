import type { Cv, Skill, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';

interface ProTemplateProps {
  cv: Cv;
}

export function ProTemplate({ cv }: ProTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects, certifications, languages, awards } = cv;

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Additional';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-2 mt-5">
      <h2 className="text-[11px] font-bold text-[#111111] tracking-[0.12em] uppercase mb-1.5">
        {title}
      </h2>
      <div className="h-px bg-[#111111] w-full" />
    </div>
  );

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'personal':
        return personalInfo.summary ? (
          <section key="personal" className="mb-5">
            <SectionHeader title="Professional Summary" />
            <div
              className="text-[13px] leading-[1.5] text-[#222222] cv-rich-text"
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
            />
          </section>
        ) : null;

      case 'skills':
        return skills.length > 0 ? (
          <section key="skills" className="mb-5">
            <SectionHeader title="Technical Skills" />
            <div className="space-y-1.5">
              {Object.entries(groupedSkills).map(([category, items]) => (
                <div key={category} className="text-[12.5px] flex gap-2 leading-tight">
                  <span className="font-bold min-w-[140px] text-black">{category}:</span>
                  <span className="text-[#222222]">
                    {items.map((s, idx) => (
                      <span key={s.id}>
                        {s.name}
                        {s.level && <span className="text-[#666666] italic text-[11.5px]"> ({s.level})</span>}
                        {idx < items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case 'experience':
        return experiences.length > 0 ? (
          <section key="experience" className="mb-5">
            <SectionHeader title="Work Experience" />
            <div className="space-y-5">
              {experiences.map((exp) => (
                <div key={exp.id} className="text-[13px]">
                  <div className="flex justify-between items-baseline font-bold text-black mb-1">
                    <div className="text-[13.5px]">{exp.role}, <span className="font-semibold">{exp.company}</span></div>
                    <div className="font-sans text-[11px] font-medium text-[#444444]">{exp.startDate} – {exp.endDate || 'Present'}</div>
                  </div>
                  <div
                    className="text-[#222222] leading-[1.5] cv-rich-text"
                    dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case 'education':
        return educations.length > 0 ? (
          <section key="education" className="mb-5">
            <SectionHeader title="Education" />
            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu.id} className="text-[13px]">
                  <div className="flex justify-between items-baseline font-bold text-black mb-0.5">
                    <div className="text-[13.5px] font-bold">{edu.institution}</div>
                    <div className="font-sans text-[11px] font-medium text-[#444444]">{edu.graduationYear}</div>
                  </div>
                  <div className="italic text-[#333333] text-[12.5px]">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case 'projects':
        return projects.length > 0 ? (
          <section key="projects" className="mb-5">
            <SectionHeader title="Projects" />
            <div className="space-y-5">
              {projects.map((project) => (
                <div key={project.id} className="text-[13px]">
                  <div className="flex justify-between items-baseline font-bold text-black mb-1">
                    <div className="text-[13.5px]">{project.name}</div>
                    {project.url && <div className="font-mono text-[10.5px] text-blue-700 italic underline decoration-blue-700/30">{project.url}</div>}
                  </div>
                  <div
                    className="text-[#222222] leading-[1.5] cv-rich-text"
                    dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(project.description) }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case 'certifications':
        return certifications.length > 0 ? (
          <section key="certifications" className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888] mb-3 border-b border-[#e5e5e5] pb-1">Certifications</h2>
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between gap-3 mb-1.5">
                <span className="text-[11px] font-semibold text-[#111111]">{cert.name}{cert.issuer ? <span className="font-normal text-[#555555]"> · {cert.issuer}</span> : ''}</span>
                {cert.issueDate && <span className="text-[10px] text-[#888888] shrink-0">{cert.issueDate}</span>}
              </div>
            ))}
          </section>
        ) : null;
      case 'languages':
        return languages.length > 0 ? (
          <section key="languages" className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888] mb-3 border-b border-[#e5e5e5] pb-1">Languages</h2>
            <p className="text-[11px] text-[#444444] leading-relaxed">
              {languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' · ')}
            </p>
          </section>
        ) : null;
      case 'awards':
        return awards.length > 0 ? (
          <section key="awards" className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888] mb-3 border-b border-[#e5e5e5] pb-1">Awards</h2>
            {awards.map((award) => (
              <div key={award.id} className="flex justify-between gap-3 mb-1.5">
                <div>
                  <span className="text-[11px] font-semibold text-[#111111]">{award.title}</span>
                  {award.issuer && <span className="text-[10.5px] text-[#555555]"> · {award.issuer}</span>}
                  {award.description && <p className="text-[10px] text-[#666666] mt-0.5">{award.description}</p>}
                </div>
                {award.date && <span className="text-[10px] text-[#888888] shrink-0">{award.date}</span>}
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
    <div className="w-[210mm] min-h-[297mm] bg-white text-[#111111] p-[45px] font-sans mx-auto overflow-hidden">
      {/* Centered Header */}
      <header className="text-center mb-8">
        <h1 className="text-[26px] font-bold tracking-tight mb-1 text-black leading-tight">{personalInfo.name || 'Your Name'}</h1>

        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10.5px] text-[#444444] font-sans mt-2">
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && <span className="text-[#999999] mx-0.5">·</span>}
          {personalInfo.email && <span className="hover:underline cursor-pointer">{personalInfo.email}</span>}
          {personalInfo.linkedinUrl && <span className="text-[#999999] mx-0.5">·</span>}
          {personalInfo.linkedinUrl && (
            <span className="hover:underline cursor-pointer">
              linkedin.com/in/{personalInfo.linkedinUrl.replace(/\/$/, '').split('/').pop()}
            </span>
          )}
          {personalInfo.githubUrl && <span className="text-[#999999] mx-0.5">·</span>}
          {personalInfo.githubUrl && (
            <span className="hover:underline cursor-pointer">
              github.com/{personalInfo.githubUrl.replace(/\/$/, '').split('/').pop()}
            </span>
          )}
        </div>
        <div className="text-[12.5px] text-[#444444] font-sans mt-1">
           {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      {orderedSections.map(renderSection)}
    </div>
  );
}
