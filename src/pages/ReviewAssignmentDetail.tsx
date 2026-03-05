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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type RouteParams = {
  id: string;
};

export function ReviewAssignmentDetail() {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [summary, setSummary] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [confidentialToEditor, setConfidentialToEditor] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation>('accept');

  const { data: assignment, isLoading: loading } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => getAssignmentById(id!),
    enabled: !!id,
  });

  // Populate form fields when assignment or review changes
  useEffect(() => {
    if (!assignment) return;
    if (assignment.review) {
      setSummary(assignment.review.summary || '');
      setStrengths(assignment.review.strengths || '');
      setWeaknesses(assignment.review.weaknesses || '');
      setConfidentialToEditor(assignment.review.confidential_to_editor || '');
      setRecommendation(assignment.review.recommendation || 'accept');
    } else {
      setSummary('');
      setStrengths('');
      setWeaknesses('');
      setConfidentialToEditor('');
      setRecommendation('accept');
    }
  }, [assignment]);

  const invalidateAssignment = () =>
    queryClient.invalidateQueries({ queryKey: ['assignment', id] });

  const acceptMutation = useMutation({
    mutationFn: () => acceptReviewInvitation(id!),
    onSuccess: ({ error: apiError }) => {
      if (apiError) {
        setError(apiError.detail || 'Failed to accept invitation.');
        return;
      }
      setSuccess('Invitation accepted. You can now submit your review.');
      invalidateAssignment();
    },
    onError: (err: any) => setError(err.message || 'Failed to accept invitation.'),
  });

  const declineMutation = useMutation({
    mutationFn: () => declineReviewInvitation(id!),
    onSuccess: ({ error: apiError }) => {
      if (apiError) {
        setError(apiError.detail || 'Failed to decline invitation.');
        return;
      }
      setSuccess('Invitation declined.');
      invalidateAssignment();
    },
    onError: (err: any) => setError(err.message || 'Failed to decline invitation.'),
  });

  const submitReviewMutation = useMutation({
    mutationFn: () => {
      if (!summary.trim()) throw new Error('Summary is required.');
      if (!strengths.trim() || !weaknesses.trim())
        throw new Error('Please describe both strengths and weaknesses.');
      return submitReview(id!, {
        summary: summary.trim(),
        strengths: strengths.trim(),
        weaknesses: weaknesses.trim(),
        confidential_to_editor: confidentialToEditor.trim(),
        recommendation,
      });
    },
    onSuccess: ({ error: apiError }) => {
      if (apiError) {
        setError(apiError.detail || 'Failed to submit review.');
        return;
      }
      setSuccess('Review submitted successfully.');
      invalidateAssignment();
    },
    onError: (err: any) => setError(err.message || 'Failed to submit review.'),
  });

  const actionLoading = acceptMutation.isPending || declineMutation.isPending;
  const submittingReview = submitReviewMutation.isPending;

  const handleAccept = () => {
    setError(null);
    setSuccess(null);
    acceptMutation.mutate();
  };
  const handleDecline = () => {
    setError(null);
    setSuccess(null);
    declineMutation.mutate();
  };
  const handleSubmitReview = () => {
    setError(null);
    setSuccess(null);
    submitReviewMutation.mutate();
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
          <p style={{ color: '#64748B' }}>Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (!assignment && !loading) {
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
            Assignment Not Found
          </h1>
          <p className="mb-6" style={{ color: '#64748B' }}>
            {error || 'We could not find this review assignment.'}
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

  const isInvited = assignment.status === 'invited';
  const isAcceptedOrSubmitted =
    assignment.status === 'accepted' || assignment.status === 'review_submitted';

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-sm text-blue-100 hover:text-white"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="text-right">
            <p className="mb-1 text-xs text-blue-100">Assignment ID</p>
            <p className="font-mono text-sm text-white">{assignment.id.toString().toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 lg:px-8">
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

        <div className="space-y-6 border border-gray-300 bg-white p-6">
          {/* Manuscript overview */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="mb-1 text-2xl font-bold text-gray-900">
                {assignment.submission_title || 'Untitled Manuscript'}
              </h1>
              <p className="mb-2 text-sm text-gray-600">
                Status: <span className="font-medium">{assignment.status.replace('_', ' ')}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Invited:{' '}
                  {new Date(assignment.invited_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {assignment.due_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
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
              <h2 className="mb-1 text-sm font-semibold text-gray-700">Abstract</h2>
              <p className="text-sm leading-relaxed text-gray-700">
                {assignment.submission_abstract || 'No abstract provided.'}
              </p>
            </div>

            <div>
              <h2 className="mb-1 text-sm font-semibold text-gray-700">Manuscript</h2>
              {assignment.manuscript_url ? (
                <a
                  href={assignment.manuscript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-blue-200 bg-blue-50 p-2 text-sm transition-colors hover:bg-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
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
            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex flex-1 items-center justify-center gap-2 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <CheckCircle className="h-4 w-4" />
                {actionLoading ? 'Updating...' : 'Accept Invitation'}
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={actionLoading}
                className="flex-1 border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-red-400"
              >
                <XIcon />
                Decline
              </button>
            </div>
          )}

          {/* Review form */}
          {isAcceptedOrSubmitted && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h2 className="text-sm font-semibold text-gray-800">
                {assignment.status === 'review_submitted'
                  ? 'Update Your Review'
                  : 'Submit Your Review'}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Overall Summary *
                  </label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Strengths *
                  </label>
                  <textarea
                    rows={3}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Weaknesses *
                  </label>
                  <textarea
                    rows={3}
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Confidential Comments to Editor
                  </label>
                  <textarea
                    rows={3}
                    value={confidentialToEditor}
                    onChange={(e) => setConfidentialToEditor(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Recommendation *</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 sm:grid-cols-4">
                    {(
                      ['accept', 'minor_revision', 'major_revision', 'reject'] as Recommendation[]
                    ).map((value) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-2 border border-gray-300 px-2 py-1 hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          value={value}
                          checked={recommendation === value}
                          onChange={() => setRecommendation(value)}
                        />
                        <span className="capitalize">{value.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <Send className="h-4 w-4" />
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
