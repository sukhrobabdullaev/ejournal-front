import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Clock, CheckCircle, AlertCircle, Download, X, Send } from 'lucide-react';
import { TokenManager } from '../lib/api';
import type { ReviewAssignment } from '../lib/api';
import { getMyAssignments, getSubmissionFiles, submitReview } from '../lib/queries-api';

export function ReviewDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<ReviewAssignment | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [existingReview, setExistingReview] = useState<any | null>(null);

  // Review form state
  const [recommendation, setRecommendation] = useState('');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [commentsToEditor, setCommentsToEditor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      setLoading(true);

      if (!TokenManager.getAccessToken()) {
        navigate('/login');
        return;
      }

      // Load assignments
      const assignmentsData = await getMyAssignments();

      if (assignmentsData.length === 0) {
        setError('You do not have any review assignments.');
        setLoading(false);
        return;
      }

      setAssignments(assignmentsData);
      setLoading(false);
    };

    checkAccessAndLoad();
  }, [navigate]);

  const openReviewModal = async (assignment: ReviewAssignment) => {
    setSelectedAssignment(assignment);
    setError(null);

    const filesData = await getSubmissionFiles(String(assignment.submission));
    setFiles(filesData);

    if (assignment.review) {
      setExistingReview(assignment.review);
      setRecommendation(assignment.review.recommendation || '');
      setCommentsToAuthor(assignment.review.summary || '');
      setCommentsToEditor(assignment.review.confidential_to_editor || '');
    } else {
      setExistingReview(null);
      setRecommendation('');
      setCommentsToAuthor('');
      setCommentsToEditor('');
    }
  };

  const closeReviewModal = () => {
    setSelectedAssignment(null);
    setFiles([]);
    setExistingReview(null);
    setRecommendation('');
    setCommentsToAuthor('');
    setCommentsToEditor('');
    setError(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedAssignment) return;

    if (!recommendation) {
      setError('Please select a recommendation.');
      return;
    }

    if (!commentsToAuthor.trim()) {
      setError('Comments to author are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await submitReview(String(selectedAssignment.id), {
        summary: commentsToAuthor,
        strengths: '',
        weaknesses: '',
        confidential_to_editor: commentsToEditor,
        recommendation: recommendation as any,
      });

      if (submitError) throw new Error(submitError.detail || 'Failed to submit review');

      const updatedAssignments = await getMyAssignments();
      setAssignments(updatedAssignments);

      closeReviewModal();
      alert('Review submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadFile = (file: any) => {
    const url = file.manuscript_url || file.file || file.storage_path;
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('File URL not available');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return (
          <span className="bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            Invited
          </span>
        );
      case 'accepted':
        return (
          <span className="bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Completed
          </span>
        );
      case 'declined':
        return (
          <span className="bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">Declined</span>
        );
      default:
        return (
          <span className="bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">{status}</span>
        );
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
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
          ></div>
          <p style={{ color: '#64748B' }}>Loading your review assignments...</p>
        </div>
      </div>
    );
  }

  if (error && assignments.length === 0) {
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
            borderTop: '4px solid #F59E0B',
          }}
        >
          <AlertCircle className="mx-auto mb-4 h-16 w-16" style={{ color: '#F59E0B' }} />
          <h1 className="mb-3 text-2xl font-bold" style={{ color: '#0B1C4D' }}>
            No Review Assignments
          </h1>
          <p className="mb-6" style={{ color: '#64748B' }}>
            {error}
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
            Reviewer Dashboard
          </h1>
          <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Review manuscripts and provide feedback
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 border border-gray-300 bg-white">
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="mb-2 text-2xl font-bold">Reviewer Dashboard</h1>
            <p className="text-blue-100">Manage your peer review assignments</p>
          </div>

          <div className="p-6">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="border border-blue-200 bg-blue-50 p-4">
                <div className="text-2xl font-bold text-blue-900">
                  {assignments.filter((a) => a.status === 'accepted').length}
                </div>
                <div className="text-sm text-blue-700">Active Reviews</div>
              </div>
              <div className="border border-green-200 bg-green-50 p-4">
                <div className="text-2xl font-bold text-green-900">
                  {assignments.filter((a) => a.status === 'completed').length}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="border border-yellow-200 bg-yellow-50 p-4">
                <div className="text-2xl font-bold text-yellow-900">
                  {assignments.filter((a) => a.status === 'invited').length}
                </div>
                <div className="text-sm text-yellow-700">Pending Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="border border-gray-300 bg-white">
          <div className="border-b border-gray-300 bg-gray-50 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Review Assignments</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <FileText className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      <h3 className="font-medium text-gray-900">{assignment.submission_title}</h3>
                    </div>

                    <p className="mb-3 ml-8 line-clamp-2 text-sm text-gray-600">
                      {assignment.submission_abstract}
                    </p>

                    <div className="ml-8 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Status:</span>
                        {getStatusBadge(assignment.status)}
                      </div>

                      {assignment.due_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">Due:</span>
                          <span
                            className={
                              isOverdue(assignment.due_date)
                                ? 'font-medium text-red-600'
                                : 'text-gray-900'
                            }
                          >
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          {isOverdue(assignment.due_date) && (
                            <span className="text-xs text-red-600">(Overdue)</span>
                          )}
                        </div>
                      )}

                      {(assignment as any).submission_topic_area && (
                        <div className="flex items-center gap-1">
                          <span className="bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            {(assignment as any).submission_topic_area}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {assignment.status === 'completed' ? (
                      <button
                        onClick={() => openReviewModal(assignment)}
                        className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        View Review
                      </button>
                    ) : assignment.status === 'accepted' ? (
                      <button
                        onClick={() => openReviewModal(assignment)}
                        className="flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                        Write Review
                      </button>
                    ) : (
                      <button
                        onClick={() => openReviewModal(assignment)}
                        className="border border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedAssignment && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black p-4">
          <div className="my-8 w-full max-w-4xl border border-gray-300 bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {existingReview ? 'Review Submitted' : 'Write Review'}
              </h2>
              <button onClick={closeReviewModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
              {/* Manuscript Info */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <h3 className="mb-2 font-semibold text-gray-900">
                  {selectedAssignment.submission_title}
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  {selectedAssignment.submission_abstract}
                </p>
                {selectedAssignment.due_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Review Due:</span>
                    <span
                      className={
                        isOverdue(selectedAssignment.due_date)
                          ? 'font-medium text-red-600'
                          : 'text-gray-900'
                      }
                    >
                      {new Date(selectedAssignment.due_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Files */}
              {files.length > 0 && (
                <div className="mb-6 border-b border-gray-200 pb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Submission Files</h4>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.file_type}
                            </div>
                            <div className="text-xs text-gray-500">{file.file_name}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadFile(file)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Form */}
              {!existingReview ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Recommendation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select recommendation...</option>
                      <option value="accept">Accept</option>
                      <option value="minor_revision">Minor Revision</option>
                      <option value="major_revision">Major Revision</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Comments to Author <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={commentsToAuthor}
                      onChange={(e) => setCommentsToAuthor(e.target.value)}
                      rows={8}
                      placeholder="Provide constructive feedback for the author..."
                      className="w-full resize-none border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      These comments will be shared with the author.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Confidential Comments to Editor
                    </label>
                    <textarea
                      value={commentsToEditor}
                      onChange={(e) => setCommentsToEditor(e.target.value)}
                      rows={6}
                      placeholder="Optional confidential comments for the editor only..."
                      className="w-full resize-none border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      These comments are confidential and will not be shared with the author.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Recommendation
                    </label>
                    <div className="border border-gray-200 bg-gray-50 px-3 py-2 capitalize">
                      {existingReview.recommendation.replace('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Comments to Author
                    </label>
                    <div className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm whitespace-pre-wrap">
                      {existingReview.comments_to_author}
                    </div>
                  </div>

                  {existingReview.comments_to_editor && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Confidential Comments to Editor
                      </label>
                      <div className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm whitespace-pre-wrap">
                        {existingReview.comments_to_editor}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 border border-green-200 bg-green-50 p-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Review submitted successfully</p>
                      {existingReview.submitted_at && (
                        <p className="mt-1 text-xs">
                          Submitted on{' '}
                          {new Date(existingReview.submitted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!existingReview && (
              <div className="flex justify-end gap-3 border-t border-gray-300 bg-gray-50 p-4">
                <button
                  onClick={closeReviewModal}
                  disabled={submitting}
                  className="border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
