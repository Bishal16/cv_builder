import type { Cv } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';

interface ModernTemplateProps {
  cv: Cv;
}

export function ModernTemplate({ cv }: ModernTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-800 shadow-xl mx-auto">
      <header className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600" style={{ padding: '10mm 12mm' }}>
          <h1 className="text-3xl font-bold text-white mb-2">{personalInfo.name || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-blue-100">
            {personalInfo.email && <span className="break-all">✉ {personalInfo.email}</span>}
            {personalInfo.phone && <span className="break-all">☎ {personalInfo.phone}</span>}
            {personalInfo.location && <span>⌖ {personalInfo.location}</span>}
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
      </header>

      <div className="space-y-6" style={{ padding: '0 12mm 12mm 12mm' }}>
        {personalInfo.summary && (
          <section className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">About</h2>
            <div 
              className="cv-rich-text text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
            />
          </section>
        )}

        <div className="grid grid-cols-3 gap-6">
          <section className="col-span-1">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Skills
            </h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                  <span className="text-sm font-medium">{skill.name}</span>
                  {skill.level && (
                    <span className="block text-xs text-gray-500">{skill.level}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="font-bold text-gray-800">{exp.role}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded shrink-0">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mb-2">{exp.company}</p>
                  <div 
                    className="cv-rich-text text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Education
            </h2>
            <div className="space-y-3">
              {educations.map((edu) => (
                <div key={edu.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800">{edu.institution}</h3>
                  <p className="text-sm text-gray-600">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{edu.graduationYear}</p>
                </div>
              ))}
            </div>
          </section>

          {projects.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Projects
              </h2>
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-gray-800">{project.name}</h3>
                      {project.url && (
                          <span className="ml-2 max-w-[180px] text-right text-xs text-gray-500 break-all">{project.url}</span>
                        )}
                      </div>
                    <div 
                      className="cv-rich-text mt-1 text-sm text-gray-600"
                      dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(project.description) }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
