import React from 'react';
import { CheckCircle2, Eye, Fingerprint, Send } from 'lucide-react';
import type { Submission } from '../../../lib/api';

interface WorkflowActionsProps {
  submission: Submission;
  onStartScreening: () => void;
  onSendToReview: () => void;
  onMoveToDecision: () => void;
  onPublish: () => void;
  onGenerateDoi: () => void;
  movingToDecision: boolean;
  publishing: boolean;
  generatingDoi: boolean;
}

const primaryButtonStyle: React.CSSProperties = {
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: '#1D4ED8',
  color: '#FFFFFF',
  borderColor: '#1D4ED8',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '0.25px',
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
    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3.5 py-2 transition-all duration-250 ease-out hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed"
    style={{
      ...primaryButtonStyle,
      ...style,
      opacity: disabled ? 0.6 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
      }
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
    }}
  >
    {icon}
    <span className="leading-tight">{label}</span>
  </button>
);

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  submission,
  onStartScreening,
  onSendToReview,
  onMoveToDecision,
  onPublish,
  onGenerateDoi,
  movingToDecision,
  publishing,
  generatingDoi,
}) => {
  return (
    <div className="space-y-2 border-t pt-3" style={{ borderColor: '#E2E8F0' }}>
      {submission.status === 'submitted' && (
        <WorkflowButton
          onClick={onStartScreening}
          icon={<Eye size={15} />}
          label="Move to Screening"
        />
      )}

      {submission.status === 'screening' && (
        <div className="space-y-2">
          {submission.review_assignments && submission.review_assignments.length > 0 && (
            <WorkflowButton
              onClick={onSendToReview}
              icon={<Send size={15} />}
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
          icon={<CheckCircle2 size={15} />}
          label={movingToDecision ? 'Moving to Decision...' : 'Move to Decision'}
          style={{ backgroundColor: '#4338CA', borderColor: '#4338CA' }}
        />
      )}

      {submission.status === 'accepted' && (
        <div className="space-y-2">
          <WorkflowButton
            onClick={onPublish}
            disabled={publishing}
            icon={<CheckCircle2 size={15} />}
            label={publishing ? 'Publishing...' : 'Publish Submission'}
            style={{ backgroundColor: '#15803D', borderColor: '#15803D' }}
          />
          <WorkflowButton
            onClick={onGenerateDoi}
            disabled={generatingDoi}
            icon={<Fingerprint size={15} />}
            label={generatingDoi ? 'Generating DOI...' : submission.doi ? 'Refresh DOI' : 'Generate DOI'}
            style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
          />
        </div>
      )}

      {submission.status === 'published' && (
        <WorkflowButton
          onClick={onGenerateDoi}
          disabled={generatingDoi}
          icon={<Fingerprint size={15} />}
          label={generatingDoi ? 'Generating DOI...' : submission.doi ? 'Refresh DOI' : 'Generate DOI'}
          style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
        />
      )}
    </div>
  );
};
