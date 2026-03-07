import React, { useState, useMemo } from 'react';
import { Send, Search, X } from 'lucide-react';

interface Reviewer {
  id: number;
  email: string;
  full_name: string;
  affiliation: string;
  country: string;
}

interface ReviewerInviteFormProps {
  reviewers: Reviewer[];
  isLoadingReviewers: boolean;
  email: string;
  dueDate: string;
  selectedReviewerId: number | null;
  onReviewerSelect: (reviewerId: number | null) => void;
  onEmailChange: (email: string) => void;
  onDueDateChange: (date: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ReviewerInviteForm: React.FC<ReviewerInviteFormProps> = ({
  reviewers,
  isLoadingReviewers,
  email,
  dueDate,
  selectedReviewerId,
  onReviewerSelect,
  onEmailChange,
  onDueDateChange,
  onSubmit,
  isLoading,
}) => {
  const [inviteMode, setInviteMode] = useState<'existing' | 'external'>('existing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedReviewer = reviewers.find((r) => r.id === selectedReviewerId);
  const canSubmit =
    inviteMode === 'existing' ? selectedReviewerId !== null : email.trim().length > 0;

  // Filter reviewers based on search query
  const filteredReviewers = useMemo(() => {
    if (!searchQuery.trim()) return reviewers;

    const query = searchQuery.toLowerCase();
    return reviewers.filter(
      (reviewer) =>
        reviewer.full_name.toLowerCase().includes(query) ||
        reviewer.email.toLowerCase().includes(query) ||
        reviewer.affiliation.toLowerCase().includes(query) ||
        reviewer.country.toLowerCase().includes(query)
    );
  }, [reviewers, searchQuery]);

  const handleSelectReviewer = (reviewer: Reviewer) => {
    onReviewerSelect(reviewer.id);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2 border-t border-gray-200 pt-3">
      <h4 className="text-sm font-semibold text-gray-700">Invite Reviewer</h4>

      {/* Mode toggle */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setInviteMode('existing')}
          className={`rounded px-3 py-1 text-xs font-medium ${
            inviteMode === 'existing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Select Reviewer
        </button>
        <button
          type="button"
          onClick={() => {
            setInviteMode('external');
            onReviewerSelect(null);
          }}
          className={`rounded px-3 py-1 text-xs font-medium ${
            inviteMode === 'external'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Invite by Email
        </button>
      </div>

      <div className="space-y-2">
        {inviteMode === 'existing' ? (
          /* Reviewer selection button */
          <div className="relative">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Select Approved Reviewer
            </label>
            {isLoadingReviewers ? (
              <div className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-500">
                Loading reviewers...
              </div>
            ) : reviewers.length === 0 ? (
              <div className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-500">
                No approved reviewers available
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full border border-gray-300 px-3 py-2 text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {selectedReviewer ? selectedReviewer.full_name : 'Select a reviewer...'}
                </button>

                {/* Reviewer info card */}
                {selectedReviewer && (
                  <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-2 text-xs">
                    <p className="font-medium text-blue-900">{selectedReviewer.full_name}</p>
                    <p className="text-blue-700">{selectedReviewer.email}</p>
                    <p className="text-blue-600">
                      {selectedReviewer.affiliation}, {selectedReviewer.country}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Email input for external reviewer */
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Reviewer Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="reviewer@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              External reviewer will receive an invitation email
            </p>
          </div>
        )}

        {/* Due date - common for both modes */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Review Due Date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !canSubmit}
          className="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Send className="h-4 w-4" />
          {isLoading ? 'Inviting...' : 'Send Invitation'}
        </button>
      </div>

      {/* Searchable Modal */}
      {isModalOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={handleCloseModal}
        >
          <div
            className="m-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-900">Select Reviewer</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, affiliation, or country..."
                  className="w-full rounded border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Reviewers List */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {filteredReviewers.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>No reviewers found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredReviewers.map((reviewer) => (
                    <button
                      key={reviewer.id}
                      type="button"
                      onClick={() => handleSelectReviewer(reviewer)}
                      className={`w-full rounded border px-3 py-3 text-left transition-colors ${
                        selectedReviewerId === reviewer.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{reviewer.full_name}</div>
                      <div className="text-sm text-gray-600">{reviewer.email}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {reviewer.affiliation} • {reviewer.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
