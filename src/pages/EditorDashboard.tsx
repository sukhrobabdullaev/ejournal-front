import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, ArrowLeft, CheckCircle, Eye, FileText, Users } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReviewAssignment, Submission } from '../lib/api';
import {
  deskReject,
  getAllReviewers,
  getAllSubmissions,
  getApprovedRolesFromUser,
  getCurrentUser,
  getSubmissionByIdForEditor,
  generateSubmissionDoi,
  inviteReviewer,
  makeEditorialDecision,
  moveToDecision,
  publishSubmission,
  remindReviewer,
  sendToReview,
  startScreening,
} from '../lib/queries-api';
import {
  EditorTab,
  MakeJournalPanel,
  SubmissionDetails,
  SubmissionsList,
} from '../features/editor/components';
import { ApiError } from '../features/editor/utils';

type TabType = 'new' | 'screening' | 'review' | 'decisions' | 'journal';
type ApiMutationResult<T> = { data: T | null; error: any };

const sectionCardStyle: React.CSSProperties = {
  border: '1px solid #CED9F0',
  borderRadius: '12px',
  background: '#FFFFFF',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
};

const tabHeaderLabel: Record<TabType, string> = {
  new: 'New Submissions',
  screening: 'Screening',
  review: 'Under Review',
  decisions: 'Decisions',
  journal: 'Make Journal',
};

const DECISION_STATUSES: Submission['status'][] = [
  'decision_pending',
  'revision_required',
  'accepted',
  'rejected',
  'desk_rejected',
  'published',
];

const getTabFromStatus = (status?: Submission['status']): TabType => {
  if (!status) {
    return 'new';
  }

  if (status === 'submitted') {
    return 'new';
  }

  if (status === 'screening' || status === 'resubmitted') {
    return 'screening';
  }

  if (status === 'under_review') {
    return 'review';
  }

  if (DECISION_STATUSES.includes(status)) {
    return 'decisions';
  }

  return 'new';
};

const extractApiErrorMessage = (error: any, fallback: string): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error?.detail === 'string') {
    return error.detail;
  }

  if (Array.isArray(error?.detail) && error.detail.length > 0) {
    return String(error.detail[0]);
  }

  if (typeof error?.message === 'string') {
    return error.message;
  }

  return fallback;
};

const unwrapApiMutationResult = <T,>(
  result: ApiMutationResult<T>,
  fallbackMessage: string
): T => {
  if (result.error || !result.data) {
    throw new Error(extractApiErrorMessage(result.error, fallbackMessage));
  }

  return result.data;
};

export function EditorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [inviteDueDate, setInviteDueDate] = useState('');
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<number[]>([]);
  const [decision, setDecision] = useState<'accept' | 'reject' | 'revision_required'>('accept');
  const [decisionLetter, setDecisionLetter] = useState('');

  const [showSendToReviewModal, setShowSendToReviewModal] = useState(false);
  const [showDeskRejectModal, setShowDeskRejectModal] = useState(false);
  const [deskRejectReason, setDeskRejectReason] = useState('');

  const { data: currentUser, isLoading: roleLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getCurrentUser,
    retry: false,
  });

  const approvedRoles = useMemo(
    () => getApprovedRolesFromUser(currentUser || null),
    [currentUser]
  );
  const authorized = approvedRoles.includes('editor') || approvedRoles.includes('admin');

  const { data: submissionData, isLoading: submissionsLoading } = useQuery<
    Submission[],
    Error,
    Submission[],
    string[]
  >({
    queryKey: ['editor-submissions'],
    queryFn: () => getAllSubmissions(),
    enabled: authorized,
  });

  const allSubmissions = submissionData ?? [];

  const { data: reviewers = [], isLoading: isLoadingReviewers } = useQuery({
    queryKey: ['reviewers'],
    queryFn: getAllReviewers,
    enabled: authorized,
  });

  const tabCounts = useMemo(
    () => ({
      new: allSubmissions.filter((submission) => submission.status === 'submitted').length,
      screening: allSubmissions.filter((submission) =>
        ['screening', 'resubmitted'].includes(submission.status)
      ).length,
      review: allSubmissions.filter((submission) => submission.status === 'under_review').length,
      decisions: allSubmissions.filter((submission) => DECISION_STATUSES.includes(submission.status)).length,
    }),
    [allSubmissions]
  );

  const submissions = useMemo(() => {
    const filtered = allSubmissions.filter((submission) => {
      switch (activeTab) {
        case 'new':
          return submission.status === 'submitted';
        case 'screening':
          return ['screening', 'resubmitted'].includes(submission.status);
        case 'review':
          return submission.status === 'under_review';
        case 'decisions':
          return DECISION_STATUSES.includes(submission.status);
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [activeTab, allSubmissions]);

  const loadSubmissionDetails = async (id: number) => {
    try {
      setError(null);
      const result = await getSubmissionByIdForEditor(id.toString());

      if (!result) {
        setSelectedSubmission(null);
        setError('Submission not found or access denied.');
        return;
      }

      setSelectedSubmission(result);
    } catch (requestError) {
      setError((requestError as Error).message || 'Failed to load submission details.');
    }
  };

  const refreshEditorSubmissions = async () => {
    await queryClient.invalidateQueries({ queryKey: ['editor-submissions'] });
    await queryClient.refetchQueries({ queryKey: ['editor-submissions'], type: 'active' });
  };

  const refreshSelectedSubmission = async (
    submissionId: number | null | undefined,
    fallbackStatus?: Submission['status']
  ) => {
    await refreshEditorSubmissions();

    if (!submissionId) {
      if (fallbackStatus) {
        setActiveTab(getTabFromStatus(fallbackStatus));
      }
      return;
    }

    const refreshedSubmission = await getSubmissionByIdForEditor(submissionId.toString());
    if (refreshedSubmission) {
      setSelectedSubmission(refreshedSubmission);
      setActiveTab(getTabFromStatus(refreshedSubmission.status));
      return;
    }

    setSelectedSubmission(null);
    if (fallbackStatus) {
      setActiveTab(getTabFromStatus(fallbackStatus));
    }
  };

  const screeningMutation = useMutation({
    mutationFn: async () => {
      const result = await startScreening(selectedSubmission!.id.toString());
      return unwrapApiMutationResult(result, 'Failed to move submission to screening.');
    },
    onSuccess: async (updatedSubmission) => {
      setSuccess('Submission moved to Screening.');
      await refreshSelectedSubmission(updatedSubmission.id, updatedSubmission.status);
    },
    onError: (mutationError) => {
      setError((mutationError as Error).message || 'Failed to move submission to screening.');
    },
  });

  const deskRejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const result = await deskReject(selectedSubmission!.id.toString(), reason);
      return unwrapApiMutationResult(result, 'Failed to desk reject submission.');
    },
    onSuccess: async (updatedSubmission) => {
      setSuccess('Submission desk rejected.');
      setShowDeskRejectModal(false);
      setDeskRejectReason('');
      await refreshSelectedSubmission(updatedSubmission.id, updatedSubmission.status);
    },
    onError: (mutationError) => {
      const apiError = mutationError as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to desk reject submission.');
    },
  });

  const sendToReviewMutation = useMutation({
    mutationFn: async () => {
      const result = await sendToReview(selectedSubmission!.id.toString());
      return unwrapApiMutationResult(
        result,
        'Failed to move submission to review. Invite at least one reviewer first.'
      );
    },
    onSuccess: async (updatedSubmission) => {
      setSuccess('Submission moved to Under Review.');
      await refreshSelectedSubmission(updatedSubmission.id, updatedSubmission.status);
    },
    onError: (mutationError) => {
      const apiError = mutationError as ApiError;
      setError(
        apiError.detail ||
          apiError.message ||
          'Failed to move submission to review. Invite at least one reviewer first.'
      );
    },
  });

  const inviteReviewerMutation = useMutation({
    mutationFn: async (params: { submissionId: string; reviewerIds: number[]; dueDate: string }) => {
      const { submissionId, reviewerIds, dueDate } = params;

      const results = await Promise.allSettled(
        reviewerIds.map(async (reviewerId) => {
          const response = await inviteReviewer(submissionId, {
            reviewer_user_id: reviewerId,
            due_date: dueDate,
          });

          if (response.error) {
            throw response.error;
          }

          return response.data;
        })
      );

      const successes = results.filter((result) => result.status === 'fulfilled').length;
      const failures = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];

      return {
        successes,
        failures,
        reviewerIds,
        failureReasons: failures.map((failure) => failure.reason),
      };
    },
    onSuccess: async (data) => {
      const { successes, failures, reviewerIds, failureReasons } = data;

      if (failures.length > 0) {
        const alreadyInvitedErrors = failureReasons.filter((failureReason: any) => {
          return (
            failureReason?.detail?.includes('already invited') ||
            failureReason?.message?.includes('already invited')
          );
        });

        if (alreadyInvitedErrors.length === failures.length) {
          if (failures.length === reviewerIds.length) {
            setError('All selected reviewers have already been invited for this submission.');
          } else {
            setSuccess(
              `${successes} reviewer${successes > 1 ? 's' : ''} invited. ` +
                `${failures.length} reviewer${failures.length > 1 ? 's were' : ' was'} already invited.`
            );
          }
        } else if (successes > 0) {
          setError(
            `${successes} reviewer${successes > 1 ? 's were' : ' was'} invited, ` +
              `but ${failures.length} invitation${failures.length > 1 ? 's' : ''} failed.`
          );
        } else {
          setError(`Failed to invite ${failures.length} reviewer${failures.length > 1 ? 's' : ''}.`);
        }
      } else {
        setSuccess(
          `${successes} reviewer${successes > 1 ? 's were' : ' was'} invited successfully and notified by email.`
        );
      }

      setSelectedReviewerIds([]);
      setInviteDueDate('');
      await refreshSelectedSubmission(selectedSubmission?.id, 'screening');
    },
    onError: (mutationError) => {
      const apiError = mutationError as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to invite reviewers.');
    },
  });

  const remindMutation = useMutation({
    mutationFn: (assignment: ReviewAssignment) => remindReviewer(assignment.id.toString()),
    onSuccess: () => setSuccess('Reminder email sent to reviewer.'),
    onError: (mutationError) => {
      const apiError = mutationError as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to send reminder.');
    },
  });

  const moveToDecisionMutation = useMutation({
    mutationFn: async () => {
      const result = await moveToDecision(selectedSubmission!.id.toString());
      return unwrapApiMutationResult(result, 'Failed to move submission to decision.');
    },
    onSuccess: async (updatedSubmission) => {
      setSuccess('Submission moved to Decision Pending.');
      await refreshSelectedSubmission(updatedSubmission.id, updatedSubmission.status);
    },
    onError: (mutationError) => {
      const apiError = mutationError as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to move submission to decision.');
    },
  });

  const makeDecisionMutation = useMutation({
    mutationFn: async () => {
      if (!decisionLetter.trim()) {
        throw new Error('Decision letter is required.');
      }

      const result = await makeEditorialDecision(
        selectedSubmission!.id.toString(),
        decision,
        decisionLetter.trim()
      );
      return unwrapApiMutationResult(result, 'Failed to save editorial decision.');
    },
    onSuccess: async (updatedSubmission) => {
      setSuccess('Editorial decision recorded.');
      await refreshSelectedSubmission(updatedSubmission.id, updatedSubmission.status);
    },
    onError: (mutationError) => {
      const apiError = mutationError as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to save editorial decision.');
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const result = await publishSubmission(selectedSubmission!.id.toString());
      return unwrapApiMutationResult(result, 'Failed to publish submission.');
    },
    onSuccess: async (updatedSubmission) => {
      setSuccess('Submission published successfully.');
      await refreshSelectedSubmission(updatedSubmission.id, updatedSubmission.status);
    },
    onError: (mutationError) => {
      const apiError = mutationError as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to publish submission.');
    },
  });

  const generateDoiMutation = useMutation({
    mutationFn: async () => {
      const result = await generateSubmissionDoi(selectedSubmission!.id.toString());
      if (result.error || !result.data) {
        throw new Error(extractApiErrorMessage(result.error, 'Failed to generate DOI.'));
      }
      return result.data;
    },
    onSuccess: async (payload) => {
      setSuccess(`DOI ready: ${payload.doi}`);
      await refreshSelectedSubmission(selectedSubmission?.id, selectedSubmission?.status);
    },
    onError: (mutationError) => {
      const apiError = mutationError as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to generate DOI.');
    },
  });

  const loading = roleLoading || (authorized && submissionsLoading);

  const handleActionStart = () => {
    setSuccess(null);
    setError(null);
  };

  const handleStartScreening = () => {
    handleActionStart();
    screeningMutation.mutate();
  };

  const handleDeskReject = () => {
    setShowDeskRejectModal(true);
    setDeskRejectReason('');
    handleActionStart();
  };

  const confirmDeskReject = () => {
    const reason = deskRejectReason.trim();
    if (!reason) {
      setError('Please provide a reason for desk rejection.');
      return;
    }

    handleActionStart();
    deskRejectMutation.mutate(reason);
  };

  const handleSendToReview = () => {
    setShowSendToReviewModal(true);
    handleActionStart();
  };

  const confirmSendToReview = () => {
    setShowSendToReviewModal(false);
    handleActionStart();
    sendToReviewMutation.mutate();
  };

  const handleInviteReviewer = () => {
    if (!selectedSubmission) {
      return;
    }

    if (selectedReviewerIds.length === 0) {
      setError('Please select at least one reviewer.');
      return;
    }

    if (!inviteDueDate.trim()) {
      setError('Review due date is required.');
      return;
    }

    handleActionStart();

    inviteReviewerMutation.mutate({
      submissionId: selectedSubmission.id.toString(),
      reviewerIds: selectedReviewerIds,
      dueDate: inviteDueDate,
    });
  };

  const handleRemindReviewer = (assignment: ReviewAssignment) => {
    handleActionStart();
    remindMutation.mutate(assignment);
  };

  const handleMoveToDecision = () => {
    handleActionStart();
    moveToDecisionMutation.mutate();
  };

  const handleMakeDecision = () => {
    handleActionStart();
    makeDecisionMutation.mutate();
  };

  const handlePublish = () => {
    handleActionStart();
    publishMutation.mutate();
  };

  const handleGenerateDoi = () => {
    handleActionStart();
    generateDoiMutation.mutate();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: '#1D4ED8', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-slate-600">Loading editor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div
          className="w-full max-w-md rounded-2xl border bg-white p-8 text-center"
          style={{ borderColor: '#FCA5A5', boxShadow: '0 14px 30px rgba(185, 28, 28, 0.10)' }}
        >
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-3 text-2xl font-bold text-[#0B1C4D]">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">You need editor permissions to open this page.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-5 rounded-xl border px-4 py-2.5 text-sm font-semibold text-white"
            style={{
              backgroundColor: '#1D4ED8',
              borderColor: '#1D4ED8',
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFF] to-[#EEF4FF] pt-4 md:pt-5">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="mb-6 rounded-xl border bg-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
          style={{ borderColor: '#CED9F0' }}
        >
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-[#0B1C4D]">Editor Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Manage submissions and editorial workflow in one place.</p>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: '#86EFAC', backgroundColor: '#F0FDF4', color: '#166534' }}>
            <CheckCircle size={16} />
            <span className="flex-1">{success}</span>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="rounded-md border px-2 py-0.5 text-xs font-semibold"
              style={{ borderColor: '#86EFAC', transition: 'all 0.3s ease-in-out' }}
            >
              Close
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#991B1B' }}>
            <AlertCircle size={16} />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="rounded-md border px-2 py-0.5 text-xs font-semibold"
              style={{ borderColor: '#FCA5A5', transition: 'all 0.3s ease-in-out' }}
            >
              Close
            </button>
          </div>
        )}

      <div className="mb-5 overflow-hidden" style={sectionCardStyle}>
        <div className="flex flex-wrap border-b" style={{ borderColor: '#EAECF0' }}>
            <EditorTab
              active={activeTab === 'new'}
              onClick={() => setActiveTab('new')}
              icon={<FileText size={15} />}
              label={`New Submissions (${tabCounts.new})`}
            />
            <EditorTab
              active={activeTab === 'screening'}
              onClick={() => setActiveTab('screening')}
              icon={<Eye size={15} />}
              label={`Screening (${tabCounts.screening})`}
            />
            <EditorTab
              active={activeTab === 'review'}
              onClick={() => setActiveTab('review')}
              icon={<Users size={15} />}
              label={`Under Review (${tabCounts.review})`}
            />
            <EditorTab
              active={activeTab === 'decisions'}
              onClick={() => setActiveTab('decisions')}
              icon={<CheckCircle size={15} />}
              label={`Decisions (${tabCounts.decisions})`}
            />
            <EditorTab
              active={activeTab === 'journal'}
              onClick={() => setActiveTab('journal')}
              icon={<FileText size={15} />}
              label="Make Journal"
            />
          </div>
        </div>

        {activeTab === 'journal' ? (
          <div style={sectionCardStyle} className="p-5">
            <MakeJournalPanel />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div style={sectionCardStyle} className="overflow-hidden">
              <div className="flex items-center justify-between border-b bg-[#F8FBFF] px-4 py-3" style={{ borderColor: '#EAECF0' }}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{tabHeaderLabel[activeTab]}</h2>
                <span className="inline-flex items-center rounded-full border border-[#C9DCF6] bg-white px-3 py-1.5 text-xs font-semibold leading-none text-[#0B1C4D]">
                  {submissions.length}
                </span>
              </div>

              <SubmissionsList
                submissions={submissions}
                selectedId={selectedSubmission?.id}
                onSelect={loadSubmissionDetails}
              />
            </div>

            <div style={sectionCardStyle}>
              <SubmissionDetails
                submission={selectedSubmission}
                reviewers={reviewers}
                isLoadingReviewers={isLoadingReviewers}
                inviteDueDate={inviteDueDate}
                selectedReviewerIds={selectedReviewerIds}
                decision={decision}
                decisionLetter={decisionLetter}
                onReviewerIdsSelect={setSelectedReviewerIds}
                onInviteDueDateChange={setInviteDueDate}
                onInviteReviewer={handleInviteReviewer}
                onRemindReviewer={handleRemindReviewer}
                onDecisionChange={setDecision}
                onDecisionLetterChange={setDecisionLetter}
                onMakeDecision={handleMakeDecision}
                onStartScreening={handleStartScreening}
                onDeskReject={handleDeskReject}
                onSendToReview={handleSendToReview}
                onMoveToDecision={handleMoveToDecision}
                onPublish={handlePublish}
                onGenerateDoi={handleGenerateDoi}
                inviting={inviteReviewerMutation.isPending}
                deciding={makeDecisionMutation.isPending}
                movingToDecision={moveToDecisionMutation.isPending}
                deskRejecting={deskRejectMutation.isPending}
                publishing={publishMutation.isPending}
                generatingDoi={generateDoiMutation.isPending}
              />
            </div>
          </div>
        )}
      </div>

      {showDeskRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="saas-fade-menu w-full max-w-lg rounded-lg border bg-white shadow-[0_24px_52px_rgba(15,23,42,0.22)]" style={{ borderColor: '#CED9F0', transition: 'all 0.3s ease-in-out' }}>
            <div className="border-b px-5 py-4" style={{ borderColor: '#EAECF0' }}>
              <h3 className="text-base font-semibold text-[#0B1C4D]">Desk Reject Submission</h3>
            </div>

            <div className="space-y-3 px-5 py-4">
              <p className="text-sm text-slate-600">
                Provide a clear reason for desk rejection. This message is saved with the submission.
              </p>
              <textarea
                value={deskRejectReason}
                onChange={(event) => setDeskRejectReason(event.target.value)}
                rows={5}
                placeholder="Example: Out of scope for the journal"
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                style={{ borderColor: '#D9E0FF', transition: 'all 0.3s ease-in-out' }}
              />
            </div>

            <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: '#EAECF0' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeskRejectModal(false);
                  setDeskRejectReason('');
                }}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: '#D9E0FF', color: '#0B1C4D', transition: 'all 0.3s ease-in-out' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeskReject}
                disabled={deskRejectMutation.isPending || deskRejectReason.trim().length === 0}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-white"
                style={{
                  borderColor: '#DC2626',
                  backgroundColor: '#DC2626',
                  transition: 'all 0.3s ease-in-out',
                  opacity: deskRejectMutation.isPending || deskRejectReason.trim().length === 0 ? 0.65 : 1,
                  cursor:
                    deskRejectMutation.isPending || deskRejectReason.trim().length === 0
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {deskRejectMutation.isPending ? 'Rejecting...' : 'Desk Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSendToReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="saas-fade-menu w-full max-w-lg rounded-lg border bg-white shadow-[0_24px_52px_rgba(15,23,42,0.22)]" style={{ borderColor: '#CED9F0', transition: 'all 0.3s ease-in-out' }}>
            <div className="border-b px-5 py-4" style={{ borderColor: '#EAECF0' }}>
              <h3 className="text-base font-semibold text-[#0B1C4D]">Confirm Send To Review</h3>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-slate-600">
                After sending to review, reviewer assignment is locked for this stage. Continue?
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: '#EAECF0' }}>
              <button
                type="button"
                onClick={() => setShowSendToReviewModal(false)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: '#D9E0FF', color: '#0B1C4D', transition: 'all 0.3s ease-in-out' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSendToReview}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-white"
                style={{
                  borderColor: '#1D4ED8',
                  backgroundColor: '#1D4ED8',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Send to Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
