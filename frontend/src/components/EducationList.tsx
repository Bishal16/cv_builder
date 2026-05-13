import type { Education } from '../types/cv';
import { EducationItem } from './EducationItem';

interface EducationListProps {
  education: Education[];
  onChange: (educations: Education[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function EducationList({ education, onChange }: EducationListProps) {
  const addEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      graduationYear: '',
    };
    onChange([...education, newEducation]);
  };

  const updateEducation = (index: number, updated: Education) => {
    const updatedList = [...education];
    updatedList[index] = updated;
    onChange(updatedList);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addEducation}
          className="btn-primary !py-2 !px-4 !text-sm"
        >
          + Add
        </button>
      </div>
      {education.map((edu, index) => (
        <EducationItem
          key={edu.id}
          education={edu}
          onChange={(updated) => updateEducation(index, updated)}
          onRemove={() => removeEducation(index)}
        />
      ))}
      {education.length === 0 && (
        <p className="text-center py-4 text-text-dim">No education added yet. Click "Add" to start.</p>
      )}
    </div>
  );
}