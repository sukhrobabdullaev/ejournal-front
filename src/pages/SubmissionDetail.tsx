import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Submission } from '../lib/api';
import { deleteSubmission, getSubmissionById, submitSubmission } from '../lib/queries-api';
import { FileText, ArrowLeft, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dateFormat from 'dateformat';

const STATUS_CHIP_CLASS_MAP: Partial<Record<Submission['status'], string>> = {
  draft:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300',
  submitted:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-300',
  under_review:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-300',
  screening:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-300',
  decision_pending:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-300',
  revision_required:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-300',
  resubmitted:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-300',
  accepted:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-300',
  rejected:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-300',
  desk_rejected:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-300',
  published:
    'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-300',
};

const DEFAULT_STATUS_CHIP_CLASS =
  'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300';

const formatDisplayDate = (value?: string | null): string => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return dateFormat(parsed, 'mmmm d, yyyy');
};

const hasNonEmptyUrl = (value?: string | null): boolean => Boolean(value && value.trim().length > 0);

type SubmitResponse = Awaited<ReturnType<typeof submitSubmission>>;
type DeleteResponse = Awaited<ReturnType<typeof deleteSubmission>>;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const maybeError = error as { detail?: unknown; message?: unknown };
    if (typeof maybeError.detail === 'string') return maybeError.detail;
    if (typeof maybeError.message === 'string') return maybeError.message;
  }
  return fallback;
};

type SubmissionHeaderProps = {
  submission: Submission;
  statusClass: string;
  statusLabel: string;
  onBack: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
};

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-gray-600">Loading submission...</p>
      </div>
    </div>
  );
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <p className="mb-4 text-sm text-red-600">Submission not found or access denied</p>
        <button
          onClick={onBack}
          className="bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function SubmissionHeader({
  submission,
  statusClass,
  statusLabel,
  onBack,
  onSubmit,
  onDelete,
  isSubmitting,
  isDeleting,
}: SubmissionHeaderProps) {
  return (
    <div className="border-b border-gray-300 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{submission.title || 'Untitled Submission'}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Submission ID:{' '}
              <span className="font-mono">{submission.id.toString().substring(0, 8).toUpperCase()}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={statusClass}>{statusLabel}</span>
            {submission.status === 'draft' && (
              <>
                <button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Manuscript'}
                </button>
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isDeleting ? 'Deleting...' : 'Delete draft'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManuscriptDetailsSection({
  submission,
  statusLabel,
}: {
  submission: Submission;
  statusLabel: string;
}) {
  return (
    <div className="mb-6 border border-gray-300 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Manuscript Details</h2>

      <div className="mb-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div>
          <span className="text-gray-600">Status</span>
          <p className="mt-1 font-medium text-gray-900">{statusLabel}</p>
        </div>
        <div>
          <span className="text-gray-600">Submitted</span>
          <p className="mt-1 font-medium text-gray-900">{formatDisplayDate(submission.created_at)}</p>
        </div>
        <div>
          <span className="text-gray-600">Topic Area</span>
          <p className="mt-1 font-medium text-gray-900">{submission.topic_area?.name || 'Not specified'}</p>
        </div>
      </div>

      {submission.keywords && submission.keywords.length > 0 && (
        <div>
          <span className="text-sm text-gray-600">Keywords</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {submission.keywords.map((keyword, index) => (
              <span
                key={index}
                className="border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AbstractSection({ submission }: { submission: Submission }) {
  return (
    <div className="mb-6 border border-gray-300 bg-white p-6">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Abstract</h2>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
        {submission.abstract || 'No abstract provided.'}
      </p>
    </div>
  );
}

function FilesSection({
  submission,
  hasManuscriptPdf,
  hasSupplementaryFiles,
}: {
  submission: Submission;
  hasManuscriptPdf: boolean;
  hasSupplementaryFiles: boolean;
}) {
  const hasAnyFiles = hasManuscriptPdf || hasSupplementaryFiles;

  return (
    <div className="border border-gray-300 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Files</h2>

      {!hasAnyFiles ? (
        <p className="text-sm text-gray-600">No files uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {hasManuscriptPdf && (
            <a
              href={submission.manuscript_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-blue-200 bg-blue-50 p-3 transition-colors hover:bg-blue-100"
            >
              <div className="flex items-center">
                <FileText size={20} className="mr-3 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Manuscript PDF</p>
                  <p className="text-xs text-blue-800">Opens in a new tab from the journal server.</p>
                </div>
              </div>
              <span className="text-xs font-medium tracking-wide text-blue-700 uppercase">View PDF</span>
            </a>
          )}

          {hasSupplementaryFiles &&
            submission.supplementary_files &&
            submission.supplementary_files.map((file) => (
              <a
                key={file.id}
                href={file.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <FileText size={18} className="mr-3 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">Uploaded {formatDisplayDate(file.created_at)}</p>
                  </div>
                </div>
                <span className="text-xs font-medium tracking-wide text-gray-700 uppercase">Open</span>
              </a>
            ))}
        </div>
      )}
    </div>
  );
}

function EditorialOutcomeSection({
  submission,
  deskRejectReason,
}: {
  submission: Submission;
  deskRejectReason: string;
}) {
  if (!(deskRejectReason || submission.editorial_decision || submission.decision_letter)) {
    return null;
  }

  return (
    <div className="mt-6 border border-gray-300 bg-white p-6">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Editorial Outcome</h2>

      {submission.status === 'desk_rejected' && (
        <p className="mb-2 text-sm font-medium text-red-700">
          Your manuscript was <span className="font-semibold">desk rejected</span>.
        </p>
      )}

      {deskRejectReason && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <span className="font-semibold">Reason:</span> <span>{deskRejectReason}</span>
        </div>
      )}

      {submission.editorial_decision && (
        <p className="mt-3 text-sm text-gray-700">
          <span className="font-semibold">Decision:</span>{' '}
          <span className="capitalize">{submission.editorial_decision.replace('_', ' ')}</span>
        </p>
      )}

      {submission.decision_letter && (
        <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">Decision Letter</p>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{submission.decision_letter}</p>
        </div>
      )}
    </div>
  );
}

export function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: submission,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => getSubmissionById(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => submitSubmission(submission!.id.toString()),
    onSuccess: ({ error }: SubmitResponse) => {
      if (error) {
        const message = getErrorMessage(error, 'Failed to submit manuscript');
        console.error('Submit error:', message);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
    },
    onError: (err: unknown) => console.error('Error submitting manuscript:', err),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSubmission(submission!.id.toString()),
    onSuccess: ({ error }: DeleteResponse) => {
      if (error) {
        const msg = getErrorMessage(error, 'Only drafts can be deleted.');
        setDeleteError(msg);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      navigate('/submit');
    },
    onError: (err: unknown) => setDeleteError(getErrorMessage(err, 'Failed to delete draft')),
  });

  if (loading) {
    return <LoadingState />;
  }

  if (isError || !submission) {
    return <NotFoundState onBack={() => navigate('/dashboard')} />;
  }

  const currentSubmission = submission;

  const statusLabel = getStatusLabel(currentSubmission.status);
  const statusClass = getStatusChipClasses(currentSubmission.status);
  const deskRejectReason = currentSubmission.desk_reject_reason || currentSubmission.reason || '';
  const hasManuscriptPdf = hasNonEmptyUrl(currentSubmission.manuscript_pdf);
  const hasSupplementaryFiles = Boolean(currentSubmission.supplementary_files?.length);
  const handleDeleteDraft = () => {
    if (window.confirm('Delete this draft? This cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SubmissionHeader
        submission={currentSubmission}
        statusClass={statusClass}
        statusLabel={statusLabel}
        onBack={() => navigate('/dashboard')}
        onSubmit={() => submitMutation.mutate()}
        onDelete={handleDeleteDraft}
        isSubmitting={submitMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {deleteError && (
          <div className="mb-4 border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {deleteError}
            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="ml-2 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}
        <ManuscriptDetailsSection submission={currentSubmission} statusLabel={statusLabel} />
        <AbstractSection submission={currentSubmission} />
        <FilesSection
          submission={currentSubmission}
          hasManuscriptPdf={hasManuscriptPdf}
          hasSupplementaryFiles={hasSupplementaryFiles}
        />
        <EditorialOutcomeSection
          submission={currentSubmission}
          deskRejectReason={deskRejectReason}
        />
      </div>
    </div>
  );
}

// Shared with dashboard style

const getStatusLabel = (status: Submission['status']): string =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getStatusChipClasses = (status: Submission['status']): string => {
  return STATUS_CHIP_CLASS_MAP[status] || DEFAULT_STATUS_CHIP_CLASS;
};
