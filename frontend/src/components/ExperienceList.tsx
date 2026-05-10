import type { Experience } from '../types/cv';
import { ExperienceItem } from './ExperienceItem';

interface ExperienceListProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
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
      <div className="flex justify-between items-center">
        <h3 className="text-white font-medium">Experience</h3>
        <button
          type="button"
          onClick={addExperience}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
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
        <p className="text-gray-400 text-center py-4">No experience added yet. Click "Add" to start.</p>
      )}
    </div>
  );
}