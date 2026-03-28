import React, { useState } from 'react';
import { editorService } from '../../../services/api/editor.service';

interface EditorDecisionPanelProps {
  submissionId: string | number;
  status: string;
  onActionSuccess: () => void;
}

export const EditorDecisionPanel: React.FC<EditorDecisionPanelProps> = ({ submissionId, status, onActionSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [decision, setDecision] = useState<'accept' | 'reject' | 'revision_required' | ''>('');
  const [decisionLetter, setDecisionLetter] = useState('');
  const [error, setError] = useState('');

  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true);
    setError('');
    try {
      await action();
      onActionSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred while performing the action.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartScreening = () => handleAction(() => editorService.startScreening(submissionId));
  const handleSendToReview = () => handleAction(() => editorService.sendToReview(submissionId));
  const handleMoveToDecision = () => handleAction(() => editorService.moveToDecision(submissionId));
  const handlePublish = () => handleAction(() => editorService.publishSubmission(submissionId));

  const handleDeskReject = () => {
    if (!reason) {
      setError('Please provide a reason for desk rejection.');
      return;
    }
    handleAction(() => editorService.deskReject(submissionId, reason));
  };

  const handleMakeDecision = () => {
    if (!decision || !decisionLetter) {
      setError('Please select a decision and write a decision letter.');
      return;
    }
    handleAction(() => editorService.makeDecision(submissionId, { decision: decision as any, decision_letter: decisionLetter }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Editorial Actions</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {status === 'submitted' && (
        <div className="space-y-4">
          <p className="text-gray-600">The submission is waiting for initial screening.</p>
          <button 
            onClick={handleStartScreening}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Start Screening
          </button>
        </div>
      )}

      {status === 'screening' && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Send to Peer Review</h3>
            <p className="text-sm text-gray-500 mb-3">If the submission meets the initial criteria, send it to review.</p>
            <button 
              onClick={handleSendToReview}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send to Review
            </button>
          </div>
          
          <div>
            <h3 className="font-medium text-red-600 mb-2">Desk Reject</h3>
            <p className="text-sm text-gray-500 mb-3">Reject without peer review.</p>
            <textarea
              className="w-full border rounded p-2 mb-3"
              rows={3}
              placeholder="Reason for desk rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button 
              onClick={handleDeskReject}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Desk Reject
            </button>
          </div>
        </div>
      )}

      {status === 'under_review' && (
        <div className="space-y-4">
          <p className="text-gray-600">The submission is currently under review.</p>
          <button 
            onClick={handleMoveToDecision}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Move to Decision Pending
          </button>
        </div>
      )}

      {status === 'decision_pending' && (
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Final Decision</label>
            <select 
              className="w-full border rounded p-2"
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
            >
              <option value="">-- Select Decision --</option>
              <option value="accept">Accept</option>
              <option value="revision_required">Revision Required</option>
              <option value="reject">Reject</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Decision Letter (sent to author)</label>
            <textarea
              className="w-full border rounded p-2"
              rows={5}
              placeholder="Dear Author..."
              value={decisionLetter}
              onChange={(e) => setDecisionLetter(e.target.value)}
            />
          </div>
          <button 
            onClick={handleMakeDecision}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Submit Decision
          </button>
        </div>
      )}

      {status === 'accepted' && (
        <div className="space-y-4">
          <p className="text-green-600 font-medium">This submission has been accepted.</p>
          <button 
            onClick={handlePublish}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Publish Now
          </button>
        </div>
      )}

      {['desk_rejected', 'rejected', 'published', 'withdrawn'].includes(status) && (
        <div>
          <p className="text-gray-600 font-medium">
            This submission has reached a final state ({status.replace('_', ' ')}). No further editorial actions can be taken.
          </p>
        </div>
      )}
    </div>
  );
};