import React from 'react';
import { CheckCircle2, Eye, Send } from 'lucide-react';
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

const primaryButtonStyle: React.CSSProperties = {
  transition: 'all 0.3s ease-in-out',
  backgroundColor: '#1D4ED8',
  color: '#FFFFFF',
  borderColor: '#1D4ED8',
};

const WorkflowButton = ({
  onClick,
  disabled,
  icon,
  label,
  style,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  style?: React.CSSProperties;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
    style={{
      ...primaryButtonStyle,
      ...style,
      opacity: disabled ? 0.65 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
  >
    {icon}
    {label}
  </button>
);

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
    <div className="space-y-3 border-t pt-4" style={{ borderColor: '#E2E8F0' }}>
      {submission.status === 'submitted' && (
        <WorkflowButton
          onClick={onStartScreening}
          icon={<Eye size={16} />}
          label="Move to Screening"
        />
      )}

      {submission.status === 'screening' && (
        <div className="grid grid-cols-1 gap-2">
          {submission.review_assignments && submission.review_assignments.length > 0 && (
            <WorkflowButton
              onClick={onSendToReview}
              icon={<Send size={16} />}
              label="Send to Review"
              style={{ backgroundColor: '#0F766E', borderColor: '#0F766E' }}
            />
          )}
        </div>
      )}

      {submission.status === 'under_review' && (
        <WorkflowButton
          onClick={onMoveToDecision}
          disabled={movingToDecision}
          icon={<CheckCircle2 size={16} />}
          label={movingToDecision ? 'Moving to Decision...' : 'Move to Decision'}
          style={{ backgroundColor: '#4338CA', borderColor: '#4338CA' }}
        />
      )}

      {submission.status === 'accepted' && (
        <WorkflowButton
          onClick={onPublish}
          disabled={publishing}
          icon={<CheckCircle2 size={16} />}
          label={publishing ? 'Publishing...' : 'Publish Submission'}
          style={{ backgroundColor: '#15803D', borderColor: '#15803D' }}
        />
      )}
    </div>
  );
};
