import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Mail,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { TokenManager } from '../lib/api';
import { getMyProfile, getAssignmentByToken, acceptByToken, declineByToken } from '../lib/queries-api';

export function ReviewInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoadInvitation = async () => {
      setLoading(true);
      setError(null);

      if (!TokenManager.getAccessToken()) {
        const currentUrl = `/review-invite?token=${token}&action=${action || ''}`;
        sessionStorage.setItem('returnUrl', currentUrl);
        navigate('/login');
        return;
      }

      // Get user profile to check email
      const profile = await getMyProfile();
      if (!profile || !profile.email) {
        setError('Unable to retrieve your profile information.');
        setLoading(false);
        return;
      }

      setUserEmail(profile.email);

      // Validate token
      if (!token) {
        setError('Invalid invitation link: missing token.');
        setLoading(false);
        return;
      }

      // Load invitation via REST API
      const assignmentData = await getAssignmentByToken(token);

      if (!assignmentData) {
        setError('Invalid or expired invitation link.');
        setLoading(false);
        return;
      }

      // Validate invitation status
      if (assignmentData.status !== 'invited') {
        if (assignmentData.status === 'accepted') {
          setError('This invitation has already been accepted.');
        } else if (assignmentData.status === 'declined') {
          setError('This invitation has already been declined.');
        } else {
          setError('This invitation is no longer available.');
        }
        setLoading(false);
        return;
      }

      // Validate email match
      if (
        assignmentData.reviewer_email &&
        profile.email.toLowerCase() !== assignmentData.reviewer_email.toLowerCase()
      ) {
        setError(
          `This invitation is for a different email address (${assignmentData.reviewer_email}). ` +
          `You are currently logged in as ${profile.email}.`
        );
        setLoading(false);
        return;
      }

      setInvitation(assignmentData);
      setLoading(false);

      // If action is already specified in URL, process it automatically
      if (action === 'accept' || action === 'decline') {
        await processAction(action);
      }
    };

    checkAuthAndLoadInvitation();
  }, [token, action, navigate]);

  const processAction = async (actionType: string) => {
    setProcessing(true);
    setError(null);

    try {
      if (actionType === 'accept') {
        const { error: respError } = await acceptByToken(token!);
        if (respError) throw new Error(respError.detail || 'Failed to accept');
      } else {
        const { error: respError } = await declineByToken(token!);
        if (respError) throw new Error(respError.detail || 'Failed to decline');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error processing invitation response:', err);
      setError('Failed to process your response: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;
    await processAction('accept');
  };

  const handleDecline = async () => {
    if (!invitation) return;
    await processAction('decline');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md border border-gray-300 bg-white p-8 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md border border-gray-300 bg-white p-8">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
            Unable to Process Invitation
          </h1>
          <p className="mb-6 text-center text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    const wasAccepted = action === 'accept';
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md border border-gray-300 bg-white p-8">
          {wasAccepted ? (
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="mx-auto mb-4 h-16 w-16 text-gray-500" />
          )}

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            {wasAccepted ? 'Invitation Accepted!' : 'Invitation Declined'}
          </h1>

          <p className="mb-6 text-center text-gray-600">
            {wasAccepted
              ? 'Thank you for accepting this review invitation. You can now access the submission materials in your reviewer dashboard.'
              : 'Your response has been recorded. Thank you for your time.'}
          </p>

          {wasAccepted && (
            <>
              <div className="mb-6 border border-blue-200 bg-blue-50 p-4">
                <h2 className="mb-2 font-semibold text-blue-900">Next Steps:</h2>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Access the manuscript in your reviewer dashboard</li>
                  <li>• Review the submission materials</li>
                  {invitation?.due_date && (
                    <li>
                      • Submit your review by{' '}
                      <strong>{new Date(invitation.due_date).toLocaleDateString()}</strong>
                    </li>
                  )}
                </ul>
              </div>

              <button
                onClick={() => navigate('/review/dashboard')}
                className="mb-3 flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Go to Reviewer Dashboard
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show invitation details and action buttons
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 border border-gray-300 bg-white">
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="mb-2 text-2xl font-bold">Review Invitation</h1>
            <p className="text-blue-100">You have been invited to review a manuscript</p>
          </div>

          <div className="space-y-6 p-6">
            {/* User Info */}
            <div className="border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>
                  Invitation sent to: <strong>{invitation?.reviewer_email}</strong>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Logged in as: <strong>{userEmail}</strong>
                </span>
              </div>
            </div>

            {/* Manuscript Details */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5" />
                Manuscript Details
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="mb-1 font-medium text-gray-900">
                    {invitation?.submission_title || 'Untitled Submission'}
                  </h3>
                </div>

                {invitation?.submission_abstract && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Abstract</h4>
                    <p className="line-clamp-6 text-sm leading-relaxed text-gray-600">
                      {invitation.submission_abstract}
                    </p>
                  </div>
                )}

                {(invitation as any)?.submission_topic_area && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Topic</h4>
                    <span className="inline-block bg-blue-100 px-3 py-1 text-sm text-blue-800">
                      {(invitation as any).submission_topic_area}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Clock className="h-5 w-5" />
                Review Timeline
              </h2>

              <div className="space-y-2 text-sm">
                {invitation?.due_date && (
                  <div className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-600">Review Due:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(invitation.due_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {invitation?.invited_at && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Invited:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(invitation.invited_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Commitment Message */}
            <div className="border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-2 font-semibold text-yellow-900">Review Commitment</h3>
              <p className="text-sm text-yellow-800">
                By accepting this invitation, you commit to:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-800">
                <li>Reviewing the manuscript thoroughly and objectively</li>
                <li>Maintaining confidentiality of the submission</li>
                <li>Submitting your review by the specified deadline</li>
                <li>Disclosing any potential conflicts of interest</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 border-t border-gray-200 pt-4">
              <button
                onClick={handleDecline}
                disabled={processing}
                className="flex-1 border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                {processing ? 'Processing...' : 'Decline Invitation'}
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {processing ? 'Processing...' : 'Accept Invitation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
