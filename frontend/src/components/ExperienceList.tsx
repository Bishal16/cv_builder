import type { Experience } from '../types/cv';
import { ExperienceItem } from './ExperienceItem';

interface ExperienceListProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function ExperienceList({ experiences, onChange }: ExperienceListProps) {
  const addExperience = () => {
    const newExperience: Experience = {
      id: generateId(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    onChange([...experiences, newExperience]);
  };

  const updateExperience = (index: number, updated: Experience) => {
    const updatedList = [...experiences];
    updatedList[index] = updated;
    onChange(updatedList);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addExperience}
          className="btn-primary !py-2 !px-4 !text-sm"
        >
          + Add
        </button>
      </div>
      {experiences.map((exp, index) => (
        <ExperienceItem
          key={exp.id}
          experience={exp}
          onChange={(updated) => updateExperience(index, updated)}
          onRemove={() => removeExperience(index)}
        />
      ))}
      {experiences.length === 0 && (
        <p className="text-center py-4 text-text-dim">No experience added yet. Click "Add" to start.</p>
      )}
    </div>
  );
}