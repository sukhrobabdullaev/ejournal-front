import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileDown, FileText, Loader2, Search } from 'lucide-react';
import {
  getAcceptedSubmissionsForIssue,
  getEditorIssues,
  makeJournalIssue,
  updateJournalIssue,
} from '../../../lib/queries-api';
import type { IssueBuilderCandidate, MakeIssuePayload } from '../../../lib/api';

type IssueArticleDraft = {
  selected: boolean;
  order: string;
};

const currentYear = new Date().getFullYear();

const STATUS_LABELS: Record<string, string> = {
  accepted: 'Accepted',
  published: 'Published',
};

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  accepted: { bg: '#ECFDF3', border: '#BBF7D0', color: '#166534' },
  published: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8' },
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function MakeJournalPanel() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [volume, setVolume] = useState('1');
  const [issueNumber, setIssueNumber] = useState('1');
  const [publicationYear, setPublicationYear] = useState(String(currentYear));
  const [publicationDate, setPublicationDate] = useState('');
  const [editingIssueId, setEditingIssueId] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<number, IssueArticleDraft>>({});

  const { data: acceptedSubmissions = [], isLoading: loadingAccepted } = useQuery({
    queryKey: ['editor-issue-accepted-submissions'],
    queryFn: getAcceptedSubmissionsForIssue,
  });

  const { data: existingIssues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ['editor-issues'],
    queryFn: getEditorIssues,
  });

  const selectedIssue = useMemo(() => {
    if (!editingIssueId) return null;
    return existingIssues.find((issue) => String(issue.id) === editingIssueId) || null;
  }, [editingIssueId, existingIssues]);

  const editableSubmissions = useMemo(() => {
    const byId = new Map<number, IssueBuilderCandidate>();

    for (const submission of acceptedSubmissions) {
      byId.set(submission.id, submission);
    }

    if (selectedIssue) {
      for (const article of selectedIssue.articles || []) {
        if (!byId.has(article.id)) {
          byId.set(article.id, {
            id: article.id,
            status: article.status === 'accepted' ? 'accepted' : 'published',
            title: article.title,
            author_name: article.authors?.[0]?.full_name || 'Unknown',
            author_email: '',
            created_at: '',
            updated_at: '',
            manuscript_pdf_url: article.pdf_public_url || undefined,
            manuscript_page_count: article.manuscript_page_count || null,
            is_already_assigned: true,
            issue: selectedIssue.id,
            issue_order: article.issue_order ?? null,
            page_start: article.page_start ?? null,
            page_end: article.page_end ?? null,
          });
        }
      }
    }

    return Array.from(byId.values());
  }, [acceptedSubmissions, selectedIssue]);

  const visibleSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return editableSubmissions;
    }
    return editableSubmissions.filter((item) => {
      return (
        (item.title || '').toLowerCase().includes(query) ||
        (item.author_name || '').toLowerCase().includes(query) ||
        (item.author_email || '').toLowerCase().includes(query)
      );
    });
  }, [editableSubmissions, search]);

  const selectedCount = useMemo(() => {
    return Object.values(rows).filter((entry) => entry.selected).length;
  }, [rows]);

  const submissionById = useMemo(() => {
    const result = new Map<number, IssueBuilderCandidate>();
    for (const submission of editableSubmissions) {
      result.set(submission.id, submission);
    }
    return result;
  }, [editableSubmissions]);

  const autoPaginationRows = useMemo(() => {
    const selected = Object.entries(rows)
      .filter(([, value]) => value.selected)
      .map(([submissionId, value]) => ({
        submission_id: Number(submissionId),
        order: Number(value.order),
      }))
      .filter((item) => Number.isFinite(item.order) && item.order > 0)
      .sort((a, b) => a.order - b.order);

    const result: Array<{
      submission_id: number;
      order: number;
      page_start: number;
      page_end: number;
      page_count: number;
    }> = [];
    let cursor = 1;

    for (const item of selected) {
      const submission = submissionById.get(item.submission_id);
      const pageCountFromPdf = submission?.manuscript_page_count;
      const pageCountFromRange =
        submission?.page_start && submission?.page_end
          ? Math.max(1, submission.page_end - submission.page_start + 1)
          : null;
      const pageCount = Math.max(1, pageCountFromPdf || pageCountFromRange || 1);
      const pageStart = cursor;
      const pageEnd = pageStart + pageCount - 1;

      result.push({
        submission_id: item.submission_id,
        order: item.order,
        page_start: pageStart,
        page_end: pageEnd,
        page_count: pageCount,
      });
      cursor = pageEnd + 1;
    }

    return result;
  }, [rows, submissionById]);

  const autoPaginationBySubmissionId = useMemo(() => {
    const result = new Map<number, (typeof autoPaginationRows)[number]>();
    for (const row of autoPaginationRows) {
      result.set(row.submission_id, row);
    }
    return result;
  }, [autoPaginationRows]);

  React.useEffect(() => {
    if (!selectedIssue) {
      return;
    }

    setTitle(selectedIssue.title || '');
    setVolume(String(selectedIssue.volume || 1));
    setIssueNumber(String(selectedIssue.issue_number || 1));
    setPublicationYear(String(selectedIssue.publication_year || currentYear));
    setPublicationDate(
      selectedIssue.publication_date ? selectedIssue.publication_date.slice(0, 10) : ''
    );

    const nextRows: Record<number, IssueArticleDraft> = {};
    for (const article of selectedIssue.articles || []) {
      nextRows[article.id] = {
        selected: true,
        order: String(article.issue_order || ''),
      };
    }
    setRows(nextRows);
  }, [selectedIssue]);

  const publishMutation = useMutation({
    mutationFn: async (params: { payload: MakeIssuePayload; issueId?: string }) => {
      const response = params.issueId
        ? await updateJournalIssue(params.issueId, params.payload)
        : await makeJournalIssue(params.payload);
      if (response.error || !response.data) {
        throw new Error(response.error?.detail || 'Failed to make journal issue.');
      }
      return response.data;
    },
    onSuccess: async () => {
      setSuccess(
        editingIssueId
          ? 'Issue was updated and PDFs were merged successfully.'
          : 'Issue was published and PDFs were merged successfully.'
      );
      setError(null);
      setRows({});
      setEditingIssueId('');
      setTitle('');
      setPublicationDate('');
      await queryClient.invalidateQueries({ queryKey: ['editor-submissions'] });
      await queryClient.invalidateQueries({ queryKey: ['editor-issue-accepted-submissions'] });
      await queryClient.invalidateQueries({ queryKey: ['editor-issues'] });
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
      await queryClient.invalidateQueries({ queryKey: ['published-issues'] });
    },
    onError: (mutationError) => {
      setError((mutationError as Error).message || 'Failed to publish issue.');
      setSuccess(null);
    },
  });

  const toggleSelection = (submission: IssueBuilderCandidate) => {
    setRows((current) => {
      const previous = current[submission.id];
      const nextSelected = !previous?.selected;
      const nextOrder = previous?.order || String(selectedCount + (nextSelected ? 1 : 0));
      return {
        ...current,
        [submission.id]: {
          selected: nextSelected,
          order: nextOrder,
        },
      };
    });
  };

  const updateRow = (
    submissionId: number,
    field: 'order',
    value: string
  ) => {
    setRows((current) => ({
      ...current,
      [submissionId]: {
        selected: current[submissionId]?.selected || false,
        order: current[submissionId]?.order || '',
        [field]: value,
      },
    }));
  };

  const onPublish = () => {
    setError(null);
    setSuccess(null);

    const selectedRows = autoPaginationRows.map((row) => ({
      submission_id: row.submission_id,
      order: row.order,
      page_start: row.page_start,
      page_end: row.page_end,
    }));

    if (selectedRows.length === 0) {
      setError('Please select at least one article.');
      return;
    }

    for (const article of selectedRows) {
      if (
        !Number.isFinite(article.order) ||
        article.order < 1
      ) {
        setError('Order is required for all selected articles.');
        return;
      }
    }

    const payload: MakeIssuePayload = {
      title: title.trim() || undefined,
      volume: Number(volume),
      issue_number: Number(issueNumber),
      publication_year: Number(publicationYear),
      publication_date: publicationDate || undefined,
      articles: selectedRows,
    };

    if (
      !Number.isFinite(payload.volume) ||
      payload.volume < 1 ||
      !Number.isFinite(payload.issue_number) ||
      payload.issue_number < 1 ||
      !Number.isFinite(payload.publication_year) ||
      payload.publication_year < 1900
    ) {
      setError('Volume, Issue number and Year must be valid numbers.');
      return;
    }

    publishMutation.mutate({
      payload,
      issueId: editingIssueId || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: '#D8E4F6' }}
      >
          <h2 className="text-xl font-semibold text-[#0B1C4D]">Make Journal (Editor Only)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Build a full journal issue from accepted submissions and generate one master PDF.
          </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <select
            value={editingIssueId}
            onChange={(event) => {
              const issueId = event.target.value;
              setEditingIssueId(issueId);
              if (!issueId) {
                setRows({});
                setTitle('');
                setVolume('1');
                setIssueNumber('1');
                setPublicationYear(String(currentYear));
                setPublicationDate('');
              }
            }}
            className="rounded-xl border px-3 py-2.5 text-sm outline-none md:col-span-4"
            style={{ borderColor: '#C9DCF6' }}
          >
            <option value="">Create New Issue</option>
            {existingIssues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                Edit: Volume {issue.volume}, Issue {issue.issue_number}{' '}
                ({issue.publication_date || issue.publication_year})
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Issue title (optional)"
            className="rounded-xl border px-3 py-2.5 text-sm outline-none md:col-span-4"
            style={{ borderColor: '#C9DCF6' }}
          />
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Volume
            </span>
            <input
              type="number"
              min={1}
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
              placeholder="Volume"
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#C9DCF6' }}
            />
            <span className="block text-[11px] text-slate-500">Journal tom raqami (masalan: 5).</span>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Issue Number
            </span>
            <input
              type="number"
              min={1}
              value={issueNumber}
              onChange={(event) => setIssueNumber(event.target.value)}
              placeholder="Issue"
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#C9DCF6' }}
            />
            <span className="block text-[11px] text-slate-500">
              Tom ichidagi son raqami (masalan: Issue 2).
            </span>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Publication Year
            </span>
            <input
              type="number"
              min={1900}
              value={publicationYear}
              onChange={(event) => setPublicationYear(event.target.value)}
              placeholder="Year"
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#C9DCF6' }}
            />
            <span className="block text-[11px] text-slate-500">Jurnal rasmiy chop etilgan yil.</span>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Publication Date
            </span>
            <input
              type="date"
              value={publicationDate}
              onChange={(event) => {
                const nextDate = event.target.value;
                setPublicationDate(nextDate);
                if (nextDate) {
                  const year = new Date(nextDate).getFullYear();
                  if (!Number.isNaN(year)) {
                    setPublicationYear(String(year));
                  }
                }
              }}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#C9DCF6' }}
            />
            <span className="block text-[11px] text-slate-500">
              Ixtiyoriy: kun/oy/yilni aniq ko'rsatish uchun.
            </span>
          </label>
        </div>
        <div className="mt-4 rounded-xl border bg-[#F8FBFF] px-4 py-3 text-xs text-slate-600" style={{ borderColor: '#D8E4F6' }}>
          Maqola tanlaganingizdan keyin:
          <span className="ml-1 font-semibold text-[#0B1C4D]">Order</span> - issue ichida maqola tartibi,
          <span className="ml-1 font-semibold text-[#0B1C4D]">Page Start/Page End</span> - PDF sahifa soniga qarab avtomatik ketma-ket hisoblanadi.
        </div>
        <div
          className="mt-4 flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: '#D8E4F6' }}
        >
          <p className="text-sm text-slate-600">
            Tanlangan maqolalar: <span className="font-semibold text-[#0B1C4D]">{selectedCount}</span>
          </p>
          <button
            type="button"
            onClick={onPublish}
            disabled={publishMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            style={{ backgroundColor: '#1D4ED8', color: '#FFFFFF' }}
          >
            {publishMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Making Journal... Please wait
              </>
            ) : (
              <>
                <FileDown size={16} />
                {editingIssueId ? 'Update Journal' : 'Make Journal'}
              </>
            )}
          </button>
        </div>
      </section>

      <section
        className="rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: '#D8E4F6' }}
      >
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <h3 className="text-lg font-semibold text-[#0B1C4D]">
            Accepted / Published Articles ({editableSubmissions.length})
          </h3>
          <div className="relative w-full md:w-96">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or author"
              className="w-full rounded-xl border bg-[#F8FBFF] py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{ borderColor: '#C9DCF6' }}
            />
          </div>
        </div>

        {loadingAccepted ? (
          <p className="mt-4 text-sm text-slate-500">Loading accepted/published submissions...</p>
        ) : visibleSubmissions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No accepted or published submissions found.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {visibleSubmissions.map((submission) => {
              const rowState = rows[submission.id];
              const selected = rowState?.selected || false;
              const autoRow = autoPaginationBySubmissionId.get(submission.id);
              const pageCount = submission.manuscript_page_count || autoRow?.page_count || 1;

              return (
                <div
                  key={submission.id}
                  className="rounded-xl border bg-[#F8FBFF] p-4"
                  style={{ borderColor: selected ? '#93C5FD' : '#D8E4F6' }}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <label className="inline-flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelection(submission)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[#0B1C4D]">
                          {submission.title || 'Untitled'}
                        </span>
                        <span
                          className="mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                          style={{
                            backgroundColor: STATUS_STYLES[submission.status]?.bg || '#F8FAFC',
                            borderColor: STATUS_STYLES[submission.status]?.border || '#CBD5E1',
                            color: STATUS_STYLES[submission.status]?.color || '#475569',
                          }}
                        >
                          {STATUS_LABELS[submission.status] || submission.status}
                        </span>
                        <span className="block text-xs text-slate-600">
                          {submission.author_name || submission.author_email} |{' '}
                          {formatDate(submission.updated_at)}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          PDF pages: {pageCount}
                        </span>
                        {submission.manuscript_pdf_url && (
                          <a
                            href={submission.manuscript_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                          >
                            <FileText size={13} />
                            View PDF
                          </a>
                        )}
                      </span>
                    </label>

                    {selected && (
                      <div className="grid grid-cols-3 gap-2 lg:w-[430px]">
                        <label className="space-y-1">
                          <span className="text-[11px] text-slate-500">Order (Tartib)</span>
                          <input
                            type="number"
                            min={1}
                            value={rowState?.order || ''}
                            onChange={(event) =>
                              updateRow(submission.id, 'order', event.target.value)
                            }
                            placeholder="1"
                            className="w-full rounded-lg border px-2 py-2 text-xs outline-none"
                            style={{ borderColor: '#C9DCF6' }}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[11px] text-slate-500">Page Start</span>
                          <input
                            type="number"
                            value={autoRow?.page_start || ''}
                            readOnly
                            className="w-full rounded-lg border px-2 py-2 text-xs outline-none"
                            style={{ borderColor: '#C9DCF6' }}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[11px] text-slate-500">Page End</span>
                          <input
                            type="number"
                            value={autoRow?.page_end || ''}
                            readOnly
                            className="w-full rounded-lg border px-2 py-2 text-xs outline-none"
                            style={{ borderColor: '#C9DCF6' }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section
        className="rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: '#D8E4F6' }}
      >
        <h3 className="text-lg font-semibold text-[#0B1C4D]">Published Issues</h3>
        {loadingIssues ? (
          <p className="mt-3 text-sm text-slate-500">Loading issues...</p>
        ) : existingIssues.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No published issues yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {existingIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-xl border bg-[#F8FBFF] p-4"
                style={{ borderColor: '#D8E4F6' }}
              >
                <p className="text-sm font-semibold text-[#0B1C4D]">
                  Volume {issue.volume}, Issue {issue.issue_number} -{' '}
                  {issue.publication_date || issue.publication_year}
                </p>
                <p className="mt-1 text-xs text-slate-600">{issue.title}</p>
                <p className="mt-1 text-xs text-slate-500">{issue.articles?.length || 0} articles</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
