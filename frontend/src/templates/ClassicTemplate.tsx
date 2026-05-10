import type { Cv } from '../types/cv';

interface ClassicTemplateProps {
  cv: Cv;
}

export function ClassicTemplate({ cv }: ClassicTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-gray-800 font-serif">
      <header className="border-b-2 border-gray-800 px-8 py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{personalInfo.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      <div className="flex">
        <aside className="w-1/3 bg-gray-50 p-6 border-r border-gray-200">
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3 border-b border-gray-300 pb-1">
              Skills
            </h2>
            <ul className="space-y-2">
              {skills.map((skill) => (
                <li key={skill.id} className="text-sm">
                  <span className="font-medium">{skill.name}</span>
                  {skill.level && (
                    <span className="text-gray-500 text-xs ml-1">({skill.level})</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3 border-b border-gray-300 pb-1">
              Education
            </h2>
            <ul className="space-y-3">
              {educations.map((edu) => (
                <li key={edu.id} className="text-sm">
                  <p className="font-medium">{edu.institution}</p>
                  <p className="text-gray-600">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </p>
                  <p className="text-gray-500 text-xs">{edu.graduationYear}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="w-2/3 p-6">
          {personalInfo.summary && (
            <section className="mb-6">
              <h2 className="text-lg font-bold mb-2">Professional Summary</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{personalInfo.summary}</p>
            </section>
          )}

          <section className="mb-6">
            <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Experience</h2>
            <ul className="space-y-4">
              {experiences.map((exp) => (
                <li key={exp.id} className="text-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold">{exp.role}</h3>
                    <span className="text-xs text-gray-500">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{exp.company}</p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                </li>
              ))}
            </ul>
          </section>

          {projects.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Projects</h2>
              <ul className="space-y-3">
                {projects.map((project) => (
                  <li key={project.id} className="text-sm">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium">{project.name}</h3>
                      {project.url && (
                        <span className="text-xs text-gray-500 truncate ml-2">{project.url}</span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{project.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
