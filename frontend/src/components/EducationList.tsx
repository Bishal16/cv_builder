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
      <div className="flex justify-between items-center">
        <h3 className="text-white font-medium">Education</h3>
        <button
          type="button"
          onClick={addEducation}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
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
        <p className="text-gray-400 text-center py-4">No education added yet. Click "Add" to start.</p>
      )}
    </div>
  );
}