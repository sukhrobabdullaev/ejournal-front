import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, FileText, Filter, Search, UserRound } from 'lucide-react';
import type { Submission } from '../../../lib/api';

interface SubmissionsListProps {
  submissions: Submission[];
  selectedId?: number;
  onSelect: (id: number) => void;
  emptyMessage?: string;
}

const PAGE_SIZE = 5;

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  screening: 'Screening',
  desk_rejected: 'Desk Rejected',
  under_review: 'Under Review',
  revision_required: 'Revision Required',
  resubmitted: 'Resubmitted',
  decision_pending: 'Decision Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  published: 'Published',
  withdrawn: 'Withdrawn',
};

const STATUS_STYLES: Record<string, { background: string; color: string; border: string }> = {
  submitted: { background: '#EFF6FF', color: '#0C4A6E', border: '#BFDBFE' },
  screening: { background: '#EEF2FF', color: '#3730A3', border: '#C7D2FE' },
  desk_rejected: { background: '#FEF2F2', color: '#7F1D1D', border: '#FED7AA' },
  under_review: { background: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  revision_required: { background: '#FFF7ED', color: '#9A3412', border: '#FEDBA8' },
  resubmitted: { background: '#F5F3FF', color: '#5B21B6', border: '#E9D5FF' },
  decision_pending: { background: '#FFFBEB', color: '#78350F', border: '#FEE3C3' },
  accepted: { background: '#F0FDF4', color: '#166534', border: '#DCFCE7' },
  rejected: { background: '#FEF2F2', color: '#7F1D1D', border: '#FED7AA' },
  published: { background: '#ECFEFF', color: '#155E75', border: '#CFFAFE' },
  withdrawn: { background: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
};

const formatCreatedAt = (value?: string): string => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const resolveAuthorName = (submission: Submission): string => {
  const dynamicSubmission = submission as Submission & {
    profiles?: { full_name?: string | null };
    profile?: { full_name?: string | null };
    author_name?: string | null;
    author_full_name?: string | null;
  };

  const candidate =
    dynamicSubmission.profiles?.full_name ||
    dynamicSubmission.profile?.full_name ||
    dynamicSubmission.author_name ||
    dynamicSubmission.author_full_name;

  if (candidate && candidate.trim().length > 0) {
    return candidate;
  }

  if (typeof submission.author === 'number') {
    return `Author #${submission.author}`;
  }

  return 'Unknown';
};

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  selectedId,
  onSelect,
  emptyMessage = 'No submissions in this category',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const availableStatuses = useMemo(() => {
    const set = new Set(submissions.map((submission) => submission.status));
    return Array.from(set);
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...submissions]
      .filter((submission) => {
        const author = resolveAuthorName(submission).toLowerCase();
        const title = (submission.title || '').toLowerCase();
        const searchMatches = !query || title.includes(query) || author.includes(query);
        const statusMatches = statusFilter === 'all' || submission.status === statusFilter;

        return searchMatches && statusMatches;
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [searchTerm, statusFilter, submissions]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSubmissions.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredSubmissions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const hasFilters = searchTerm.trim().length > 0 || statusFilter !== 'all';

  return (
    <div className="flex h-full flex-col">
      <div
        className="border-b bg-white px-4 py-4"
        style={{ borderColor: '#EAECF0' }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#94A3B8' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by article title or author"
              className="w-full rounded-lg border bg-[#F8FBFF] py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none"
              style={{ borderColor: '#D9E0FF', transition: 'all 0.3s ease-in-out' }}
            />
          </div>

          <div className="relative">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#94A3B8' }}
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border bg-[#F8FBFF] py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none"
              style={{ borderColor: '#D9E0FF', transition: 'all 0.3s ease-in-out' }}
            >
              <option value="all">All statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {filteredSubmissions.length} result{filteredSubmissions.length !== 1 ? 's' : ''}
          {hasFilters ? ' matched' : ' total'}
        </p>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <FileText size={40} style={{ color: '#CBD5E1' }} />
          <p className="mt-3 text-sm text-slate-600">
            {hasFilters ? 'No submissions matched your search or filter.' : emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {paginatedSubmissions.map((submission, index) => {
              const isActive = submission.id === selectedId;
              const statusStyle = STATUS_STYLES[submission.status] || STATUS_STYLES.withdrawn;
              const authorName = resolveAuthorName(submission);

              return (
                <button
                    key={submission.id}
                    type="button"
                    onClick={() => onSelect(submission.id)}
                    className="saas-stagger-item w-full rounded-lg border bg-white p-4 text-left shadow-sm"
                    style={{
                      borderColor: isActive ? '#93C5FD' : '#CED9F0',
                    background: isActive ? '#F4F9FF' : '#FFFFFF',
                    boxShadow: isActive
                      ? '0 12px 24px rgba(37,99,235,0.14)'
                      : '0 4px 12px rgba(15,23,42,0.06)',
                    transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                    transition: 'all 0.3s ease-in-out',
                    animationDelay: `${index * 70}ms`,
                  }}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-base font-semibold text-[#0B1C4D]">
                      {submission.title || 'Untitled Submission'}
                    </h3>
                    <span
                      className="inline-flex items-center shrink-0 rounded-xl border px-2 py-0.5 text-sm font-medium w-auto h-auto"
                      style={{
                        backgroundColor: statusStyle.background,
                        borderColor: statusStyle.border,
                        color: statusStyle.color,
                      }}
                    >
                      {STATUS_LABELS[submission.status] || submission.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <UserRound size={12} />
                      {authorName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Clock size={12} />
                      {formatCreatedAt(submission.created_at)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-t bg-white px-4 py-3"
              style={{ borderColor: '#EAECF0' }}
            >
              <p className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white"
                  style={{
                    borderColor: '#D9E0FF',
                    color: currentPage === 1 ? '#94A3B8' : '#0B1C4D',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                    className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold"
                    style={{
                      borderColor: page === currentPage ? '#1D4ED8' : '#D9E0FF',
                      backgroundColor: page === currentPage ? '#1D4ED8' : '#FFFFFF',
                      color: page === currentPage ? '#FFFFFF' : '#0B1C4D',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white"
                  style={{
                    borderColor: '#D9E0FF',
                    color: currentPage === totalPages ? '#94A3B8' : '#0B1C4D',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
