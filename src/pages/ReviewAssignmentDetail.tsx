import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, FileText, Clock, AlertCircle, CheckCircle, Send, X } from 'lucide-react';
import type { ReviewAssignment, Recommendation } from '../lib/api';
import {
  getAssignmentById,
  acceptReviewInvitation,
  declineReviewInvitation,
  submitReview,
} from '../lib/queries-api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function ReviewAssignmentDetail() {
  const { id } = useParams<{ id: string }>();
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

  useEffect(() => {
    if (!assignment) return;
    if (assignment.review) {
      setSummary(assignment.review.summary || '');
      setStrengths(assignment.review.strengths || '');
      setWeaknesses(assignment.review.weaknesses || '');
      setConfidentialToEditor(assignment.review.confidential_to_editor || '');
      setRecommendation(assignment.review.recommendation || 'accept');
    }
  }, [assignment]);

  const invalidateAssignment = () =>
    queryClient.invalidateQueries({ queryKey: ['assignment', id] });

  const acceptMutation = useMutation({
    mutationFn: () => acceptReviewInvitation(id!),
    onSuccess: ({ error: apiError }: { error?: { detail: string } }) => {
      if (apiError) {
        setError(apiError.detail || 'Failed to accept invitation.');
        return;
      }
      setSuccess('Invitation accepted. You can now submit your review.');
      invalidateAssignment();
    },
    onError: (err: Error) => setError(err.message || 'Failed to accept invitation.'),
  });

  const declineMutation = useMutation({
    mutationFn: () => declineReviewInvitation(id!),
    onSuccess: ({ error: apiError }: { error?: { detail: string } }) => {
      if (apiError) {
        setError(apiError.detail || 'Failed to decline invitation.');
        return;
      }
      setSuccess('Invitation declined.');
      invalidateAssignment();
      setTimeout(() => navigate('/dashboard'), 2000);
    },
    onError: (err: Error) => setError(err.message || 'Failed to decline invitation.'),
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
    onSuccess: ({ error: apiError }: { error?: { detail: string } }) => {
      if (apiError) {
        setError(apiError.detail || 'Failed to submit review.');
        return;
      }
      setSuccess('Review submitted successfully.');
      invalidateAssignment();
    },
    onError: (err: Error) => setError(err.message || 'Failed to submit review.'),
  });

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg border-t-4 border-yellow-500 bg-white p-10 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Assignment Not Found</h1>
          <p className="mb-6 text-gray-600">
            {error || 'We could not find this review assignment.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white shadow-md hover:from-blue-700 hover:to-blue-800"
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
  const isCompleted = assignment.status === 'review_submitted';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className="text-right">
              <p className="mb-1 text-xs text-blue-200">Assignment ID</p>
              <p className="font-mono text-sm font-medium text-white">#{assignment.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Messages */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-4">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            <span className="flex-1 text-sm text-green-800">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <span className="flex-1 text-sm text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Manuscript Info */}
          <div className="border-b border-gray-200 bg-gray-50 p-6">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {assignment.submission_title || 'Untitled Manuscript'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-900 capitalize">Status:</span>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    assignment.status === 'invited'
                      ? 'bg-yellow-100 text-yellow-800'
                      : assignment.status === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : assignment.status === 'review_submitted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {assignment.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Invited: {new Date(assignment.invited_at).toLocaleDateString()}</span>
              </div>
              {assignment.due_date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span
                    className={`${
                      isOverdue(assignment.due_date) ? 'font-medium text-red-600' : 'text-gray-600'
                    }`}
                  >
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                    {isOverdue(assignment.due_date) && ' (Overdue)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Abstract */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">Abstract</h2>
              <p className="text-sm leading-relaxed text-gray-700">
                {assignment.submission_abstract || 'No abstract provided.'}
              </p>
            </div>

            {/* Manuscript File */}
            {assignment.manuscript_url && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-gray-700">Manuscript</h2>
                <a
                  href={assignment.manuscript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">View Manuscript PDF</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 uppercase">Open</span>
                </a>
              </div>
            )}

            {/* Invitation Actions */}
            {isInvited && (
              <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    acceptMutation.mutate();
                  }}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <CheckCircle className="h-4 w-4" />
                  {acceptMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to decline this invitation?')) {
                      setError(null);
                      setSuccess(null);
                      declineMutation.mutate();
                    }
                  }}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                  className="flex-1 rounded-lg border-2 border-red-200 bg-white px-6 py-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  {declineMutation.isPending ? 'Declining...' : 'Decline Invitation'}
                </button>
              </div>
            )}

            {/* Review Form */}
            {isAcceptedOrSubmitted && (
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isCompleted ? 'Your Review' : 'Submit Your Review'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Overall Summary <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      disabled={isCompleted}
                      placeholder="Provide a brief summary of your overall assessment..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Strengths <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      disabled={isCompleted}
                      placeholder="What are the main strengths of this work?"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Weaknesses <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={weaknesses}
                      onChange={(e) => setWeaknesses(e.target.value)}
                      disabled={isCompleted}
                      placeholder="What are the main weaknesses or areas for improvement?"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Confidential Comments to Editor
                    </label>
                    <textarea
                      rows={3}
                      value={confidentialToEditor}
                      onChange={(e) => setConfidentialToEditor(e.target.value)}
                      disabled={isCompleted}
                      placeholder="Optional confidential comments for the editor only..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      These comments will not be shared with the author.
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      Recommendation <span className="text-red-500">*</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {(
                        ['accept', 'minor_revision', 'major_revision', 'reject'] as Recommendation[]
                      ).map((value) => (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm transition-colors ${
                            recommendation === value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${isCompleted ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <input
                            type="radio"
                            value={value}
                            checked={recommendation === value}
                            onChange={() => setRecommendation(value)}
                            disabled={isCompleted}
                            className="h-4 w-4"
                          />
                          <span className="capitalize">{value.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      submitReviewMutation.mutate();
                    }}
                    disabled={submitReviewMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    <Send className="h-4 w-4" />
                    {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                )}

                {isCompleted && (
                  <div className="flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 p-4">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Review submitted successfully</p>
                      {assignment.review?.submitted_at && (
                        <p className="mt-1 text-xs">
                          Submitted on{' '}
                          {new Date(assignment.review.submitted_at).toLocaleDateString('en-US', {
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
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
