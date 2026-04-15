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
      className="rounded-lg border bg-[#F8FBFF] p-4"
      style={{ borderColor: '#CED9F0' }}
    >
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Editorial Decision</h4>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = decision === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onDecisionChange(option.value)}
              className="rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-200"
              style={{
                borderColor: isSelected ? '#1D4ED8' : '#CBD5E1',
                backgroundColor: isSelected ? '#1D4ED8' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <textarea
        rows={4}
        value={decisionLetter}
        onChange={(event) => onLetterChange(event.target.value)}
        className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder-slate-400 transition-colors duration-200"
        style={{ borderColor: '#D9E0FF' }}
        placeholder="Write a clear decision letter for the author"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="group mt-3 inline-flex w-full items-center justify-center rounded-lg border px-3.5 py-2 text-sm font-semibold text-white transition-all duration-250 ease-out hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed"
        style={{
          borderColor: '#1D4ED8',
          backgroundColor: '#1D4ED8',
          opacity: isLoading ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        {isLoading ? 'Saving...' : 'Save Decision'}
      </button>
    </section>
  );
};
