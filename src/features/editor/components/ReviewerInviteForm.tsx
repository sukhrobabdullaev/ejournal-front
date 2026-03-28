import React, { useMemo, useState } from 'react';
import { Check, Search, Send, UserRound, X } from 'lucide-react';

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
  onDeskReject: () => void;
  isLoading: boolean;
  deskRejecting: boolean;
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
  onDeskReject,
  isLoading,
  deskRejecting,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedReviewers = useMemo(
    () => reviewers.filter((reviewer) => selectedReviewerIds.includes(reviewer.id)),
    [reviewers, selectedReviewerIds]
  );

  const filteredReviewers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return reviewers;
    }

    return reviewers.filter((reviewer) =>
      [reviewer.full_name, reviewer.email, reviewer.affiliation, reviewer.country]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [reviewers, searchQuery]);

  const alreadyInvitedSet = useMemo(
    () => new Set(alreadyInvitedEmails.map((email) => email.toLowerCase())),
    [alreadyInvitedEmails]
  );

  const isAlreadyInvited = (reviewer: Reviewer): boolean =>
    alreadyInvitedSet.has(reviewer.email.toLowerCase());

  const toggleReviewer = (reviewerId: number) => {
    const updated = selectedReviewerIds.includes(reviewerId)
      ? selectedReviewerIds.filter((id) => id !== reviewerId)
      : [...selectedReviewerIds, reviewerId];

    onReviewerIdsSelect(updated);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const canSendInvitation =
    !isLoading && selectedReviewerIds.length > 0 && dueDate.trim().length > 0;

  return (
    <section
      className="rounded-xl border bg-[#F8FBFF] p-6"
      style={{ borderColor: '#D8E4F6' }}
    >
      <h4 className="text-base font-semibold text-[#0B1C4D]">Invite Reviewers</h4>

      <div className="mt-5 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Approved Reviewers
          </label>

          {isLoadingReviewers ? (
            <div className="rounded-xl border bg-white px-4 py-3 text-sm text-slate-500" style={{ borderColor: '#C9DCF6' }}>
              Loading reviewers...
            </div>
          ) : reviewers.length === 0 ? (
            <div className="rounded-xl border bg-white px-4 py-3 text-sm text-slate-500" style={{ borderColor: '#C9DCF6' }}>
              No approved reviewers available.
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-xl border bg-white px-4 py-3 text-left text-sm text-slate-700"
              style={{ borderColor: '#C9DCF6', transition: 'all 0.3s ease-in-out' }}
            >
              {selectedReviewerIds.length === 0
                ? 'Select reviewers'
                : `${selectedReviewerIds.length} reviewer${selectedReviewerIds.length > 1 ? 's' : ''} selected`}
            </button>
          )}

          {selectedReviewers.length > 0 && (
            <div className="mt-3 space-y-3">
              {selectedReviewers.map((reviewer) => {
                const alreadyInvited = isAlreadyInvited(reviewer);

                return (
                  <div
                    key={reviewer.id}
                    className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4"
                    style={{
                      borderColor: alreadyInvited ? '#FCD34D' : '#C9DCF6',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-base font-semibold leading-snug text-[#0B1C4D]">{reviewer.full_name}</p>
                      <p className="truncate text-sm leading-snug text-slate-600">{reviewer.email}</p>
                      <p className="truncate text-sm leading-snug text-slate-500">
                        {reviewer.affiliation}, {reviewer.country}
                      </p>
                      {alreadyInvited && (
                        <p className="mt-1 text-[11px] font-semibold text-amber-700">
                          Already invited
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleReviewer(reviewer.id)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: '#C9DCF6',
                        color: '#64748B',
                        backgroundColor: '#F8FAFC',
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Review Due Date *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => onDueDateChange(event.target.value)}
            required
            className="w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none"
            style={{ borderColor: '#C9DCF6', transition: 'all 0.3s ease-in-out' }}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSendInvitation}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-white"
            style={{
              borderColor: '#1D4ED8',
              backgroundColor: '#1D4ED8',
              transition: 'all 0.3s ease-in-out',
              opacity: canSendInvitation ? 1 : 0.65,
              cursor: canSendInvitation ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={15} />
            {isLoading
              ? 'Inviting...'
              : selectedReviewerIds.length > 1
                ? `Send ${selectedReviewerIds.length} Invitations`
                : 'Send Invitation'}
          </button>

          <button
            type="button"
            onClick={onDeskReject}
            disabled={deskRejecting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{
              borderColor: '#FCA5A5',
              color: '#B91C1C',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.3s ease-in-out',
              opacity: deskRejecting ? 0.65 : 1,
              cursor: deskRejecting ? 'not-allowed' : 'pointer',
            }}
          >
            <X size={15} />
            {deskRejecting ? 'Desk Rejecting...' : 'Desk Reject'}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="saas-fade-menu flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border bg-white shadow-[0_22px_48px_rgba(15,23,42,0.22)]"
            style={{ borderColor: '#D8E4F6', transition: 'all 0.3s ease-in-out' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: '#E2E8F0' }}>
              <div>
                <h5 className="text-sm font-semibold text-[#0B1C4D]">Select Reviewers</h5>
                <p className="text-xs text-slate-500">
                  {selectedReviewerIds.length} selected
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                style={{ borderColor: '#C9DCF6', transition: 'all 0.3s ease-in-out' }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="border-b px-4 py-3" style={{ borderColor: '#E2E8F0' }}>
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name, email, affiliation or country"
                  className="w-full rounded-xl border bg-[#F8FBFF] py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none"
                  style={{ borderColor: '#C9DCF6', transition: 'all 0.3s ease-in-out' }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {filteredReviewers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#C9DCF6] bg-[#F8FBFF] px-4 py-6 text-center text-sm text-slate-600">
                  No reviewers found.
                </div>
              ) : (
                filteredReviewers.map((reviewer) => {
                  const selected = selectedReviewerIds.includes(reviewer.id);
                  const alreadyInvited = isAlreadyInvited(reviewer);

                  return (
                    <button
                      key={reviewer.id}
                      type="button"
                      onClick={() => toggleReviewer(reviewer.id)}
                      className="flex w-full items-start gap-3 rounded-xl border p-3 text-left"
                      style={{
                        borderColor: selected ? '#93C5FD' : alreadyInvited ? '#FCD34D' : '#D8E4F6',
                        backgroundColor: selected ? '#EFF6FF' : '#FFFFFF',
                        boxShadow: selected ? '0 8px 16px rgba(37,99,235,0.10)' : 'none',
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <span
                        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                        style={{
                          borderColor: selected ? '#1D4ED8' : '#C9DCF6',
                          backgroundColor: selected ? '#1D4ED8' : '#FFFFFF',
                          color: '#FFFFFF',
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        {selected ? <Check size={13} /> : <UserRound size={12} style={{ color: '#94A3B8' }} />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#0B1C4D]">
                          {reviewer.full_name}
                        </span>
                        <span className="block truncate text-xs text-slate-600">{reviewer.email}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {reviewer.affiliation}, {reviewer.country}
                        </span>
                        {alreadyInvited && (
                          <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Already invited
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: '#E2E8F0' }}>
              <button
                type="button"
                onClick={() => onReviewerIdsSelect([])}
                disabled={selectedReviewerIds.length === 0}
                className="rounded-md border px-3 py-2 text-xs font-semibold"
                style={{
                  borderColor: '#C9DCF6',
                  color: '#0B1C4D',
                  opacity: selectedReviewerIds.length === 0 ? 0.45 : 1,
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border px-3 py-2 text-xs font-semibold text-white"
                style={{
                  borderColor: '#1D4ED8',
                  backgroundColor: '#1D4ED8',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Done ({selectedReviewerIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
