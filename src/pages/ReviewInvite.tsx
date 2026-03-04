import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Mail,
  FileText,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getMyProfile } from '../lib/queries';

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

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Save current URL to return after login
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

      // Load invitation from review_assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('review_assignments')
        .select(`
          id,
          submission_id,
          invited_email,
          status,
          response_due_at,
          review_due_at,
          invited_at,
          invite_expires_at,
          submissions (
            id,
            title,
            abstract,
            topic,
            topic_area
          )
        `)
        .eq('invite_token', token)
        .limit(1)
        .single();

      if (assignmentError || !assignmentData) {
        console.error('Error loading invitation:', assignmentError);
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

      // Validate expiration
      if (assignmentData.invite_expires_at) {
        const expiresAt = new Date(assignmentData.invite_expires_at);
        const now = new Date();
        if (expiresAt < now) {
          setError('This invitation has expired.');
          setLoading(false);
          return;
        }
      }

      // Validate email match
      if (assignmentData.invited_email.toLowerCase() !== profile.email.toLowerCase()) {
        setError(
          `This invitation is for a different email address (${assignmentData.invited_email}). ` +
          `You are currently logged in as ${profile.email}.`
        );
        setLoading(false);
        return;
      }

      setInvitation(assignmentData);
      setLoading(false);

      // If action is already specified in URL, process it automatically
      if (action === 'accept' || action === 'decline') {
        await processAction(action, assignmentData.id, session.user.id);
      }
    };

    checkAuthAndLoadInvitation();
  }, [token, action, navigate]);

  const processAction = async (actionType: string, assignmentId: string, userId: string) => {
    setProcessing(true);
    setError(null);

    try {
      const updateData: any = {};

      if (actionType === 'accept') {
        updateData.status = 'accepted';
        updateData.reviewer_user_id = userId;
      } else {
        updateData.status = 'declined';
      }

      const { error: updateError } = await supabase
        .from('review_assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (updateError) {
        throw updateError;
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await processAction('accept', invitation.id, session.user.id);
  };

  const handleDecline = async () => {
    if (!invitation) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await processAction('decline', invitation.id, session.user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white border border-gray-300 p-8 max-w-md w-full text-center">
          <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white border border-gray-300 p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Unable to Process Invitation
          </h1>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white border border-gray-300 p-8 max-w-md w-full">
          {wasAccepted ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          )}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {wasAccepted ? 'Invitation Accepted!' : 'Invitation Declined'}
          </h1>
          
          <p className="text-gray-600 mb-6 text-center">
            {wasAccepted
              ? 'Thank you for accepting this review invitation. You can now access the submission materials in your reviewer dashboard.'
              : 'Your response has been recorded. Thank you for your time.'}
          </p>

          {wasAccepted && (
            <>
              <div className="bg-blue-50 border border-blue-200 p-4 mb-6">
                <h2 className="font-semibold text-blue-900 mb-2">Next Steps:</h2>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Access the manuscript in your reviewer dashboard</li>
                  <li>• Review the submission materials</li>
                  {invitation?.review_due_at && (
                    <li>
                      • Submit your review by{' '}
                      <strong>{new Date(invitation.review_due_at).toLocaleDateString()}</strong>
                    </li>
                  )}
                </ul>
              </div>

              <button
                onClick={() => navigate('/review/dashboard')}
                className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 mb-3"
              >
                Go to Reviewer Dashboard
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show invitation details and action buttons
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-300 mb-6">
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Review Invitation</h1>
            <p className="text-blue-100">
              You have been invited to review a manuscript
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>Invitation sent to: <strong>{invitation?.invited_email}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <CheckCircle className="w-4 h-4" />
                <span>Logged in as: <strong>{userEmail}</strong></span>
              </div>
            </div>

            {/* Manuscript Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Manuscript Details
              </h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {invitation?.submissions?.title || 'Untitled Submission'}
                  </h3>
                </div>

                {invitation?.submissions?.abstract && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Abstract</h4>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-6">
                      {invitation.submissions.abstract}
                    </p>
                  </div>
                )}

                {(invitation?.submissions?.topic_area || invitation?.submissions?.topic) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Topic</h4>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm">
                      {invitation.submissions.topic_area || invitation.submissions.topic}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Review Timeline
              </h2>
              
              <div className="space-y-2 text-sm">
                {invitation?.response_due_at && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Response Due:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(invitation.response_due_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {invitation?.review_due_at && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Review Due:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(invitation.review_due_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
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
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Commitment Message */}
            <div className="bg-yellow-50 border border-yellow-200 p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Review Commitment</h3>
              <p className="text-sm text-yellow-800">
                By accepting this invitation, you commit to:
              </p>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                <li>Reviewing the manuscript thoroughly and objectively</li>
                <li>Maintaining confidentiality of the submission</li>
                <li>Submitting your review by the specified deadline</li>
                <li>Disclosing any potential conflicts of interest</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleDecline}
                disabled={processing}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
              >
                {processing ? 'Processing...' : 'Decline Invitation'}
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
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