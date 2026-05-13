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
    <div className="card p-5">
      <div className="flex justify-end mb-4">
        <button
          onClick={onRemove}
          className="text-rose-500 hover:text-rose-600 text-sm font-medium"
        >
          Remove
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="form-label">Project Name</label>
          <input
            type="text"
            value={project.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-field"
            placeholder="Project name"
          />
        </div>
        <div>
          <label className="form-label">Description</label>
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
          <label className="form-label">URL (optional)</label>
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