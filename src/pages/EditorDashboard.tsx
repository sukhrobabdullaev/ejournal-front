import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Users, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Submission, ReviewAssignment } from '../lib/api';
import {
  getMyRole,
  getAllSubmissions,
  getSubmissionByIdForEditor,
  inviteReviewer,
  startScreening,
  sendToReview,
  moveToDecision,
  makeEditorialDecision,
  publishSubmission,
  remindReviewer,
} from '../lib/queries-api';
import { EditorTab, SubmissionsList, SubmissionDetails } from '../features/editor/components';
import { ApiError } from '../features/editor/utils';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_BASE_URL) ||
  'https://api.uzfintex.uz/api';

type TabType = 'new' | 'screening' | 'review' | 'decisions';

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

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['my-role'],
    queryFn: getMyRole,
    retry: false,
  });

  const authorized = role === 'editor' || role === 'admin';

  const { data, isLoading: subsLoading } = useQuery<Submission[], Error, Submission[], string[]>({
    queryKey: ['editor-submissions'],
    queryFn: () => getAllSubmissions(),
    enabled: authorized,
  });

  const allSubmissions: Submission[] = data ?? [];
  console.log('allSubmissions', allSubmissions);

  // Fetch reviewers for the invite dropdown
  const { data: reviewers = [], isLoading: isLoadingReviewers } = useQuery({
    queryKey: ['reviewers'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/editor/reviewers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ejournal_access_token')}`,
        },
      });
      if (!response.ok) {
        console.error('Failed to fetch reviewers');
        return [];
      }
      return response.json();
    },
    enabled: authorized,
  });

  const newCount = allSubmissions.filter((s) => s.status === 'submitted').length;
  const screeningCount = allSubmissions.filter((s) => s.status === 'screening').length;
  const reviewCount = allSubmissions.filter((s) => s.status === 'under_review').length;
  const decisionsCount = allSubmissions.filter((s) =>
    ['decision_pending', 'revision_required', 'accepted', 'rejected', 'published'].includes(
      s.status
    )
  ).length;

  const submissions = allSubmissions.filter((s) => {
    switch (activeTab) {
      case 'new':
        return s.status === 'submitted';
      case 'screening':
        return s.status === 'screening';
      case 'review':
        return s.status === 'under_review';
      case 'decisions':
        return [
          'decision_pending',
          'revision_required',
          'accepted',
          'rejected',
          'published',
        ].includes(s.status);
      default:
        return true;
    }
  });

  const loading = roleLoading || (authorized && subsLoading);

  const loadSubmissionDetails = async (id: number) => {
    try {
      setError(null);
      const data = await getSubmissionByIdForEditor(id.toString());
      if (!data) {
        setError('Submission not found or access denied');
        setSelectedSubmission(null);
        return;
      }
      setSelectedSubmission(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load submission detail');
    }
  };

  const refreshSelected = async () => {
    if (!selectedSubmission) return;
    const refreshed = await getSubmissionByIdForEditor(selectedSubmission.id.toString());
    if (refreshed) setSelectedSubmission(refreshed);
    queryClient.invalidateQueries({ queryKey: ['editor-submissions'] });
  };

  const screeningMutation = useMutation({
    mutationFn: () => startScreening(selectedSubmission!.id.toString()),
    onSuccess: async () => {
      setSuccess('Submission moved to Screening.');
      await refreshSelected();
    },
    onError: (err) => setError((err as Error).message || 'Failed to move submission to screening'),
  });

  const sendToReviewMutation = useMutation({
    mutationFn: () => sendToReview(selectedSubmission!.id.toString()),
    onSuccess: async () => {
      setSuccess('Submission moved to Under Review.');
      await refreshSelected();
    },
    onError: (err) => {
      const apiError = err as ApiError;
      setError(
        apiError.detail ||
          apiError.message ||
          'Failed to move submission to review. Make sure at least one reviewer is invited.'
      );
    },
  });

  const inviteReviewerMutation = useMutation({
    mutationFn: async (params: { submissionId: string; reviewerIds: number[]; dueDate: string }) => {
      const { submissionId, reviewerIds, dueDate } = params;
      
      // Send invitations to all selected reviewers
      const results = await Promise.allSettled(
        reviewerIds.map((reviewerId) =>
          inviteReviewer(submissionId, {
            reviewer_user_id: reviewerId,
            due_date: dueDate,
          })
        )
      );
      
      // Collect success and failure information
      const successes = results.filter((r) => r.status === 'fulfilled');
      const failures = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      
      return {
        results,
        successes: successes.length,
        failures: failures.length,
        failureReasons: failures.map(f => f.reason),
        reviewerIds,
      };
    },
    onSuccess: async (data, variables) => {
      const { successes, failures, failureReasons, reviewerIds } = data;
      
      if (failures > 0) {
        // Check if error is about already invited reviewers
        const alreadyInvitedErrors = failureReasons.filter((reason: any) => 
          reason?.detail?.includes('already invited') || 
          reason?.message?.includes('already invited')
        );
        
        if (alreadyInvitedErrors.length === failures) {
          // All failures are "already invited"
          if (failures === reviewerIds.length) {
            setError('All selected reviewers have already been invited to this submission.');
          } else {
            setSuccess(
              `${successes} reviewer${successes > 1 ? 's' : ''} invited successfully. ` +
              `${failures} reviewer${failures > 1 ? 's were' : ' was'} already invited.`
            );
          }
        } else {
          // Mixed errors or other errors
          setError(
            successes > 0
              ? `${successes} reviewer${successes > 1 ? 's' : ''} invited, but ${failures} failed. Please check the reviewers.`
              : `Failed to invite ${failures} reviewer${failures > 1 ? 's' : ''}.`
          );
        }
      } else {
        // All successful
        setSuccess(
          `${successes} reviewer${successes > 1 ? 's' : ''} invited successfully. Invitation email${successes > 1 ? 's have' : ' has'} been sent.`
        );
      }
      
      setSelectedReviewerIds([]);
      setInviteDueDate('');
      await refreshSelected();
    },
    onError: (err) => {
      const apiError = err as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to invite reviewer(s)');
    },
  });

  const remindMutation = useMutation({
    mutationFn: (assignment: ReviewAssignment) => remindReviewer(assignment.id.toString()),
    onSuccess: () => setSuccess('Reminder sent to reviewer.'),
    onError: (err) => {
      const apiError = err as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to send reminder');
    },
  });

  const moveToDecisionMutation = useMutation({
    mutationFn: () => moveToDecision(selectedSubmission!.id.toString()),
    onSuccess: async () => {
      await refreshSelected();
      setSuccess('Submission moved to Decision Pending.');
    },
    onError: (err) => {
      const apiError = err as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to move submission to decision');
    },
  });

  const makeDecisionMutation = useMutation({
    mutationFn: () => {
      if (!decisionLetter.trim()) throw new Error('Decision letter is required.');
      return makeEditorialDecision(
        selectedSubmission!.id.toString(),
        decision,
        decisionLetter.trim()
      );
    },
    onSuccess: async () => {
      await refreshSelected();
      setSuccess('Editorial decision recorded.');
    },
    onError: (err) => {
      const apiError = err as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to record decision');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishSubmission(selectedSubmission!.id.toString()),
    onSuccess: async () => {
      await refreshSelected();
      setSuccess('Submission published.');
    },
    onError: (err) => {
      const apiError = err as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to publish submission');
    },
  });

  const inviting = inviteReviewerMutation.isPending;
  const deciding = makeDecisionMutation.isPending;
  const movingToDecision = moveToDecisionMutation.isPending;
  const publishing = publishMutation.isPending;

  const handleStartScreening = () => {
    setSuccess(null);
    setError(null);
    screeningMutation.mutate();
  };

  const handleSendToReview = () => {
    setShowSendToReviewModal(true);
  };

  const confirmSendToReview = () => {
    setSuccess(null);
    setError(null);
    setShowSendToReviewModal(false);
    sendToReviewMutation.mutate();
  };

  const handleInviteReviewer = () => {
    if (!selectedSubmission) return;
    if (selectedReviewerIds.length === 0) return;

    setSuccess(null);
    setError(null);

    const dueDate = inviteDueDate || new Date().toISOString().slice(0, 10);

    inviteReviewerMutation.mutate({
      submissionId: selectedSubmission.id.toString(),
      reviewerIds: selectedReviewerIds,
      dueDate,
    });
  };

  const handleRemindReviewer = (assignment: ReviewAssignment) => {
    setSuccess(null);
    setError(null);
    remindMutation.mutate(assignment);
  };

  const handleMoveToDecision = () => {
    setSuccess(null);
    setError(null);
    moveToDecisionMutation.mutate();
  };

  const handleMakeDecision = () => {
    setSuccess(null);
    setError(null);
    makeDecisionMutation.mutate();
  };

  const handlePublish = () => {
    setSuccess(null);
    setError(null);
    publishMutation.mutate();
  };

  if (loading) {
    return (
      <div
        style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}
        className="flex items-center justify-center"
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#64748B' }}>Loading editor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div
        style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}
        className="flex items-center justify-center px-4"
      >
        <div
          className="w-full max-w-md bg-white text-center"
          style={{
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.15)',
            borderTop: '4px solid #EF4444',
          }}
        >
          <AlertCircle className="mx-auto mb-4 h-16 w-16" style={{ color: '#EF4444' }} />
          <h1 className="mb-3 text-2xl font-bold" style={{ color: '#0B1C4D' }}>
            Access Denied
          </h1>
          <p className="mb-6" style={{ color: '#64748B' }}>
            You need editor permissions to access this page.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg px-6 py-3 font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <h1 className="mb-3 text-4xl font-bold" style={{ color: '#FFFFFF' }}>
            Editor Dashboard
          </h1>
          <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Manage manuscript submissions and peer review
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
        {success && (
          <div className="mb-6 flex items-center gap-2 border border-green-300 bg-green-50 p-4 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 border border-red-300 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-6 border border-gray-300 bg-white">
          <div className="flex border-b border-gray-300">
            <EditorTab
              active={activeTab === 'new'}
              onClick={() => setActiveTab('new')}
              icon={<FileText className="mr-2 inline h-4 w-4" />}
              label={`New Submissions (${newCount})`}
            />
            <EditorTab
              active={activeTab === 'screening'}
              onClick={() => setActiveTab('screening')}
              icon={<Eye className="mr-2 inline h-4 w-4" />}
              label={`Screening (${screeningCount})`}
            />
            <EditorTab
              active={activeTab === 'review'}
              onClick={() => setActiveTab('review')}
              icon={<Users className="mr-2 inline h-4 w-4" />}
              label={`Under Review (${reviewCount})`}
            />
            <EditorTab
              active={activeTab === 'decisions'}
              onClick={() => setActiveTab('decisions')}
              icon={<CheckCircle className="mr-2 inline h-4 w-4" />}
              label={`Decisions (${decisionsCount})`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="border border-gray-300 bg-white">
            <div className="border-b border-gray-300 p-4">
              <h2 className="font-semibold text-gray-900">
                {activeTab === 'new' && 'New Submissions'}
                {activeTab === 'screening' && 'Screening'}
                {activeTab === 'review' && 'Under Review'}
                {activeTab === 'decisions' && 'Decisions'}
              </h2>
            </div>
            <SubmissionsList
              submissions={submissions}
              selectedId={selectedSubmission?.id}
              onSelect={loadSubmissionDetails}
            />
          </div>

          <div className="border border-gray-300 bg-white">
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
              onSendToReview={handleSendToReview}
              onMoveToDecision={handleMoveToDecision}
              onPublish={handlePublish}
              inviting={inviting}
              deciding={deciding}
              movingToDecision={movingToDecision}
              publishing={publishing}
            />
          </div>
        </div>
      </div>

      {/* Send to Review Confirmation Modal */}
      {showSendToReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="m-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Send to Review</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">
                Once you send this submission to review, you will no longer be able to assign additional reviewers. 
                Are you sure you want to proceed?
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowSendToReviewModal(false)}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSendToReview}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
