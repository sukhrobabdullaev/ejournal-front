import React from 'react';
import { Send } from 'lucide-react';

interface ReviewerInviteFormProps {
  email: string;
  dueDate: string;
  onEmailChange: (email: string) => void;
  onDueDateChange: (date: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ReviewerInviteForm: React.FC<ReviewerInviteFormProps> = ({
  email,
  dueDate,
  onEmailChange,
  onDueDateChange,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="space-y-2 border-t border-gray-200 pt-3">
      <h4 className="text-sm font-semibold text-gray-700">Invite Reviewer (by email)</h4>
      <div className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="reviewer@example.com"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !email}
          className="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Send className="h-4 w-4" />
          {isLoading ? 'Inviting...' : 'Invite Reviewer'}
        </button>
      </div>
    </div>
  );
};
