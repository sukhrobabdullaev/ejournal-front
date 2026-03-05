import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../lib/supabase';
import { getAssignmentByToken, getSubmissionFiles } from '../lib/queries';
import { CheckCircle, XCircle, FileText, Download } from 'lucide-react';

export function ReviewInviteNew() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      const assignmentData = await getAssignmentByToken(token!);

      if (!assignmentData) {
        setError('Invitation not found or expired');
        return;
      }

      setAssignment(assignmentData);

      // Load files if assignment is accepted (reviewer can view)
      if (assignmentData.status === 'accepted' && assignmentData.submissions?.id) {
        const filesData = await getSubmissionFiles(assignmentData.submissions.id);
        setFiles(filesData);
      }
    } catch (err: any) {
      console.error('Error loading invitation:', err);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (accepted: boolean) => {
    try {
      setResponding(true);
      setError(null);

      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login with return URL
        navigate(`/login?returnTo=/review/invite/${token}`);
        return;
      }

      const updateData: any = {
        status: accepted ? 'accepted' : 'declined',
        updated_at: new Date().toISOString(),
      };

      if (accepted) {
        updateData.accepted_at = new Date().toISOString();
      } else {
        updateData.declined_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('review_assignments')
        .update(updateData)
        .eq('id', assignment.id);

      if (updateError) {
        console.error('Error updating assignment:', updateError);
        setError('Failed to update assignment');
        return;
      }

      // Reload assignment data
      await loadInvitation();
    } catch (err: any) {
      console.error('Error responding to invitation:', err);
      setError('Failed to respond to invitation');
    } finally {
      setResponding(false);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('submission-files')
        .download(file.storage_path);

      if (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file');
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="max-w-md text-center">
          <XCircle size={48} className="mx-auto mb-4 text-red-600" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Invitation Not Found</h2>
          <p className="mb-6 text-gray-600">
            {error || 'This invitation link is invalid or has expired.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Already responded
  if (assignment.status === 'accepted') {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 border border-green-300 bg-green-50 p-8 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
            <h2 className="mb-2 text-2xl font-bold text-green-900">Invitation Accepted</h2>
            <p className="text-green-800">
              You have accepted this review invitation on{' '}
              {assignment.accepted_at
                ? new Date(assignment.accepted_at).toLocaleDateString()
                : 'an earlier date'}
              .
            </p>
          </div>

          {/* Submission Details */}
          <div className="mb-6 border border-gray-300 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Manuscript Details</h3>

            <div className="mb-4">
              <span className="text-sm text-gray-600">Title:</span>
              <p className="mt-1 text-base font-medium text-gray-900">
                {assignment.submissions?.title || 'Untitled'}
              </p>
            </div>

            {assignment.submissions?.topic_area && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">Topic Area:</span>
                <p className="mt-1 text-sm text-gray-900">{assignment.submissions.topic_area}</p>
              </div>
            )}

            {assignment.submissions?.keywords && assignment.submissions.keywords.length > 0 && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">Keywords:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {assignment.submissions.keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {assignment.submissions?.abstract && (
              <div>
                <span className="text-sm text-gray-600">Abstract:</span>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                  {assignment.submissions.abstract}
                </p>
              </div>
            )}
          </div>

          {/* Files Section */}
          {files.length > 0 && (
            <div className="mb-6 border border-gray-300 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Manuscript Files</h3>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center">
                      <FileText size={20} className="mr-3 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.original_filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.file_type === 'manuscript_pdf'
                            ? 'Manuscript PDF'
                            : 'Supplementary File'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (assignment.status === 'declined') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="max-w-md text-center">
          <XCircle size={48} className="mx-auto mb-4 text-gray-600" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Invitation Declined</h2>
          <p className="mb-6 text-gray-600">
            You declined this review invitation on{' '}
            {assignment.declined_at
              ? new Date(assignment.declined_at).toLocaleDateString()
              : 'an earlier date'}
            .
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pending invitation - show accept/decline options
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 border border-gray-300 bg-white p-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Review Invitation</h1>
          <p className="text-base text-gray-600">
            You have been invited to review a manuscript for NEXA-JCT
          </p>
        </div>

        {/* Submission Details */}
        <div className="mb-6 border border-gray-300 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Manuscript Details</h3>

          <div className="mb-4">
            <span className="text-sm text-gray-600">Title:</span>
            <p className="mt-1 text-base font-medium text-gray-900">
              {assignment.submissions?.title || 'Untitled'}
            </p>
          </div>

          {assignment.submissions?.topic_area && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">Topic Area:</span>
              <p className="mt-1 text-sm text-gray-900">{assignment.submissions.topic_area}</p>
            </div>
          )}

          {assignment.submissions?.keywords && assignment.submissions.keywords.length > 0 && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">Keywords:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {assignment.submissions.keywords.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {assignment.submissions?.abstract && (
            <div>
              <span className="text-sm text-gray-600">Abstract:</span>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {assignment.submissions.abstract}
              </p>
            </div>
          )}
        </div>

        {/* Decision Section */}
        <div className="mb-6 border border-blue-300 bg-blue-50 p-6">
          <h3 className="mb-2 text-base font-semibold text-blue-900">Review Timeline</h3>
          <p className="text-sm text-blue-800">
            Please accept or decline this invitation within 7 days. If you accept, you will have
            access to the full manuscript and will be expected to submit your review within 21 days.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleResponse(false)}
            disabled={responding}
            className="flex items-center border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <XCircle size={18} className="mr-2" />
            {responding ? 'Processing...' : 'Decline'}
          </button>
          <button
            onClick={() => handleResponse(true)}
            disabled={responding}
            className="flex items-center bg-green-600 px-8 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle size={18} className="mr-2" />
            {responding ? 'Processing...' : 'Accept Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}
