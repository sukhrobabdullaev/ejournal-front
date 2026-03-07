import React from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { ReviewAssignment } from '../../../lib/api';

interface ReviewDetailsModalProps {
  assignment: ReviewAssignment | null;
  onClose: () => void;
}

export const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({ assignment, onClose }) => {
  if (!assignment) return null;

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'accept':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <CheckCircle className="h-4 w-4" />
            Accept
          </span>
        );
      case 'reject':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            <XCircle className="h-4 w-4" />
            Reject
          </span>
        );
      case 'minor_revision':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            Minor Revision
          </span>
        );
      case 'major_revision':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            <AlertCircle className="h-4 w-4" />
            Major Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            {recommendation}
          </span>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'invited':
        return 'Invited';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'review_submitted':
        return 'Review Submitted';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
            <p className="mt-1 text-sm text-gray-600">{assignment.reviewer_email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Assignment Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Assignment Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className="ml-2 capitalize text-gray-900">{getStatusLabel(assignment.status)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Due Date:</span>
                <span className="ml-2 text-gray-900">
                  {assignment.due_date
                    ? new Date(assignment.due_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Not set'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Invited At:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(assignment.invited_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {assignment.responded_at && (
                <div>
                  <span className="font-medium text-gray-600">Responded At:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(assignment.responded_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Review Content */}
          {assignment.review ? (
            <div className="space-y-4">
              {/* Recommendation */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Recommendation</h3>
                <div>{getRecommendationBadge(assignment.review.recommendation)}</div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Summary</h3>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-800">
                    {assignment.review.summary || 'No summary provided'}
                  </p>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Strengths</h3>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-800">
                    {assignment.review.strengths || 'No strengths provided'}
                  </p>
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Weaknesses</h3>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-800">
                    {assignment.review.weaknesses || 'No weaknesses provided'}
                  </p>
                </div>
              </div>

              {/* Confidential Comments */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Confidential Comments to Editor
                </h3>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-800">
                    {assignment.review.confidential_to_editor || 'No confidential comments'}
                  </p>
                </div>
              </div>

              {/* Submitted At */}
              {assignment.review.submitted_at && (
                <div className="text-right text-sm text-gray-500">
                  Submitted on{' '}
                  {new Date(assignment.review.submitted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                {assignment.status === 'invited'
                  ? 'Reviewer has not yet responded to the invitation.'
                  : assignment.status === 'accepted'
                    ? 'Review is in progress. No review has been submitted yet.'
                    : assignment.status === 'declined'
                      ? 'Reviewer declined the invitation.'
                      : 'No review available.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
