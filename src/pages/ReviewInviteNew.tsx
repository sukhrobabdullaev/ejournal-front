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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login with return URL
        navigate(`/login?returnTo=/review/invite/${token}`);
        return;
      }

      const updateData: any = {
        status: accepted ? 'accepted' : 'declined',
        updated_at: new Date().toISOString()
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle size={48} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This invitation link is invalid or has expired.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700"
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-green-50 border border-green-300 p-8 text-center mb-8">
            <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Invitation Accepted</h2>
            <p className="text-green-800">
              You have accepted this review invitation on{' '}
              {assignment.accepted_at ? new Date(assignment.accepted_at).toLocaleDateString() : 'an earlier date'}.
            </p>
          </div>

          {/* Submission Details */}
          <div className="bg-white border border-gray-300 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manuscript Details</h3>
            
            <div className="mb-4">
              <span className="text-sm text-gray-600">Title:</span>
              <p className="text-base font-medium text-gray-900 mt-1">{assignment.submissions?.title || 'Untitled'}</p>
            </div>

            {assignment.submissions?.topic_area && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">Topic Area:</span>
                <p className="text-sm text-gray-900 mt-1">{assignment.submissions.topic_area}</p>
              </div>
            )}

            {assignment.submissions?.keywords && assignment.submissions.keywords.length > 0 && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">Keywords:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {assignment.submissions.keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs border border-gray-300"
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
                <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                  {assignment.submissions.abstract}
                </p>
              </div>
            )}
          </div>

          {/* Files Section */}
          {files.length > 0 && (
            <div className="bg-white border border-gray-300 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manuscript Files</h3>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center">
                      <FileText size={20} className="text-gray-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.original_filename}</p>
                        <p className="text-xs text-gray-500">
                          {file.file_type === 'manuscript_pdf' ? 'Manuscript PDF' : 'Supplementary File'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
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
              className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700"
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Declined</h2>
          <p className="text-gray-600 mb-6">
            You declined this review invitation on{' '}
            {assignment.declined_at ? new Date(assignment.declined_at).toLocaleDateString() : 'an earlier date'}.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700"
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-gray-300 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Invitation</h1>
          <p className="text-base text-gray-600">
            You have been invited to review a manuscript for NEXA-JCT
          </p>
        </div>

        {/* Submission Details */}
        <div className="bg-white border border-gray-300 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manuscript Details</h3>
          
          <div className="mb-4">
            <span className="text-sm text-gray-600">Title:</span>
            <p className="text-base font-medium text-gray-900 mt-1">{assignment.submissions?.title || 'Untitled'}</p>
          </div>

          {assignment.submissions?.topic_area && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">Topic Area:</span>
              <p className="text-sm text-gray-900 mt-1">{assignment.submissions.topic_area}</p>
            </div>
          )}

          {assignment.submissions?.keywords && assignment.submissions.keywords.length > 0 && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">Keywords:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {assignment.submissions.keywords.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs border border-gray-300"
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
              <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                {assignment.submissions.abstract}
              </p>
            </div>
          )}
        </div>

        {/* Decision Section */}
        <div className="bg-blue-50 border border-blue-300 p-6 mb-6">
          <h3 className="text-base font-semibold text-blue-900 mb-2">Review Timeline</h3>
          <p className="text-sm text-blue-800">
            Please accept or decline this invitation within 7 days. If you accept, you will have access to the full manuscript 
            and will be expected to submit your review within 21 days.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleResponse(false)}
            disabled={responding}
            className="flex items-center px-8 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <XCircle size={18} className="mr-2" />
            {responding ? 'Processing...' : 'Decline'}
          </button>
          <button
            onClick={() => handleResponse(true)}
            disabled={responding}
            className="flex items-center px-8 py-3 bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle size={18} className="mr-2" />
            {responding ? 'Processing...' : 'Accept Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}