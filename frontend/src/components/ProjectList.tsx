import { useState } from 'react';
import type { Project } from '../types/cv';
import { ConfirmDialog } from './ConfirmDialog';
import { ProjectItem } from './ProjectItem';

interface ProjectListProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function ProjectList({ projects, onChange }: ProjectListProps) {
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

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

  const requestRemoveProject = (index: number) => {
    setPendingRemoveIndex(index);
  };

  const confirmRemoveProject = () => {
    if (pendingRemoveIndex === null) {
      return;
    }

    onChange(projects.filter((_, i) => i !== pendingRemoveIndex));
    setPendingRemoveIndex(null);
  };

  const cancelRemoveProject = () => {
    setPendingRemoveIndex(null);
  };

  const pendingProject = pendingRemoveIndex !== null ? projects[pendingRemoveIndex] : null;
  const pendingLabel =
    pendingProject?.name ||
    (pendingRemoveIndex !== null ? `project #${pendingRemoveIndex + 1}` : 'this project');

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
          onRemove={() => requestRemoveProject(index)}
        />
      ))}
      {projects.length === 0 && (
        <p className="text-center py-4 text-text-dim">No projects added yet. Click "Add" to start.</p>
      )}
      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title="Remove project?"
        message={`You're about to remove ${pendingLabel}. This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={confirmRemoveProject}
        onCancel={cancelRemoveProject}
      />
    </div>
  );
}
