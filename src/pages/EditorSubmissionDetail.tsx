import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FileText, ArrowLeft } from 'lucide-react';
import type { Submission } from '../lib/api';
import { getSubmissionByIdForEditor } from '../lib/queries-api';

export function EditorSubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Submission ID is missing in the URL');
      setLoading(false);
      return;
    }
    void load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSubmissionByIdForEditor(id!);
      if (!data) {
        setError('Submission not found or access denied');
        return;
      }
      setSubmission(data);
    } catch (err: any) {
      console.error('Error loading submission for editor:', err);
      setError(err.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm">{error || 'Submission not found'}</p>
          <button
            onClick={() => navigate('/editor')}
            className="px-6 py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Editor Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusLabel = getStatusLabel(submission.status);
  const statusClass = getStatusChipClasses(submission.status);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Editor Dashboard
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {submission.title || 'Untitled Submission'}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Submission ID:{' '}
                <span className="font-mono">
                  {submission.id.toString().substring(0, 8).toUpperCase()}
                </span>
              </p>
            </div>
            <span className={statusClass}>{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Manuscript details */}
        <div className="bg-white border border-gray-300 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manuscript Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-600">Status</span>
              <p className="font-medium text-gray-900 mt-1">{statusLabel}</p>
            </div>
            <div>
              <span className="text-gray-600">Submitted</span>
              <p className="font-medium text-gray-900 mt-1">
                {submission.created_at
                  ? new Date(submission.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Topic Area</span>
              <p className="font-medium text-gray-900 mt-1">
                {submission.topic_area?.name || 'Not specified'}
              </p>
            </div>
          </div>

          {submission.keywords && submission.keywords.length > 0 && (
            <div>
              <span className="text-sm text-gray-600">Keywords</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {submission.keywords.map((keyword, index) => (
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
        </div>

        {/* Abstract */}
        <div className="bg-white border border-gray-300 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Abstract</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {submission.abstract || 'No abstract provided.'}
          </p>
        </div>

        {/* Files */}
        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Files</h2>

          {(!submission.manuscript_pdf ||
            submission.manuscript_pdf.trim().length === 0) &&
            (!submission.supplementary_files ||
              submission.supplementary_files.length === 0) ? (
            <p className="text-sm text-gray-600">No files uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {submission.manuscript_pdf && submission.manuscript_pdf.trim().length > 0 && (
                <a
                  href={submission.manuscript_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText size={20} className="text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Manuscript PDF</p>
                      <p className="text-xs text-blue-800">
                        Opens in a new tab from the journal server.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    View PDF
                  </span>
                </a>
              )}

              {submission.supplementary_files &&
                submission.supplementary_files.map((file) => (
                  <a
                    key={file.id}
                    href={file.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText size={18} className="text-gray-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded{' '}
                          {new Date(file.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Open
                    </span>
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getStatusLabel = (status: Submission['status']): string =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getStatusChipClasses = (status: Submission['status']): string => {
  switch (status) {
    case 'draft':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300';
    case 'submitted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-300';
    case 'under_review':
    case 'screening':
    case 'decision_pending':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-300';
    case 'revision_required':
    case 'resubmitted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-300';
    case 'accepted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-300';
    case 'rejected':
    case 'desk_rejected':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-300';
    case 'published':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-300';
    default:
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300';
  }
};

