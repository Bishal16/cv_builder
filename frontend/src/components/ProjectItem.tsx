import type { Project } from '../types/cv';

interface ProjectItemProps {
  project: Project;
  onChange: (project: Project) => void;
  onRemove: () => void;
}

export function ProjectItem({ project, onChange, onRemove }: ProjectItemProps) {
  const handleChange = (field: keyof Project, value: string) => {
    onChange({ ...project, [field]: value });
  };

  const inputClass = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm";

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="flex justify-end mb-3">
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Remove
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Project Name</label>
          <input
            type="text"
            value={project.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={inputClass}
            placeholder="Project name"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <textarea
            value={project.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`${inputClass} resize-none`}
            rows={2}
            placeholder="Brief description of the project..."
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">URL (optional)</label>
          <input
            type="url"
            value={project.url}
            onChange={(e) => handleChange('url', e.target.value)}
            className={inputClass}
            placeholder="https://github.com/..."
          />
        </div>
      </div>
    </div>
  );
}