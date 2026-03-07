import React from 'react';
import { Eye, Send, CheckCircle } from 'lucide-react';
import type { Submission } from '../../../lib/api';

interface WorkflowActionsProps {
  submission: Submission;
  onStartScreening: () => void;
  onSendToReview: () => void;
  onMoveToDecision: () => void;
  onPublish: () => void;
  movingToDecision: boolean;
  publishing: boolean;
}

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  submission,
  onStartScreening,
  onSendToReview,
  onMoveToDecision,
  onPublish,
  movingToDecision,
  publishing,
}) => {
  return (
    <div className="space-y-3 border-t border-gray-200 pt-4">
      {submission.status === 'submitted' && (
        <button
          type="button"
          onClick={onStartScreening}
          className="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Eye className="h-4 w-4" />
          Move to Screening
        </button>
      )}

      {submission.status === 'screening' &&
        submission.review_assignments &&
        submission.review_assignments.length > 0 && (
          <button
            type="button"
            onClick={onSendToReview}
            className="flex w-full items-center justify-center gap-2 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
            Send to Review
          </button>
        )}

      {submission.status === 'under_review' && (
        <button
          type="button"
          onClick={onMoveToDecision}
          disabled={movingToDecision}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            backgroundColor: movingToDecision ? '#9ca3af' : '#4f46e5',
            color: 'white',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: movingToDecision ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!movingToDecision) {
              e.currentTarget.style.backgroundColor = '#4338ca';
            }
          }}
          onMouseLeave={(e) => {
            if (!movingToDecision) {
              e.currentTarget.style.backgroundColor = '#4f46e5';
            }
          }}
        >
          {movingToDecision ? 'Moving to Decision...' : 'Move to Decision'}
        </button>
      )}

      {submission.status === 'accepted' && (
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="flex w-full items-center justify-center gap-2 bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <CheckCircle className="h-4 w-4" />
          {publishing ? 'Publishing...' : 'Publish Submission'}
        </button>
      )}
    </div>
  );
};
