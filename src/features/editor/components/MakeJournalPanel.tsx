import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, FileDown, FileText, Loader2, Search } from 'lucide-react';
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

const inputBaseClass =
  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#BFDBFE]';

const labelClass = 'space-y-2.5 pt-1';
const labelTextClass = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500';

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
  const [isValidating, setIsValidating] = useState(false);

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

  const eligibleSubmissions = useMemo(
    () => editableSubmissions.filter((submission) => Boolean(submission.manuscript_pdf_url)),
    [editableSubmissions]
  );

  const blockedPdfCount = editableSubmissions.length - eligibleSubmissions.length;

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

  const visibleEligibleCount = useMemo(
    () => visibleSubmissions.filter((submission) => Boolean(submission.manuscript_pdf_url)).length,
    [visibleSubmissions]
  );

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
      setIsValidating(false);
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
      setIsValidating(false);
      setError((mutationError as Error).message || 'Failed to publish issue.');
      setSuccess(null);
    },
  });

  const isBusy = publishMutation.isPending || loadingAccepted || loadingIssues || isValidating;
  const showLoadingProcess = isBusy;

  const toggleSelection = (submission: IssueBuilderCandidate) => {
    if (!submission.manuscript_pdf_url) {
      setError('This article cannot be added because the manuscript PDF is missing.');
      return;
    }
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

  const onPublish = async () => {
    setError(null);
    setSuccess(null);
    setIsValidating(true);

    // Ensure users can clearly perceive that processing has started.
    await new Promise((resolve) => setTimeout(resolve, 900));

    const selectedRows = autoPaginationRows.map((row) => ({
      submission_id: row.submission_id,
      order: row.order,
      page_start: row.page_start,
      page_end: row.page_end,
    }));

    if (selectedRows.length === 0) {
      setError('Please select at least one article.');
      setIsValidating(false);
      return;
    }

    for (const article of selectedRows) {
      if (
        !Number.isFinite(article.order) ||
        article.order < 1
      ) {
        setError('Order is required for all selected articles.');
        setIsValidating(false);
        return;
      }
    }

    const invalidPdfSelection = selectedRows.find((article) => {
      const submission = submissionById.get(article.submission_id);
      return !submission?.manuscript_pdf_url;
    });

    if (invalidPdfSelection) {
      setError('Selected articles must have a manuscript PDF before the journal can be built.');
      setIsValidating(false);
      return;
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
      setIsValidating(false);
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
        className="relative overflow-hidden rounded-[28px] border bg-white p-5 shadow-[0_20px_60px_rgba(11,28,77,0.08)] md:p-6"
        style={{ borderColor: '#D8E4F6' }}
        aria-busy={isBusy}
      >
        {isBusy && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-slate-950/15 px-6 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl border border-[#D8E4F6] bg-white p-6 text-sm text-[#0B1C4D] shadow-[0_24px_70px_rgba(11,28,77,0.2)] ring-1 ring-white/80">
              <div className="flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-[#1D4ED8]" />
                <div>
                  <p className="font-semibold">Building issue PDF</p>
                  <p className="text-xs text-slate-600">Saving selected articles, calculating pages and merging files.</p>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#EAF1FF]">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#60A5FA] to-[#93C5FD]" />
              </div>
              <div className="mt-5 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                <span className="rounded-full bg-[#F8FBFF] px-3 py-1 text-center">Validate</span>
                <span className="rounded-full bg-[#F8FBFF] px-3 py-1 text-center">Merge</span>
                <span className="rounded-full bg-[#F8FBFF] px-3 py-1 text-center">Publish</span>
              </div>
            </div>
          </div>
        )}

        <div className={isBusy ? 'pointer-events-none opacity-60' : ''}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F6] bg-[#F8FBFF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1D4ED8]">
                Editor workspace
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1C4D] md:text-3xl">
                Make Journal
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">
                Build a full journal issue from accepted submissions and generate one master PDF.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          <div className="mt-5 grid gap-4 xl:grid-cols-12">
            <label className={`${labelClass} xl:col-span-4`}>
              <span className={labelTextClass}>Issue mode</span>
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
                className={inputBaseClass}
              >
                <option value="">Create new issue</option>
                {existingIssues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    Edit: Volume {issue.volume}, Issue {issue.issue_number} ({issue.publication_date || issue.publication_year})
                  </option>
                ))}
              </select>
            </label>

            <label className={`${labelClass} xl:col-span-8`}>
              <span className={labelTextClass}>Issue title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Optional issue title"
                className={inputBaseClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
              <label className={labelClass}>
                <span className={labelTextClass}>Volume</span>
                <input
                  type="number"
                  min={1}
                  value={volume}
                  onChange={(event) => setVolume(event.target.value)}
                  placeholder="1"
                  className={inputBaseClass}
                />
                <span className="block text-[11px] text-slate-500">Journal volume.</span>
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Issue number</span>
                <input
                  type="number"
                  min={1}
                  value={issueNumber}
                  onChange={(event) => setIssueNumber(event.target.value)}
                  placeholder="1"
                  className={inputBaseClass}
                />
                <span className="block text-[11px] text-slate-500">Issue within the volume.</span>
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Publication year</span>
                <input
                  type="number"
                  min={1900}
                  value={publicationYear}
                  onChange={(event) => setPublicationYear(event.target.value)}
                  placeholder="2026"
                  className={inputBaseClass}
                />
                <span className="block text-[11px] text-slate-500">Official year of publication.</span>
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Publication date</span>
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
                  className={inputBaseClass}
                />
                <span className="block text-[11px] text-slate-500">Optional exact date.</span>
              </label>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#D8E4F6] bg-[#F8FBFF] px-4 py-4 text-sm leading-6 text-slate-600">
            After selecting articles, <span className="font-semibold text-[#0B1C4D]">Order</span> defines article sequence.
            <span className="ml-1 font-semibold text-[#0B1C4D]">Page Start / Page End</span> are calculated automatically from PDF page count.
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#D8E4F6] bg-[#F8FBFF] px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F6] bg-white px-3 py-1 text-sm font-semibold text-[#0B1C4D] shadow-sm">
                Selected articles
                <span className="rounded-full bg-[#1D4ED8] px-2.5 py-0.5 text-xs font-bold text-white">
                  {selectedCount}
                </span>
              </p>
              <p className="text-xs leading-5 text-slate-600">
                {blockedPdfCount > 0
                  ? `${blockedPdfCount} article(s) are hidden from publishing because their manuscript PDF is missing.`
                  : 'All visible articles are eligible for journal build.'}
              </p>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:min-w-[220px]">
              <button
                type="button"
                onClick={onPublish}
                disabled={publishMutation.isPending}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1D4ED8] px-5 py-3 text-sm font-semibold shadow-[0_12px_28px_rgba(29,78,216,0.22)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:brightness-110 hover:shadow-[0_22px_44px_rgba(29,78,216,0.35)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                }}
              >
                {publishMutation.isPending || isValidating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {publishMutation.isPending ? 'Building issue...' : 'Validating...'}
                  </>
                ) : (
                  <>
                    <FileDown size={15} className="transition-transform duration-200 group-hover:scale-110" />
                    {editingIssueId ? 'Update issue' : 'Make issue'}
                  </>
                )}
              </button>

              {showLoadingProcess && (
                <div className="rounded-xl border border-[#D8E4F6] bg-white px-3 py-2 text-xs text-[#0B1C4D] shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-[#1D4ED8]" />
                    {publishMutation.isPending
                      ? 'Loading process is running: creating issue and merging PDF...'
                      : isValidating
                        ? 'Loading process is running: validating selected data...'
                        : 'Loading process is running: preparing submissions and issues...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-[28px] border bg-white p-5 shadow-[0_20px_60px_rgba(11,28,77,0.08)] md:p-6"
        style={{ borderColor: '#D8E4F6' }}
      >
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h3 className="text-lg font-semibold text-[#0B1C4D]">
              Accepted / Published Articles ({editableSubmissions.length})
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Choose the articles to include in the next journal issue.
            </p>
          </div>
          <div className="w-full md:w-96">
            <span className={labelTextClass}>Filter</span>
            <div className="mt-2 flex items-center gap-3 rounded-full border border-[#C9DCF6] bg-[#F8FBFF] px-4 py-3 shadow-sm transition focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#BFDBFE]">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or author"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {loadingAccepted ? (
          <div className="mt-4 rounded-2xl border border-[#D8E4F6] bg-[#F8FBFF] px-4 py-5 text-sm text-[#0B1C4D] shadow-sm">
            <div className="flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-[#1D4ED8]" />
              <div>
                <p className="font-semibold">Loading accepted/published submissions...</p>
                <p className="text-xs text-slate-600">Preparing articles for journal assembly.</p>
              </div>
            </div>
          </div>
        ) : visibleSubmissions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No accepted or published submissions found.</p>
        ) : visibleEligibleCount === 0 ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
            Accepted articles exist, but none can be added because their manuscript PDF is missing.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {visibleSubmissions.map((submission) => {
              const rowState = rows[submission.id];
              const selected = rowState?.selected || false;
              const autoRow = autoPaginationBySubmissionId.get(submission.id);
              const pageCount = submission.manuscript_page_count || autoRow?.page_count || 1;
              const canSelect = Boolean(submission.manuscript_pdf_url);

              return (
                <div
                  key={submission.id}
                  className="rounded-2xl border bg-[#F8FBFF] p-4"
                  style={{ borderColor: selected ? '#93C5FD' : '#D8E4F6' }}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <label className="inline-flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelection(submission)}
                        disabled={!canSelect || publishMutation.isPending}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8] disabled:cursor-not-allowed"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[#0B1C4D]">
                          {submission.title || 'Untitled'}
                        </span>
                        <span
                          className="mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                          style={{
                            backgroundColor: STATUS_STYLES[submission.status]?.bg || '#F8FAFC',
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
                        {canSelect ? (
                          <a
                            href={submission.manuscript_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                          >
                            <FileText size={13} />
                            View PDF
                          </a>
                        ) : (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            <AlertTriangle size={12} />
                            Manuscript PDF missing
                          </span>
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
                            className="w-full rounded-lg border px-2 py-2 text-xs outline-none transition focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#BFDBFE]"
                            style={{ borderColor: '#C9DCF6' }}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[11px] text-slate-500">Page Start</span>
                          <input
                            type="number"
                            value={autoRow?.page_start || ''}
                            readOnly
                            className="w-full rounded-lg border bg-white px-2 py-2 text-xs outline-none"
                            style={{ borderColor: '#C9DCF6' }}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[11px] text-slate-500">Page End</span>
                          <input
                            type="number"
                            value={autoRow?.page_end || ''}
                            readOnly
                            className="w-full rounded-lg border bg-white px-2 py-2 text-xs outline-none"
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
        className="rounded-[28px] border bg-white p-5 shadow-[0_20px_60px_rgba(11,28,77,0.08)] md:p-6"
        style={{ borderColor: '#D8E4F6' }}
      >
        <h3 className="text-lg font-semibold text-[#0B1C4D]">Published Issues</h3>
        {loadingIssues ? (
          <div className="mt-3 rounded-2xl border border-[#D8E4F6] bg-[#F8FBFF] px-4 py-6 text-sm text-slate-500">
            Loading issues...
          </div>
        ) : existingIssues.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No published issues yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {existingIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-2xl border bg-[#F8FBFF] p-4"
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
