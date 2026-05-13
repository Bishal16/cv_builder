import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
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

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  return (
    <div className="p-6 bg-bg-surface rounded-2xl micro-border">
      <div className="flex justify-end mb-6">
        <button
          onClick={onRemove}
          className="text-text-muted hover:text-rose-400 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          Remove
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Project Name</label>
          <input
            type="text"
            value={project.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-field"
            placeholder="Project name"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Description</label>
          <div className="rich-text-editor sm">
            <ReactQuill
              theme="snow"
              value={project.description}
              onChange={(value) => handleChange('description', value)}
              modules={modules}
              placeholder="Brief description of the project..."
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">URL (optional)</label>
          <input
            type="url"
            value={project.url}
            onChange={(e) => handleChange('url', e.target.value)}
            className="input-field"
            placeholder="https://github.com/..."
          />
        </div>
      </div>
    </div>
  );
}