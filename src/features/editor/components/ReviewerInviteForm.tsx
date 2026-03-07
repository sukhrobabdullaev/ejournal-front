import React, { useState, useMemo } from 'react';
import { Send, Search, X, Check } from 'lucide-react';

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
  dueDate: string;
  selectedReviewerIds: number[];
  alreadyInvitedEmails: string[];
  onReviewerIdsSelect: (reviewerIds: number[]) => void;
  onDueDateChange: (date: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ReviewerInviteForm: React.FC<ReviewerInviteFormProps> = ({
  reviewers,
  isLoadingReviewers,
  dueDate,
  selectedReviewerIds,
  alreadyInvitedEmails,
  onReviewerIdsSelect,
  onDueDateChange,
  onSubmit,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const canSubmit = selectedReviewerIds.length > 0;

  // Check if a reviewer is already invited
  const isReviewerAlreadyInvited = (reviewer: Reviewer) => {
    return alreadyInvitedEmails.includes(reviewer.email.toLowerCase());
  };

  // Get count of already invited reviewers in selection
  const alreadyInvitedCount = selectedReviewerIds.filter((id) => {
    const reviewer = reviewers.find((r) => r.id === id);
    return reviewer && isReviewerAlreadyInvited(reviewer);
  }).length;

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

  const toggleReviewer = (reviewerId: number) => {
    onReviewerIdsSelect(
      selectedReviewerIds.includes(reviewerId)
        ? selectedReviewerIds.filter((id) => id !== reviewerId)
        : [...selectedReviewerIds, reviewerId]
    );
  };

  const removeReviewer = (reviewerId: number) => {
    onReviewerIdsSelect(selectedReviewerIds.filter((id) => id !== reviewerId));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleDone = () => {
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const getSelectedReviewersData = () => {
    return reviewers.filter((r) => selectedReviewerIds.includes(r.id));
  };

  return (
    <div className="space-y-2 border-t border-gray-200 pt-3">
      <h4 className="text-sm font-semibold text-gray-700">Invite Reviewers</h4>

      <div className="space-y-2">
        {/* Reviewer selection */}
        <div className="relative">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Select Approved Reviewers
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
                {selectedReviewerIds.length === 0
                  ? 'Select reviewers...'
                  : `${selectedReviewerIds.length} reviewer${selectedReviewerIds.length > 1 ? 's' : ''} selected`}
              </button>

              {/* Selected reviewers cards */}
              {selectedReviewerIds.length > 0 && (
                <div className="mt-2 space-y-2">
                  {getSelectedReviewersData().map((reviewer) => {
                    const alreadyInvited = isReviewerAlreadyInvited(reviewer);
                    return (
                      <div
                        key={reviewer.id}
                        className={`flex items-start justify-between rounded border p-2 text-xs ${
                          alreadyInvited
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="flex-1">
                          <p
                            className={`font-medium ${alreadyInvited ? 'text-yellow-900' : 'text-blue-900'}`}
                          >
                            {reviewer.full_name}
                            {alreadyInvited && (
                              <span className="ml-2 rounded bg-yellow-200 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800">
                                Already Invited
                              </span>
                            )}
                          </p>
                          <p className={alreadyInvited ? 'text-yellow-700' : 'text-blue-700'}>
                            {reviewer.email}
                          </p>
                          <p className={alreadyInvited ? 'text-yellow-600' : 'text-blue-600'}>
                            {reviewer.affiliation}, {reviewer.country}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeReviewer(reviewer.id)}
                          className={`ml-2 rounded p-1 ${
                            alreadyInvited
                              ? 'text-yellow-600 hover:bg-yellow-100'
                              : 'text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                  {alreadyInvitedCount > 0 && (
                    <div className="rounded border border-yellow-300 bg-yellow-50 p-2 text-xs text-yellow-800">
                      ⚠️ {alreadyInvitedCount} reviewer{alreadyInvitedCount > 1 ? 's' : ''} already
                      invited to this submission
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Due date */}
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
          {selectedReviewerIds.length > 1 && (
            <p className="mt-1 text-xs text-gray-500">
              Same due date will be applied to all selected reviewers
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !canSubmit}
          className="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Send className="h-4 w-4" />
          {isLoading
            ? 'Inviting...'
            : selectedReviewerIds.length > 1
              ? `Send ${selectedReviewerIds.length} Invitations`
              : 'Send Invitation'}
        </button>
      </div>

      {/* Searchable Modal with Multi-select */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="m-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Select Reviewers</h3>
                {selectedReviewerIds.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {selectedReviewerIds.length} reviewer{selectedReviewerIds.length > 1 ? 's' : ''}{' '}
                    selected
                  </p>
                )}
              </div>
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, affiliation, or country..."
                  className="w-full rounded border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Reviewers List with Checkboxes */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {filteredReviewers.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>No reviewers found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredReviewers.map((reviewer) => {
                    const isSelected = selectedReviewerIds.includes(reviewer.id);
                    const alreadyInvited = isReviewerAlreadyInvited(reviewer);
                    return (
                      <button
                        key={reviewer.id}
                        type="button"
                        onClick={() => toggleReviewer(reviewer.id)}
                        className={`flex w-full items-start gap-3 rounded border px-3 py-3 text-left transition-colors ${
                          isSelected
                            ? alreadyInvited
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-blue-500 bg-blue-50'
                            : alreadyInvited
                              ? 'border-yellow-200 bg-yellow-50/30 hover:bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
                            isSelected
                              ? alreadyInvited
                                ? 'border-yellow-600 bg-yellow-600'
                                : 'border-blue-600 bg-blue-600'
                              : alreadyInvited
                                ? 'border-yellow-400 bg-white'
                                : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {reviewer.full_name}
                            {alreadyInvited && (
                              <span className="ml-2 rounded bg-yellow-200 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800">
                                Already Invited
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{reviewer.email}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            {reviewer.affiliation} • {reviewer.country}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between gap-2 border-t border-gray-200 px-4 py-3">
              <button
                type="button"
                onClick={() => onReviewerIdsSelect([])}
                disabled={selectedReviewerIds.length === 0}
                className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  disabled={selectedReviewerIds.length === 0}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Done ({selectedReviewerIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
