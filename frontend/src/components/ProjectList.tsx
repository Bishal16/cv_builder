import type { Project } from '../types/cv';
import { ProjectItem } from './ProjectItem';

interface ProjectListProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function ProjectList({ projects, onChange }: ProjectListProps) {
  const addProject = () => {
    const newProject: Project = {
      id: generateId(),
      name: '',
      description: '',
      url: '',
    };
    onChange([...projects, newProject]);
  };

  const updateProject = (index: number, updated: Project) => {
    const updatedList = [...projects];
    updatedList[index] = updated;
    onChange(updatedList);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addProject}
          className="btn-primary !py-2 !px-4 !text-sm"
        >
          + Add
        </button>
      </div>
      {projects.map((project, index) => (
        <ProjectItem
          key={project.id}
          project={project}
          onChange={(updated) => updateProject(index, updated)}
          onRemove={() => removeProject(index)}
        />
      ))}
      {projects.length === 0 && (
        <p className="text-center py-4 text-text-dim">No projects added yet. Click "Add" to start.</p>
      )}
    </div>
  );
}