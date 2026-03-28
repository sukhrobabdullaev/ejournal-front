import React from 'react';
import { CalendarDays, FileText, Mail } from 'lucide-react';
import type { ReviewAssignment, Reviewer, Submission } from '../../../lib/api';
import { getStatusChipClasses, getStatusLabel } from '../utils';
import { EditorialDecisionForm } from './EditorialDecisionForm';
import { ReviewDetailsModal } from './ReviewDetailsModal';
import { ReviewerInviteForm } from './ReviewerInviteForm';
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
  onDeskReject: () => void;
  onSendToReview: () => void;
  onMoveToDecision: () => void;
  onPublish: () => void;
  inviting: boolean;
  deciding: boolean;
  movingToDecision: boolean;
  deskRejecting: boolean;
  publishing: boolean;
}

const formatDate = (value?: string): string => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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
  onDeskReject,
  onSendToReview,
  onMoveToDecision,
  onPublish,
  inviting,
  deciding,
  movingToDecision,
  deskRejecting,
  publishing,
}) => {
  const [selectedAssignment, setSelectedAssignment] = React.useState<ReviewAssignment | null>(null);

  if (!submission) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <FileText size={42} style={{ color: '#CBD5E1' }} />
        <h3 className="mt-3 text-base font-semibold text-[#0B1C4D]">Submission details</h3>
        <p className="mt-1 text-sm text-slate-600">Select a submission from the list to review details.</p>
      </div>
    );
  }

  const deskRejectReason = submission.desk_reject_reason || submission.reason || '';
  const reviewAssignments = submission.review_assignments || [];

  return (
    <div className="max-h-[calc(100vh-220px)] space-y-7 overflow-y-auto p-8 lg:p-9">
      <section className="rounded-xl border bg-white p-8 shadow-[0_6px_16px_rgba(15,23,42,0.06)]" style={{ borderColor: '#D8E4F6' }}>
        <h3 className="pr-2 text-xl font-semibold leading-snug text-[#0B1C4D]">
          {submission.title || 'Untitled Submission'}
        </h3>

        <div className="mt-5 flex flex-wrap items-center gap-3.5">
          <span className={getStatusChipClasses(submission.status)}>{getStatusLabel(submission.status)}</span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm leading-none text-slate-600" style={{ borderColor: '#CBD5E1' }}>
            <CalendarDays size={12} />
            {formatDate(submission.created_at)}
          </span>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.05)]" style={{ borderColor: '#D8E4F6' }}>
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Abstract</h4>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {submission.abstract || 'No abstract provided.'}
        </p>

        {submission.keywords && submission.keywords.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3.5">
            {submission.keywords.map((keyword, index) => (
              <span
                key={`${keyword}-${index}`}
                className="inline-flex items-center rounded-full border bg-[#F8FBFF] px-4 py-2 text-sm font-medium leading-none text-[#0B1C4D]"
                style={{ borderColor: '#D8E4F6' }}
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.05)]" style={{ borderColor: '#D8E4F6' }}>
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Files</h4>

        {(!submission.manuscript_pdf || submission.manuscript_pdf.trim().length === 0) &&
        (!submission.supplementary_files || submission.supplementary_files.length === 0) ? (
          <p className="mt-2 text-sm text-slate-600">No files uploaded.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {submission.manuscript_pdf && submission.manuscript_pdf.trim().length > 0 && (
              <a
                href={submission.manuscript_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border bg-[#F8FBFF] p-3"
                style={{ borderColor: '#C9DCF6', transition: 'all 0.3s ease-in-out' }}
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1C4D]">
                  <FileText size={15} />
                  Manuscript PDF
                </span>
                <span className="text-xs font-semibold text-[#1D4ED8]">Open</span>
              </a>
            )}

            {submission.supplementary_files?.map((file) => (
              <a
                key={file.id}
                href={file.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border bg-white p-3"
                style={{ borderColor: '#E2E8F0', transition: 'all 0.3s ease-in-out' }}
              >
                <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <FileText size={15} />
                  {file.name}
                </span>
                <span className="text-xs font-semibold text-slate-500">Open</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.05)]" style={{ borderColor: '#D8E4F6' }}>
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Review Assignments</h4>

        {reviewAssignments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No reviewers assigned yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviewAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-xl border bg-[#F8FBFF] p-4" style={{ borderColor: '#D8E4F6' }}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(assignment)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D4ED8]"
                    style={{ transition: 'all 0.3s ease-in-out' }}
                  >
                    <Mail size={14} />
                    {assignment.reviewer_email}
                  </button>

                  <span className="rounded-full border border-[#C9DCF6] bg-white px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                    {assignment.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('en-US') : 'N/A'}
                </p>

                {assignment.status === 'invited' && (
                  <button
                    type="button"
                    onClick={() => onRemindReviewer(assignment)}
                    className="mt-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                    style={{
                      borderColor: '#93C5FD',
                      color: '#1D4ED8',
                      backgroundColor: '#EFF6FF',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    Send Reminder
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {(deskRejectReason || submission.editorial_decision || submission.decision_letter) && (
        <section className="rounded-xl border bg-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.05)]" style={{ borderColor: '#D8E4F6' }}>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Editorial Outcome</h4>

          {submission.status === 'desk_rejected' && (
            <span className="mt-2 inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
              Desk Rejected
            </span>
          )}

          {deskRejectReason && (
            <p className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <span className="font-semibold">Desk Reject Reason:</span> {deskRejectReason}
            </p>
          )}

          {submission.editorial_decision && (
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold">Decision:</span>{' '}
              <span className="capitalize">{submission.editorial_decision.replace('_', ' ')}</span>
            </p>
          )}

          {submission.decision_letter && (
            <div className="mt-2 rounded-xl border bg-[#F8FBFF] p-3" style={{ borderColor: '#D8E4F6' }}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Decision Letter</p>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{submission.decision_letter}</p>
            </div>
          )}
        </section>
      )}

      {submission.status === 'screening' && (
        <ReviewerInviteForm
          reviewers={reviewers}
          isLoadingReviewers={isLoadingReviewers}
          dueDate={inviteDueDate}
          selectedReviewerIds={selectedReviewerIds}
          alreadyInvitedEmails={reviewAssignments.map((assignment) => assignment.reviewer_email?.toLowerCase())}
          onReviewerIdsSelect={onReviewerIdsSelect}
          onDueDateChange={onInviteDueDateChange}
          onSubmit={onInviteReviewer}
          onDeskReject={onDeskReject}
          isLoading={inviting}
          deskRejecting={deskRejecting}
        />
      )}

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

      <WorkflowActions
        submission={submission}
        onStartScreening={onStartScreening}
        onSendToReview={onSendToReview}
        onMoveToDecision={onMoveToDecision}
        onPublish={onPublish}
        movingToDecision={movingToDecision}
        publishing={publishing}
      />

      <ReviewDetailsModal assignment={selectedAssignment} onClose={() => setSelectedAssignment(null)} />
    </div>
  );
};
