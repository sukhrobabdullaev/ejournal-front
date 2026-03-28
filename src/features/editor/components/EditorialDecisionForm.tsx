import React from 'react';

interface EditorialDecisionFormProps {
  decision: 'accept' | 'reject' | 'revision_required';
  decisionLetter: string;
  onDecisionChange: (decision: 'accept' | 'reject' | 'revision_required') => void;
  onLetterChange: (letter: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const options: Array<{ value: 'accept' | 'reject' | 'revision_required'; label: string }> = [
  { value: 'accept', label: 'Accept' },
  { value: 'revision_required', label: 'Revision Required' },
  { value: 'reject', label: 'Reject' },
];

export const EditorialDecisionForm: React.FC<EditorialDecisionFormProps> = ({
  decision,
  decisionLetter,
  onDecisionChange,
  onLetterChange,
  onSubmit,
  isLoading,
}) => {
  return (
    <section
      className="rounded-xl border bg-[#F8FBFF] p-4"
      style={{ borderColor: '#D8E4F6' }}
    >
      <h4 className="text-sm font-semibold text-[#0B1C4D]">Editorial Decision</h4>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = decision === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onDecisionChange(option.value)}
              className="rounded-lg border px-3 py-2 text-sm font-medium"
              style={{
                borderColor: isSelected ? '#1D4ED8' : '#C9DCF6',
                backgroundColor: isSelected ? '#EAF3FF' : '#FFFFFF',
                color: isSelected ? '#0B1C4D' : '#334155',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <textarea
        rows={5}
        value={decisionLetter}
        onChange={(event) => onLetterChange(event.target.value)}
        className="mt-3 w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-700 outline-none"
        style={{ borderColor: '#C9DCF6', transition: 'all 0.3s ease-in-out' }}
        placeholder="Write a clear decision letter for the author"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold text-white"
        style={{
          borderColor: '#1D4ED8',
          backgroundColor: '#1D4ED8',
          transition: 'all 0.3s ease-in-out',
          opacity: isLoading ? 0.65 : 1,
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Saving Decision...' : 'Save Decision'}
      </button>
    </section>
  );
};
