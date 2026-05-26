import { useState } from 'react';
import type { Project } from '../types/cv';
import { generateId } from '../utils/id';
import { ConfirmDialog } from './ConfirmDialog';
import { ProjectItem } from './ProjectItem';

interface ProjectListProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
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
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addProject}
          aria-label="Add project"
          title="Add project"
          className="h-10 w-10 rounded-xl border border-border-subtle bg-bg-surface text-text-base transition-all hover:bg-bg-muted hover:shadow-sm active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
          </svg>
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
        <p className="py-3 text-center text-sm text-text-dim">No projects added yet. Click + to start.</p>
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
