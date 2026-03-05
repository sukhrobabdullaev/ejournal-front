import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Clock, Users, CheckCircle, AlertCircle, Eye, Send } from 'lucide-react';
import type { Submission, ReviewAssignment } from '../lib/api';
import {
  getMyRole,
  getSubmissionsByStatus,
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type TabType = 'new' | 'screening' | 'review' | 'decisions';

export function EditorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reviewer invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDueDate, setInviteDueDate] = useState('');

  // Decision form
  const [decision, setDecision] = useState<'accept' | 'reject' | 'revision_required'>('accept');
  const [decisionLetter, setDecisionLetter] = useState('');

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['my-role'],
    queryFn: getMyRole,
    retry: false,
  });

  const authorized = role === 'editor' || role === 'admin';

  // Query key for the current tab's submissions
  const submissionsQueryKey = ['editor-submissions', activeTab];

  const { data: submissions = [], isLoading: subsLoading } = useQuery({
    queryKey: submissionsQueryKey,
    queryFn: async () => {
      switch (activeTab) {
        case 'new':
          return getSubmissionsByStatus('submitted');
        case 'screening':
          return getSubmissionsByStatus('screening');
        case 'review':
          return getSubmissionsByStatus('under_review');
        case 'decisions': {
          const all = await getAllSubmissions();
          return all.filter((s) =>
            ['decision_pending', 'revision_required', 'accepted', 'rejected', 'published'].includes(
              s.status
            )
          );
        }
        default:
          return getAllSubmissions();
      }
    },
    enabled: authorized,
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
    } catch (err: any) {
      setError(err.message || 'Failed to load submission detail');
    }
  };

  const refreshSelected = async () => {
    if (!selectedSubmission) return;
    const refreshed = await getSubmissionByIdForEditor(selectedSubmission.id.toString());
    if (refreshed) setSelectedSubmission(refreshed);
    queryClient.invalidateQueries({ queryKey: submissionsQueryKey });
  };

  const screeningMutation = useMutation({
    mutationFn: () => startScreening(selectedSubmission!.id.toString()),
    onSuccess: async () => {
      setSuccess('Submission moved to Screening.');
      await refreshSelected();
    },
    onError: (err: any) => setError(err.message || 'Failed to move submission to screening'),
  });

  const sendToReviewMutation = useMutation({
    mutationFn: () => sendToReview(selectedSubmission!.id.toString()),
    onSuccess: async () => {
      setSuccess('Submission moved to Under Review.');
      await refreshSelected();
    },
    onError: (err: any) =>
      setError(
        err?.detail ||
          err.message ||
          'Failed to move submission to review. Make sure at least one reviewer is invited.'
      ),
  });

  const inviteReviewerMutation = useMutation({
    mutationFn: () =>
      inviteReviewer(selectedSubmission!.id.toString(), {
        reviewer_email: inviteEmail,
        due_date: inviteDueDate || new Date().toISOString().slice(0, 10),
      }),
    onSuccess: async () => {
      setSuccess('Reviewer invited successfully.');
      setInviteEmail('');
      setInviteDueDate('');
      await refreshSelected();
    },
    onError: (err: any) => setError(err?.detail || err.message || 'Failed to invite reviewer'),
  });

  const remindMutation = useMutation({
    mutationFn: (assignment: ReviewAssignment) => remindReviewer(assignment.id.toString()),
    onSuccess: () => setSuccess('Reminder sent to reviewer.'),
    onError: (err: any) => setError(err?.detail || err.message || 'Failed to send reminder'),
  });

  const moveToDecisionMutation = useMutation({
    mutationFn: () => moveToDecision(selectedSubmission!.id.toString()),
    onSuccess: async () => {
      await refreshSelected();
      setSuccess('Submission moved to Decision Pending.');
    },
    onError: (err: any) =>
      setError(err?.detail || err.message || 'Failed to move submission to decision'),
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
    onError: (err: any) => setError(err?.detail || err.message || 'Failed to record decision'),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishSubmission(selectedSubmission!.id.toString()),
    onSuccess: async () => {
      await refreshSelected();
      setSuccess('Submission published.');
    },
    onError: (err: any) => setError(err?.detail || err.message || 'Failed to publish submission'),
  });

  // Aliases for JSX compatibility
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
    setSuccess(null);
    setError(null);
    sendToReviewMutation.mutate();
  };
  const handleInviteReviewer = () => {
    if (!selectedSubmission || !inviteEmail) return;
    setSuccess(null);
    setError(null);
    inviteReviewerMutation.mutate();
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
      {/* Page Header */}
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

      {/* Main Content */}
      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Messages */}
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

        {/* Tabs */}
        <div className="mb-6 border border-gray-300 bg-white">
          <div className="flex border-b border-gray-300">
            <EditorTab
              active={activeTab === 'new'}
              onClick={() => setActiveTab('new')}
              icon={<FileText className="mr-2 inline h-4 w-4" />}
              label={`New Submissions (${submissions.length})`}
            />
            <EditorTab
              active={activeTab === 'screening'}
              onClick={() => setActiveTab('screening')}
              icon={<Eye className="mr-2 inline h-4 w-4" />}
              label="Screening"
            />
            <EditorTab
              active={activeTab === 'review'}
              onClick={() => setActiveTab('review')}
              icon={<Users className="mr-2 inline h-4 w-4" />}
              label="Under Review"
            />
            <EditorTab
              active={activeTab === 'decisions'}
              onClick={() => setActiveTab('decisions')}
              icon={<CheckCircle className="mr-2 inline h-4 w-4" />}
              label="Decisions"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Submissions List */}
          <div className="border border-gray-300 bg-white">
            <div className="border-b border-gray-300 p-4">
              <h2 className="font-semibold text-gray-900">
                {activeTab === 'new' && 'New Submissions'}
                {activeTab === 'screening' && 'Screening'}
                {activeTab === 'review' && 'Under Review'}
                {activeTab === 'decisions' && 'Decisions'}
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p>No submissions in this category</p>
                </div>
              ) : (
                submissions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => loadSubmissionDetails(s.id)}
                    className={`w-full cursor-pointer p-4 text-left transition-colors hover:bg-gray-50 ${
                      selectedSubmission?.id === s.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <h3 className="mb-1 line-clamp-2 font-medium text-gray-900">
                      {s.title || 'Untitled Submission'}
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">Author ID: {s.author ?? 'Unknown'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(s.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                        {s.topic_area?.name || 'No topic'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Submission Details & Actions */}
          <div className="border border-gray-300 bg-white">
            {!selectedSubmission ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p>Select a submission to view details</p>
              </div>
            ) : (
              <div className="max-h-[600px] space-y-4 overflow-y-auto p-4">
                {/* Title + meta */}
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">
                    {selectedSubmission.title || 'Untitled Submission'}
                  </h3>
                  <p className="mb-1 text-xs text-gray-500">
                    ID:{' '}
                    <span className="font-mono">
                      {selectedSubmission.id.toString().substring(0, 8).toUpperCase()}
                    </span>
                  </p>
                  <span className={getStatusChipClasses(selectedSubmission.status)}>
                    {getStatusLabel(selectedSubmission.status)}
                  </span>
                </div>

                {/* Abstract */}
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-gray-700">Abstract</h4>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {selectedSubmission.abstract || 'No abstract provided.'}
                  </p>
                </div>

                {/* Keywords */}
                {selectedSubmission.keywords && selectedSubmission.keywords.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.keywords.map((keyword, idx) => (
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
                  {(!selectedSubmission.manuscript_pdf ||
                    selectedSubmission.manuscript_pdf.trim().length === 0) &&
                  (!selectedSubmission.supplementary_files ||
                    selectedSubmission.supplementary_files.length === 0) ? (
                    <p className="text-sm text-gray-500">No files uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSubmission.manuscript_pdf &&
                        selectedSubmission.manuscript_pdf.trim().length > 0 && (
                          <a
                            href={selectedSubmission.manuscript_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between border border-blue-200 bg-blue-50 p-2 text-sm transition-colors hover:bg-blue-100"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">Manuscript PDF</span>
                            </div>
                            <span className="text-xs font-semibold text-blue-700 uppercase">
                              View
                            </span>
                          </a>
                        )}

                      {selectedSubmission.supplementary_files?.map((file) => (
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
                          <span className="text-xs font-semibold text-gray-700 uppercase">
                            Open
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review assignments (from REST payload) */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Review Assignments</h4>
                  {(!selectedSubmission.review_assignments ||
                    selectedSubmission.review_assignments.length === 0) && (
                    <p className="text-sm text-gray-500">No reviewers assigned yet.</p>
                  )}
                  {selectedSubmission.review_assignments &&
                    selectedSubmission.review_assignments.length > 0 && (
                      <div className="space-y-2">
                        {selectedSubmission.review_assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between border border-gray-200 bg-gray-50 p-2 text-xs"
                          >
                            <div>
                              <p className="font-medium text-gray-800">
                                {assignment.reviewer_email}
                              </p>
                              <p className="text-gray-500 capitalize">
                                Status: {assignment.status.replace('_', ' ')}
                              </p>
                              {assignment.due_date && (
                                <p className="text-gray-500">
                                  Due: {new Date(assignment.due_date).toLocaleDateString('en-US')}
                                </p>
                              )}
                            </div>
                            {['invited', 'accepted'].includes(assignment.status) && (
                              <button
                                type="button"
                                onClick={() => handleRemindReviewer(assignment)}
                                className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                              >
                                Send Reminder
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Reviewer invite (simple email form) */}
                {['screening', 'under_review'].includes(selectedSubmission.status) && (
                  <div className="space-y-2 border-t border-gray-200 pt-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Invite Reviewer (by email)
                    </h4>
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="reviewer@example.com"
                      />
                      <input
                        type="date"
                        value={inviteDueDate}
                        onChange={(e) => setInviteDueDate(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleInviteReviewer}
                        disabled={inviting || !inviteEmail}
                        className="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        <Send className="h-4 w-4" />
                        {inviting ? 'Inviting...' : 'Invite Reviewer'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Workflow actions */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  {selectedSubmission.status === 'submitted' && (
                    <button
                      type="button"
                      onClick={handleStartScreening}
                      className="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      Move to Screening
                    </button>
                  )}

                  {selectedSubmission.status === 'screening' &&
                    selectedSubmission.review_assignments &&
                    selectedSubmission.review_assignments.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSendToReview}
                        className="flex w-full items-center justify-center gap-2 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        <Send className="h-4 w-4" />
                        Send to Review
                      </button>
                    )}

                  {selectedSubmission.status === 'under_review' && (
                    <button
                      type="button"
                      onClick={handleMoveToDecision}
                      disabled={movingToDecision}
                      className="flex w-full items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {movingToDecision ? 'Moving to Decision...' : 'Move to Decision'}
                    </button>
                  )}

                  {selectedSubmission.status === 'decision_pending' && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Editorial Decision</p>
                      <div className="flex gap-3 text-sm text-gray-700">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            value="accept"
                            checked={decision === 'accept'}
                            onChange={() => setDecision('accept')}
                          />
                          Accept
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            value="revision_required"
                            checked={decision === 'revision_required'}
                            onChange={() => setDecision('revision_required')}
                          />
                          Revision Required
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            value="reject"
                            checked={decision === 'reject'}
                            onChange={() => setDecision('reject')}
                          />
                          Reject
                        </label>
                      </div>
                      <textarea
                        rows={4}
                        value={decisionLetter}
                        onChange={(e) => setDecisionLetter(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Decision letter to the author..."
                      />
                      <button
                        type="button"
                        onClick={handleMakeDecision}
                        disabled={deciding}
                        className="w-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {deciding ? 'Saving Decision...' : 'Save Decision'}
                      </button>
                    </div>
                  )}

                  {selectedSubmission.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishing}
                      className="w-full bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {publishing ? 'Publishing...' : 'Publish Submission'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type EditorTabProps = {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
};

const EditorTab: React.FC<EditorTabProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

const getStatusLabel = (status: Submission['status']): string =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getStatusChipClasses = (status: Submission['status']): string => {
  switch (status) {
    case 'draft':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300';
    case 'submitted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-300';
    case 'screening':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-300';
    case 'under_review':
    case 'decision_pending':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-300';
    case 'revision_required':
    case 'resubmitted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-300';
    case 'accepted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-300';
    case 'rejected':
    case 'desk_rejected':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-300';
    case 'published':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-300';
    default:
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300';
  }
};
