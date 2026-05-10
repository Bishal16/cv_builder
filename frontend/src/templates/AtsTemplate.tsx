import type { Cv } from '../types/cv';

interface AtsTemplateProps {
  cv: Cv;
}

export function AtsTemplate({ cv }: AtsTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 font-sans">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{personalInfo.name || 'Your Name'}</h1>
        <p className="text-sm">
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
          ].filter(Boolean).join(' | ')}
        </p>
      </header>

      {personalInfo.summary && (
        <section className="mb-5">
          <h2 className="text-base font-bold border-b border-black pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
          <p className="text-sm leading-relaxed">{personalInfo.summary}</p>
        </section>
      )}

      <section className="mb-5">
        <h2 className="text-base font-bold border-b border-black pb-1 mb-2">WORK EXPERIENCE</h2>
        {experiences.map((exp) => (
          <div key={exp.id} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-bold">{exp.role}</h3>
              <span className="text-sm">{exp.startDate} - {exp.endDate || 'Present'}</span>
            </div>
            <p className="text-sm italic mb-1">{exp.company}</p>
            <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold border-b border-black pb-1 mb-2">EDUCATION</h2>
        {educations.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-bold">{edu.institution}</h3>
              <span className="text-sm">{edu.graduationYear}</span>
            </div>
            <p className="text-sm">
              {edu.degree} {edu.field && `in ${edu.field}`}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold border-b border-black pb-1 mb-2">SKILLS</h2>
        <p className="text-sm">
          {skills.map((s) => s.name).join(', ')}
        </p>
      </section>

      {projects.length > 0 && (
        <section>
          <h2 className="text-base font-bold border-b border-black pb-1 mb-2">PROJECTS</h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-bold">{project.name}</h3>
                {project.url && <span className="text-sm">{project.url}</span>}
              </div>
              <p className="text-sm leading-relaxed">{project.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
