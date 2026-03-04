import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, FileText, Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';
import type { ReviewAssignment, Recommendation } from '../lib/api';
import {
  getAssignmentById,
  acceptReviewInvitation,
  declineReviewInvitation,
  submitReview,
} from '../lib/queries-api';

type RouteParams = {
  id: string;
};

export function ReviewAssignmentDetail() {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<ReviewAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [summary, setSummary] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [confidentialToEditor, setConfidentialToEditor] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation>('accept');

  const [actionLoading, setActionLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Assignment ID is missing.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAssignmentById(id);
        if (!data) {
          setError('Assignment not found or access denied.');
          setAssignment(null);
          return;
        }
        applyAssignment(data);
      } catch (err: any) {
        console.error('Error loading assignment:', err);
        setError(err.message || 'Failed to load assignment.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const applyAssignment = (data: ReviewAssignment) => {
    setAssignment(data);
    if (data.review) {
      setSummary(data.review.summary || '');
      setStrengths(data.review.strengths || '');
      setWeaknesses(data.review.weaknesses || '');
      setConfidentialToEditor(data.review.confidential_to_editor || '');
      setRecommendation(data.review.recommendation || 'accept');
    } else {
      setSummary('');
      setStrengths('');
      setWeaknesses('');
      setConfidentialToEditor('');
      setRecommendation('accept');
    }
  };

  const handleAccept = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      const { data, error: apiError } = await acceptReviewInvitation(id);
      if (apiError) {
        setError(apiError.detail || 'Failed to accept invitation.');
        return;
      }
      if (data) {
        applyAssignment(data);
        setSuccess('Invitation accepted. You can now submit your review.');
      }
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to accept invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      const { data, error: apiError } = await declineReviewInvitation(id);
      if (apiError) {
        setError(apiError.detail || 'Failed to decline invitation.');
        return;
      }
      if (data) {
        applyAssignment(data);
        setSuccess('Invitation declined.');
      }
    } catch (err: any) {
      console.error('Error declining invitation:', err);
      setError(err.message || 'Failed to decline invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!id || !assignment) return;

    if (!summary.trim()) {
      setError('Summary is required.');
      return;
    }

    if (!strengths.trim() || !weaknesses.trim()) {
      setError('Please describe both strengths and weaknesses.');
      return;
    }

    try {
      setSubmittingReview(true);
      setError(null);
      setSuccess(null);

      const { data, error: apiError } = await submitReview(id, {
        summary: summary.trim(),
        strengths: strengths.trim(),
        weaknesses: weaknesses.trim(),
        confidential_to_editor: confidentialToEditor.trim(),
        recommendation,
      });

      if (apiError) {
        setError(apiError.detail || 'Failed to submit review.');
        return;
      }

      if (data) {
        applyAssignment(data);
        setSuccess('Review submitted successfully.');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
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
          <p style={{ color: '#64748B' }}>Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
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
            borderTop: '4px solid #F59E0B',
          }}
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#F59E0B' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#0B1C4D' }}>
            Assignment Not Found
          </h1>
          <p className="mb-6" style={{ color: '#64748B' }}>
            {error || 'We could not find this review assignment.'}
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

  const isInvited = assignment.status === 'invited';
  const isAcceptedOrSubmitted =
    assignment.status === 'accepted' || assignment.status === 'review_submitted';

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{ backgroundColor: '#0B1C4D', paddingTop: '40px', paddingBottom: '40px' }}
      >
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-sm text-blue-100 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
          <div className="text-right">
            <p className="text-xs text-blue-100 mb-1">Assignment ID</p>
            <p className="text-sm font-mono text-white">
              {assignment.id.toString().toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="bg-white border border-gray-300 p-6 space-y-6">
          {/* Manuscript overview */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {assignment.submission_title || 'Untitled Manuscript'}
              </h1>
              <p className="text-sm text-gray-600 mb-2">
                Status:{' '}
                <span className="font-medium">
                  {assignment.status.replace('_', ' ')}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Invited:{' '}
                  {new Date(assignment.invited_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {assignment.due_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due:{' '}
                    {new Date(assignment.due_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Abstract & manuscript link */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Abstract</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {assignment.submission_abstract || 'No abstract provided.'}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Manuscript</h2>
              {assignment.manuscript_url ? (
                <a
                  href={assignment.manuscript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Open Manuscript PDF</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 uppercase">View</span>
                </a>
              ) : (
                <p className="text-sm text-gray-500">No manuscript file available.</p>
              )}
            </div>
          </div>

          {/* Invitation actions */}
          {isInvited && (
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? 'Updating...' : 'Accept Invitation'}
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 disabled:bg-gray-100 disabled:text-red-400 disabled:cursor-not-allowed border border-red-200"
              >
                <XIcon />
                Decline
              </button>
            </div>
          )}

          {/* Review form */}
          {isAcceptedOrSubmitted && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h2 className="text-sm font-semibold text-gray-800">
                {assignment.status === 'review_submitted'
                  ? 'Update Your Review'
                  : 'Submit Your Review'}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Summary *
                  </label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strengths *
                  </label>
                  <textarea
                    rows={3}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weaknesses *
                  </label>
                  <textarea
                    rows={3}
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidential Comments to Editor
                  </label>
                  <textarea
                    rows={3}
                    value={confidentialToEditor}
                    onChange={(e) => setConfidentialToEditor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Recommendation *</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700">
                    {(['accept', 'minor_revision', 'major_revision', 'reject'] as Recommendation[]).map(
                      (value) => (
                        <label
                          key={value}
                          className="flex items-center gap-2 px-2 py-1 border border-gray-300 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            value={value}
                            checked={recommendation === value}
                            onChange={() => setRecommendation(value)}
                          />
                          <span className="capitalize">
                            {value.replace('_', ' ')}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submittingReview ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const XIcon: React.FC = () => <span className="text-base leading-none">×</span>;

