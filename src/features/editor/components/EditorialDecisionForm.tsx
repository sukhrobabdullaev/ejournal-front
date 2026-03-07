import React from 'react';

interface EditorialDecisionFormProps {
  decision: 'accept' | 'reject' | 'revision_required';
  decisionLetter: string;
  onDecisionChange: (decision: 'accept' | 'reject' | 'revision_required') => void;
  onLetterChange: (letter: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const EditorialDecisionForm: React.FC<EditorialDecisionFormProps> = ({
  decision,
  decisionLetter,
  onDecisionChange,
  onLetterChange,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">Editorial Decision</p>
      <div className="flex gap-3 text-sm text-gray-700">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            value="accept"
            checked={decision === 'accept'}
            onChange={() => onDecisionChange('accept')}
          />
          Accept
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            value="revision_required"
            checked={decision === 'revision_required'}
            onChange={() => onDecisionChange('revision_required')}
          />
          Revision Required
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            value="reject"
            checked={decision === 'reject'}
            onChange={() => onDecisionChange('reject')}
          />
          Reject
        </label>
      </div>
      <textarea
        rows={4}
        value={decisionLetter}
        onChange={(e) => onLetterChange(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder="Decision letter to the author..."
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isLoading ? 'Saving Decision...' : 'Save Decision'}
      </button>
    </div>
  );
};
