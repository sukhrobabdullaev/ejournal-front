import React from 'react';
import { FileText } from 'lucide-react';
import type { Submission, ReviewAssignment, Reviewer } from '../../../lib/api';
import { getStatusLabel, getStatusChipClasses } from '../utils';
import { ReviewerInviteForm } from './ReviewerInviteForm';
import { EditorialDecisionForm } from './EditorialDecisionForm';
import { WorkflowActions } from './WorkflowActions';

interface SubmissionDetailsProps {
  submission: Submission | null;
  reviewers: Reviewer[];
  isLoadingReviewers: boolean;
  inviteDueDate: string;
  selectedReviewerIds: number[];
  decision: 'accept' | 'reject' | 'revision_required';
  decisionLetter: string;
  onReviewerIdsSelect: (reviewerIds: number[]) => void;
  onInviteDueDateChange: (date: string) => void;
  onInviteReviewer: () => void;
  onRemindReviewer: (assignment: ReviewAssignment) => void;
  onDecisionChange: (decision: 'accept' | 'reject' | 'revision_required') => void;
  onDecisionLetterChange: (letter: string) => void;
  onMakeDecision: () => void;
  onStartScreening: () => void;
  onSendToReview: () => void;
  onMoveToDecision: () => void;
  onPublish: () => void;
  inviting: boolean;
  deciding: boolean;
  movingToDecision: boolean;
  publishing: boolean;
}

export const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({
  submission,
  reviewers,
  isLoadingReviewers,
  inviteDueDate,
  selectedReviewerIds,
  decision,
  decisionLetter,
  onReviewerIdsSelect,
  onInviteDueDateChange,
  onInviteReviewer,
  onRemindReviewer,
  onDecisionChange,
  onDecisionLetterChange,
  onMakeDecision,
  onStartScreening,
  onSendToReview,
  onMoveToDecision,
  onPublish,
  inviting,
  deciding,
  movingToDecision,
  publishing,
}) => {
  if (!submission) {
    return (
      <div className="p-8 text-center text-gray-500">
        <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p>Select a submission to view details</p>
      </div>
    );
  }

  return (
    <div className="max-h-[600px] space-y-4 overflow-y-auto p-4">
      {/* Title + meta */}
      <div>
        <h3 className="mb-1 text-lg font-semibold text-gray-900">
          {submission.title || 'Untitled Submission'}
        </h3>
        <p className="mb-1 text-xs text-gray-500">
          ID:{' '}
          <span className="font-mono">
            {submission.id.toString().substring(0, 8).toUpperCase()}
          </span>
        </p>
        <span className={getStatusChipClasses(submission.status)}>
          {getStatusLabel(submission.status)}
        </span>
      </div>

      {/* Abstract */}
      <div>
        <h4 className="mb-1 text-sm font-semibold text-gray-700">Abstract</h4>
        <p className="text-sm leading-relaxed text-gray-600">
          {submission.abstract || 'No abstract provided.'}
        </p>
      </div>

      {/* Keywords */}
      {submission.keywords && submission.keywords.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-700">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {submission.keywords.map((keyword, idx) => (
              <span key={idx} className="bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Files</h4>
        {(!submission.manuscript_pdf || submission.manuscript_pdf.trim().length === 0) &&
        (!submission.supplementary_files || submission.supplementary_files.length === 0) ? (
          <p className="text-sm text-gray-500">No files uploaded</p>
        ) : (
          <div className="space-y-2">
            {submission.manuscript_pdf && submission.manuscript_pdf.trim().length > 0 && (
              <a
                href={submission.manuscript_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-blue-200 bg-blue-50 p-2 text-sm transition-colors hover:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Manuscript PDF</span>
                </div>
                <span className="text-xs font-semibold text-blue-700 uppercase">View</span>
              </a>
            )}

            {submission.supplementary_files?.map((file) => (
              <a
                key={file.id}
                href={file.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-gray-200 bg-gray-50 p-2 text-sm transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{file.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700 uppercase">Open</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Review assignments */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Review Assignments</h4>
        {(!submission.review_assignments || submission.review_assignments.length === 0) && (
          <p className="text-sm text-gray-500">No reviewers assigned yet.</p>
        )}
        {submission.review_assignments && submission.review_assignments.length > 0 && (
          <div className="space-y-2">
            {submission.review_assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between border border-gray-200 bg-gray-50 p-2 text-xs"
              >
                <div>
                  <p className="font-medium text-gray-800">{assignment.reviewer_email}</p>
                  <p className="text-gray-500 capitalize">
                    Status: {assignment.status.replace('_', ' ')}
                  </p>
                  {assignment.due_date && (
                    <p className="text-gray-500">
                      Due: {new Date(assignment.due_date).toLocaleDateString('en-US')}
                    </p>
                  )}
                </div>
                {assignment.status === 'invited' && (
                  <button
                    type="button"
                    onClick={() => onRemindReviewer(assignment)}
                    className="rounded bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    Send Reminder
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewer invite form */}
      {['screening', 'under_review'].includes(submission.status) && (
        <ReviewerInviteForm
          reviewers={reviewers}
          isLoadingReviewers={isLoadingReviewers}
          dueDate={inviteDueDate}
          selectedReviewerIds={selectedReviewerIds}
          alreadyInvitedEmails={
            submission.review_assignments?.map((a) => a.reviewer_email?.toLowerCase()) || []
          }
          onReviewerIdsSelect={onReviewerIdsSelect}
          onDueDateChange={onInviteDueDateChange}
          onSubmit={onInviteReviewer}
          isLoading={inviting}
        />
      )}

      {/* Editorial decision form */}
      {submission.status === 'decision_pending' && (
        <EditorialDecisionForm
          decision={decision}
          decisionLetter={decisionLetter}
          onDecisionChange={onDecisionChange}
          onLetterChange={onDecisionLetterChange}
          onSubmit={onMakeDecision}
          isLoading={deciding}
        />
      )}

      {/* Workflow actions */}
      <WorkflowActions
        submission={submission}
        onStartScreening={onStartScreening}
        onSendToReview={onSendToReview}
        onMoveToDecision={onMoveToDecision}
        onPublish={onPublish}
        movingToDecision={movingToDecision}
        publishing={publishing}
      />
    </div>
  );
};
