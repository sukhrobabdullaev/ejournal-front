import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
} from 'lucide-react';
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

type TabType = 'new' | 'screening' | 'review' | 'decisions';

export function EditorDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('new');

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reviewer invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDueDate, setInviteDueDate] = useState('');
  const [inviting, setInviting] = useState(false);

  // Decision form
  const [decision, setDecision] = useState<'accept' | 'reject' | 'revision_required'>(
    'accept',
  );
  const [decisionLetter, setDecisionLetter] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [movingToDecision, setMovingToDecision] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const role = await getMyRole();
        if (role === 'editor' || role === 'admin') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (err: any) {
        console.error('Editor auth check failed:', err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, []);

  // Load submissions whenever tab or auth changes
  useEffect(() => {
    if (!authorized) return;
    void loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, activeTab]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSubmission(null);

      let list: Submission[] = [];

      switch (activeTab) {
        case 'new':
          list = await getSubmissionsByStatus('submitted');
          break;
        case 'screening':
          list = await getSubmissionsByStatus('screening');
          break;
        case 'review':
          list = await getSubmissionsByStatus('under_review');
          break;
        case 'decisions': {
          const all = await getAllSubmissions();
          list = all.filter((s) =>
            ['decision_pending', 'revision_required', 'accepted', 'rejected', 'published'].includes(
              s.status,
            ),
          );
          break;
        }
        default:
          list = await getAllSubmissions();
      }

      setSubmissions(list);
    } catch (err: any) {
      console.error('Error loading editor submissions:', err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Error loading submission detail:', err);
      setError(err.message || 'Failed to load submission detail');
    }
  };

  const handleStartScreening = async () => {
    if (!selectedSubmission) return;
    try {
      setSuccess(null);
      setError(null);
      setLoading(true);

      await startScreening(selectedSubmission.id.toString());
      setSuccess('Submission moved to Screening.');
      await loadSubmissions();
    } catch (err: any) {
      console.error('Error starting screening:', err);
      setError(err.message || 'Failed to move submission to screening');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToReview = async () => {
    if (!selectedSubmission) return;
    try {
      setSuccess(null);
      setError(null);
      setLoading(true);

      // backend enforces presence of assignments; we just surface errors
      await sendToReview(selectedSubmission.id.toString());
      setSuccess('Submission moved to Under Review.');
      await loadSubmissions();
    } catch (err: any) {
      console.error('Error sending to review:', err);
      setError(
        err?.detail ||
          err.message ||
          'Failed to move submission to review. Make sure at least one reviewer is invited.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInviteReviewer = async () => {
    if (!selectedSubmission || !inviteEmail) return;
    try {
      setInviting(true);
      setSuccess(null);
      setError(null);

      await inviteReviewer(selectedSubmission.id.toString(), {
        reviewer_email: inviteEmail,
        due_date: inviteDueDate || new Date().toISOString().slice(0, 10),
      });

      setSuccess('Reviewer invited successfully.');
      setInviteEmail('');
      setInviteDueDate('');

      const refreshed = await getSubmissionByIdForEditor(selectedSubmission.id.toString());
      if (refreshed) setSelectedSubmission(refreshed);
    } catch (err: any) {
      console.error('Error inviting reviewer:', err);
      setError(err?.detail || err.message || 'Failed to invite reviewer');
    } finally {
      setInviting(false);
    }
  };

  const handleRemindReviewer = async (assignment: ReviewAssignment) => {
    try {
      setSuccess(null);
      setError(null);
      await remindReviewer(assignment.id.toString());
      setSuccess('Reminder sent to reviewer.');
    } catch (err: any) {
      console.error('Error reminding reviewer:', err);
      setError(err?.detail || err.message || 'Failed to send reminder');
    }
  };

  const handleMoveToDecision = async () => {
    if (!selectedSubmission) return;
    try {
      setMovingToDecision(true);
      setSuccess(null);
      setError(null);

      await moveToDecision(selectedSubmission.id.toString());
      const refreshed = await getSubmissionByIdForEditor(selectedSubmission.id.toString());
      if (refreshed) setSelectedSubmission(refreshed);
      setSuccess('Submission moved to Decision Pending.');
    } catch (err: any) {
      console.error('Error moving to decision:', err);
      setError(err?.detail || err.message || 'Failed to move submission to decision');
    } finally {
      setMovingToDecision(false);
    }
  };

  const handleMakeDecision = async () => {
    if (!selectedSubmission || !decisionLetter.trim()) {
      setError('Decision letter is required.');
      return;
    }

    try {
      setDeciding(true);
      setSuccess(null);
      setError(null);

      await makeEditorialDecision(
        selectedSubmission.id.toString(),
        decision,
        decisionLetter.trim(),
      );

      const refreshed = await getSubmissionByIdForEditor(selectedSubmission.id.toString());
      if (refreshed) setSelectedSubmission(refreshed);

      setSuccess('Editorial decision recorded.');
    } catch (err: any) {
      console.error('Error making decision:', err);
      setError(err?.detail || err.message || 'Failed to record decision');
    } finally {
      setDeciding(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedSubmission) return;
    try {
      setPublishing(true);
      setSuccess(null);
      setError(null);

      await publishSubmission(selectedSubmission.id.toString());
      const refreshed = await getSubmissionByIdForEditor(selectedSubmission.id.toString());
      if (refreshed) setSelectedSubmission(refreshed);
      setSuccess('Submission published.');
    } catch (err: any) {
      console.error('Error publishing submission:', err);
      setError(err?.detail || err.message || 'Failed to publish submission');
    } finally {
      setPublishing(false);
    }
  };

  if (loading && !submissions.length && !selectedSubmission) {
    return (
      <div
        style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}
        className="flex items-center justify-center"
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
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
          className="bg-white text-center max-w-md w-full"
          style={{
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.15)',
            borderTop: '4px solid #EF4444',
          }}
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#0B1C4D' }}>
            Access Denied
          </h1>
          <p className="mb-6" style={{ color: '#64748B' }}>
            You need editor permissions to access this page.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 font-medium rounded-lg transition-all"
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
      <div
        style={{ backgroundColor: '#0B1C4D', paddingTop: '60px', paddingBottom: '60px' }}
      >
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
            Editor Dashboard
          </h1>
          <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Manage manuscript submissions and peer review
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 text-green-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
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
          <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
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
        <div className="bg-white border border-gray-300 mb-6">
          <div className="flex border-b border-gray-300">
            <EditorTab
              active={activeTab === 'new'}
              onClick={() => setActiveTab('new')}
              icon={<FileText className="w-4 h-4 inline mr-2" />}
              label={`New Submissions (${submissions.length})`}
            />
            <EditorTab
              active={activeTab === 'screening'}
              onClick={() => setActiveTab('screening')}
              icon={<Eye className="w-4 h-4 inline mr-2" />}
              label="Screening"
            />
            <EditorTab
              active={activeTab === 'review'}
              onClick={() => setActiveTab('review')}
              icon={<Users className="w-4 h-4 inline mr-2" />}
              label="Under Review"
            />
            <EditorTab
              active={activeTab === 'decisions'}
              onClick={() => setActiveTab('decisions')}
              icon={<CheckCircle className="w-4 h-4 inline mr-2" />}
              label="Decisions"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="bg-white border border-gray-300">
            <div className="p-4 border-b border-gray-300">
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
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No submissions in this category</p>
                </div>
              ) : (
                submissions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => loadSubmissionDetails(s.id)}
                    className={`w-full text-left p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSubmission?.id === s.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {s.title || 'Untitled Submission'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Author ID: {s.author ?? 'Unknown'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(s.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {s.topic_area?.name || 'No topic'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Submission Details & Actions */}
          <div className="bg-white border border-gray-300">
            {!selectedSubmission ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a submission to view details</p>
              </div>
            ) : (
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Title + meta */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedSubmission.title || 'Untitled Submission'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Abstract</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedSubmission.abstract || 'No abstract provided.'}
                  </p>
                </div>

                {/* Keywords */}
                {selectedSubmission.keywords && selectedSubmission.keywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-xs text-gray-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Files</h4>
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
                            className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-900">
                                Manuscript PDF
                              </span>
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
                          className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Review Assignments
                  </h4>
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
                            className="p-2 bg-gray-50 border border-gray-200 text-xs flex items-center justify-between"
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
                                  Due:{' '}
                                  {new Date(assignment.due_date).toLocaleDateString('en-US')}
                                </p>
                              )}
                            </div>
                            {['invited', 'accepted'].includes(assignment.status) && (
                              <button
                                type="button"
                                onClick={() => handleRemindReviewer(assignment)}
                                className="text-blue-600 hover:text-blue-700 text-[11px] font-medium"
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
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Invite Reviewer (by email)
                    </h4>
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="reviewer@example.com"
                      />
                      <input
                        type="date"
                        value={inviteDueDate}
                        onChange={(e) => setInviteDueDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleInviteReviewer}
                        disabled={inviting || !inviteEmail}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {inviting ? 'Inviting...' : 'Invite Reviewer'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Workflow actions */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {selectedSubmission.status === 'submitted' && (
                    <button
                      type="button"
                      onClick={handleStartScreening}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Move to Screening
                    </button>
                  )}

                  {selectedSubmission.status === 'screening' &&
                    selectedSubmission.review_assignments &&
                    selectedSubmission.review_assignments.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSendToReview}
                        className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send to Review
                      </button>
                    )}

                  {selectedSubmission.status === 'under_review' && (
                    <button
                      type="button"
                      onClick={handleMoveToDecision}
                      disabled={movingToDecision}
                      className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {movingToDecision ? 'Moving to Decision...' : 'Move to Decision'}
                    </button>
                  )}

                  {selectedSubmission.status === 'decision_pending' && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Editorial Decision
                      </p>
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
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Decision letter to the author..."
                      />
                      <button
                        type="button"
                        onClick={handleMakeDecision}
                        disabled={deciding}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                      className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
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

