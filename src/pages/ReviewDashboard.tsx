import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  X,
  Send
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  getMyAssignments, 
  getSubmissionFiles, 
  getExistingReview 
} from '../lib/queries';

interface ReviewAssignment {
  id: string;
  submission_id: string;
  invited_email: string;
  status: string;
  response_due_at: string | null;
  review_due_at: string | null;
  invited_at: string;
  submissions: {
    id: string;
    title: string;
    abstract: string;
    keywords: string[];
    topic_area: string;
    submitted_at: string;
  };
}

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

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
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
    
    // Load submission files
    const filesData = await getSubmissionFiles(assignment.submission_id);
    setFiles(filesData);
    
    // Load existing review
    const reviewData = await getExistingReview(assignment.id);
    if (reviewData) {
      setExistingReview(reviewData);
      setRecommendation(reviewData.recommendation || '');
      setCommentsToAuthor(reviewData.comments_to_author || '');
      setCommentsToEditor(reviewData.comments_to_editor || '');
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
      // Insert or update review
      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            recommendation,
            comments_to_author: commentsToAuthor,
            comments_to_editor: commentsToEditor,
            submitted_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);

        if (updateError) throw updateError;
      } else {
        // Insert new review
        const { error: insertError } = await supabase
          .from('reviews')
          .insert({
            assignment_id: selectedAssignment.id,
            recommendation,
            comments_to_author: commentsToAuthor,
            comments_to_editor: commentsToEditor,
            submitted_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // Update assignment status to completed
      const { error: assignmentError } = await supabase
        .from('review_assignments')
        .update({
          status: 'completed',
          review_submitted_at: new Date().toISOString()
        })
        .eq('id', selectedAssignment.id);

      if (assignmentError) throw assignmentError;

      // Reload assignments
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

  const downloadFile = async (file: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('make-e44d10eb-submissions')
        .createSignedUrl(file.storage_path, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium">Invited</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium">Completed</span>;
      case 'declined':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium">Declined</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: '#64748B' }}>Loading your review assignments...</p>
        </div>
      </div>
    );
  }

  if (error && assignments.length === 0) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }} className="flex items-center justify-center px-4">
        <div 
          className="bg-white text-center max-w-md w-full"
          style={{
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.15)',
            borderTop: '4px solid #F59E0B'
          }}
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#F59E0B' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#0B1C4D' }}>No Review Assignments</h1>
          <p className="mb-6" style={{ color: '#64748B' }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 font-medium rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)'
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
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#FFFFFF' }}>Reviewer Dashboard</h1>
          <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Review manuscripts and provide feedback
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white border border-gray-300 mb-6">
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Reviewer Dashboard</h1>
            <p className="text-blue-100">
              Manage your peer review assignments
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 p-4">
                <div className="text-2xl font-bold text-blue-900">
                  {assignments.filter(a => a.status === 'accepted').length}
                </div>
                <div className="text-sm text-blue-700">Active Reviews</div>
              </div>
              <div className="bg-green-50 border border-green-200 p-4">
                <div className="text-2xl font-bold text-green-900">
                  {assignments.filter(a => a.status === 'completed').length}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-4">
                <div className="text-2xl font-bold text-yellow-900">
                  {assignments.filter(a => a.status === 'invited').length}
                </div>
                <div className="text-sm text-yellow-700">Pending Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white border border-gray-300">
          <div className="border-b border-gray-300 bg-gray-50 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Review Assignments</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900">
                        {assignment.submissions.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 ml-8">
                      {assignment.submissions.abstract}
                    </p>

                    <div className="flex flex-wrap gap-4 ml-8 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Status:</span>
                        {getStatusBadge(assignment.status)}
                      </div>
                      
                      {assignment.review_due_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Due:</span>
                          <span className={isOverdue(assignment.review_due_at) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                            {new Date(assignment.review_due_at).toLocaleDateString()}
                          </span>
                          {isOverdue(assignment.review_due_at) && (
                            <span className="text-red-600 text-xs">(Overdue)</span>
                          )}
                        </div>
                      )}

                      {assignment.submissions.topic_area && (
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs">
                            {assignment.submissions.topic_area}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {assignment.status === 'completed' ? (
                      <button
                        onClick={() => openReviewModal(assignment)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        View Review
                      </button>
                    ) : assignment.status === 'accepted' ? (
                      <button
                        onClick={() => openReviewModal(assignment)}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Write Review
                      </button>
                    ) : (
                      <button
                        onClick={() => openReviewModal(assignment)}
                        className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-gray-300 max-w-4xl w-full my-8">
            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-300 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {existingReview ? 'Review Submitted' : 'Write Review'}
              </h2>
              <button
                onClick={closeReviewModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Manuscript Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedAssignment.submissions.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedAssignment.submissions.abstract}
                </p>
                {selectedAssignment.review_due_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Review Due:</span>
                    <span className={isOverdue(selectedAssignment.review_due_at) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {new Date(selectedAssignment.review_due_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Files */}
              {files.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Submission Files</h4>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.file_type}</div>
                            <div className="text-xs text-gray-500">{file.file_name}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadFile(file)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recommendation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select recommendation...</option>
                      <option value="accept">Accept</option>
                      <option value="minor_revision">Minor Revision</option>
                      <option value="major_revision">Major Revision</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comments to Author <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={commentsToAuthor}
                      onChange={(e) => setCommentsToAuthor(e.target.value)}
                      rows={8}
                      placeholder="Provide constructive feedback for the author..."
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      These comments will be shared with the author.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confidential Comments to Editor
                    </label>
                    <textarea
                      value={commentsToEditor}
                      onChange={(e) => setCommentsToEditor(e.target.value)}
                      rows={6}
                      placeholder="Optional confidential comments for the editor only..."
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      These comments are confidential and will not be shared with the author.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recommendation
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 capitalize">
                      {existingReview.recommendation.replace('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comments to Author
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 whitespace-pre-wrap text-sm">
                      {existingReview.comments_to_author}
                    </div>
                  </div>

                  {existingReview.comments_to_editor && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confidential Comments to Editor
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 whitespace-pre-wrap text-sm">
                        {existingReview.comments_to_editor}
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 p-3 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Review submitted successfully</p>
                      {existingReview.submitted_at && (
                        <p className="text-xs mt-1">
                          Submitted on {new Date(existingReview.submitted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
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
              <div className="border-t border-gray-300 p-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={closeReviewModal}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
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