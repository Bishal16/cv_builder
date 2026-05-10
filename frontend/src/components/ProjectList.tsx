import type { Project } from '../types/cv';
import { ProjectItem } from './ProjectItem';

interface ProjectListProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
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
      <div className="flex justify-between items-center">
        <h3 className="text-white font-medium">Projects</h3>
        <button
          type="button"
          onClick={addProject}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
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
        <p className="text-gray-400 text-center py-4">No projects added yet. Click "Add" to start.</p>
      )}
    </div>
  );
}