import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, FileDown, FileText, Loader2, Search, Info } from 'lucide-react';
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
  'w-full rounded-xl border bg-slate-50/50 px-[18px] py-3.5 text-[15px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#1D4ED8] focus:bg-white focus:ring-4 focus:ring-[#1D4ED8]/10';

const labelClass = 'space-y-2 block';
const labelTextClass = 'text-[12.5px] font-semibold uppercase tracking-wider text-slate-600';

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
    if (!query) return editableSubmissions;
    
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

  // Validation logic: Tugmani faollashtirish uchun barcha qoidalar tekshiriladi
  const isFormReady = useMemo(() => {
    if (!volume || Number(volume) < 1) return false;
    if (!issueNumber || Number(issueNumber) < 1) return false;
    if (!publicationYear || Number(publicationYear) < 1900) return false;
    
    if (selectedCount === 0) return false;

    const selectedRows = Object.values(rows).filter((r) => r.selected);
    for (const row of selectedRows) {
      if (!row.order || Number(row.order) < 1) return false;
    }

    return true;
  }, [volume, issueNumber, publicationYear, selectedCount, rows]);

  React.useEffect(() => {
    if (!selectedIssue) return;

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

  const updateRow = (submissionId: number, field: 'order', value: string) => {
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
    if (!isFormReady) return;
    
    setError(null);
    setSuccess(null);
    setIsValidating(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    const selectedRows = autoPaginationRows.map((row) => ({
      submission_id: row.submission_id,
      order: row.order,
      page_start: row.page_start,
      page_end: row.page_end,
    }));

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

    publishMutation.mutate({
      payload,
      issueId: editingIssueId || undefined,
    });
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Header & Configuration Section */}
      <section
        className="relative overflow-hidden rounded-[24px] border bg-white p-6 shadow-[0_8px_30px_rgba(11,28,77,0.06)] md:p-8"
        style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
        aria-busy={isBusy}
      >
        {isBusy && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-white/60 px-6 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 text-sm text-[#0B1C4D] shadow-[0_20px_40px_rgba(29,78,216,0.1)]">
              <div className="flex items-center gap-3">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <div>
                  <p className="text-base font-bold text-slate-900">Building issue PDF</p>
                  <p className="mt-0.5 text-xs text-slate-500">Saving selected articles, calculating pages and merging files...</p>
                </div>
              </div>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        )}

        <div className={isBusy ? 'pointer-events-none opacity-50 transition-opacity' : 'transition-opacity'}>
          <div className="mb-8">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-600">
              Editor Workspace
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Make Journal
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
              Build a full journal issue from accepted submissions and generate one master PDF.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              <AlertTriangle size={18} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              {success}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-12">
            <label className={`${labelClass} xl:col-span-4`}>
              <span className={labelTextClass}>Issue Mode</span>
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
              <span className={labelTextClass}>Issue Title (Optional)</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Special Edition on AI"
                className={inputBaseClass}
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
              <label className={labelClass}>
                <span className={labelTextClass}>Volume <span className="text-red-500">*</span></span>
                <input
                  type="number"
                  min={1}
                  value={volume}
                  onChange={(event) => setVolume(event.target.value)}
                  placeholder="1"
                  className={inputBaseClass}
                />
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Issue Number <span className="text-red-500">*</span></span>
                <input
                  type="number"
                  min={1}
                  value={issueNumber}
                  onChange={(event) => setIssueNumber(event.target.value)}
                  placeholder="1"
                  className={inputBaseClass}
                />
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Publication Year <span className="text-red-500">*</span></span>
                <input
                  type="number"
                  min={1900}
                  value={publicationYear}
                  onChange={(event) => setPublicationYear(event.target.value)}
                  placeholder="2026"
                  className={inputBaseClass}
                />
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Publication Date</span>
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
              </label>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:p-6 border border-slate-100">
            <div className="w-full sm:flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-bold text-slate-900">Selected Articles</h3>
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white shadow-sm">
                  {selectedCount}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                {blockedPdfCount > 0
                  ? `${blockedPdfCount} article(s) are hidden because their PDF is missing.`
                  : 'All visible articles are eligible for the journal build.'}
              </p>
            </div>
            
            <div className="w-full sm:w-auto">
              <button
  type="button"
  onClick={onPublish}
  disabled={!isFormReady || isBusy}
  // py-4 va min-h-[50px] orqali tugma qalinlashadi (balandligi oshadi)
  className="group relative flex w-full min-h-[50px] items-center justify-center gap-2.0 overflow-hidden rounded-xl px-8 py-4 text-[15px] font-bold transition-all disabled:cursor-not-allowed sm:w-auto"
  style={{
    backgroundColor: (!isFormReady || isBusy) ? '#E2E8F0' : '#1D4ED8',
    color: (!isFormReady || isBusy) ? '#64748B' : '#FFFFFF',
    boxShadow: (!isFormReady || isBusy) ? 'none' : '0 10px 20px -5px rgba(29, 78, 216, 0.35)',
  }}
>
  {publishMutation.isPending || isValidating ? (
    <Loader2 size={16} className="animate-spin" />
  ) : (
    <FileDown size={16} className={(!isFormReady || isBusy) ? '' : 'transition-transform group-hover:-translate-y-0.5'} />
  )}
  <span>{editingIssueId ? 'Update Issue' : 'Make Issue'}</span>
</button>
              {!isFormReady && (
                <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                  Fill required fields & select articles
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Articles Selection Section */}
      <section
        className="rounded-[24px] border bg-white p-6 shadow-[0_8px_30px_rgba(11,28,77,0.06)] md:p-8"
        style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
      >
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Article Library <span className="text-slate-400">({editableSubmissions.length})</span>
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Select the accepted articles to construct your journal issue.
            </p>
          </div>
          <div className="w-full md:w-80">
            <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 hover:border-slate-400">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles by title or author..."
                className="h-full w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {loadingAccepted ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="mt-4 text-sm font-bold text-slate-700">Loading library...</p>
          </div>
        ) : visibleSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12">
            <Info size={32} className="text-slate-400" />
            <p className="mt-4 text-sm font-bold text-slate-700">No submissions found.</p>
          </div>
        ) : visibleEligibleCount === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-medium text-amber-800">
            Articles match your search, but they are missing PDF manuscripts and cannot be selected.
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleSubmissions.map((submission) => {
              const rowState = rows[submission.id];
              const selected = rowState?.selected || false;
              const autoRow = autoPaginationBySubmissionId.get(submission.id);
              const pageCount = submission.manuscript_page_count || autoRow?.page_count || 1;
              const canSelect = Boolean(submission.manuscript_pdf_url);

              return (
                <div
                  key={submission.id}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all ${
                    selected 
                      ? 'border-blue-400 bg-blue-50/30 shadow-[0_4px_15px_rgba(29,78,216,0.05)]' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <label className="flex cursor-pointer items-start gap-4 flex-1">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelection(submission)}
                          disabled={!canSelect || publishMutation.isPending}
                          className="h-5 w-5 rounded border-slate-300 text-blue-600 transition-colors focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-base font-bold leading-tight ${selected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {submission.title || 'Untitled'}
                        </h4>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                          <span
                            className="inline-flex rounded-md border px-2 py-0.5 font-bold uppercase tracking-wide"
                            style={{
                              backgroundColor: STATUS_STYLES[submission.status]?.bg || '#F8FAFC',
                              color: STATUS_STYLES[submission.status]?.color || '#475569',
                              borderColor: STATUS_STYLES[submission.status]?.border || '#E2E8F0',
                            }}
                          >
                            {STATUS_LABELS[submission.status] || submission.status}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                          <span>{submission.author_name || submission.author_email}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                          <span>{formatDate(submission.updated_at)}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                          <span>Pages: {pageCount}</span>
                        </div>

                        {!canSelect && (
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                            <AlertTriangle size={14} />
                            PDF Missing — Cannot Select
                          </div>
                        )}
                      </div>
                    </label>

                    {selected && (
                      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-white p-3 shadow-sm lg:w-auto">
                        <label className="flex w-20 flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order</span>
                          <input
                            type="number"
                            min={1}
                            value={rowState?.order || ''}
                            onChange={(event) => updateRow(submission.id, 'order', event.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-center text-sm font-bold text-blue-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                        <label className="flex w-20 flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pg Start</span>
                          <input
                            type="number"
                            value={autoRow?.page_start || ''}
                            readOnly
                            className="w-full rounded-lg border border-transparent bg-slate-100 px-2 py-1.5 text-center text-sm font-bold text-slate-600 outline-none"
                          />
                        </label>
                        <label className="flex w-20 flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pg End</span>
                          <input
                            type="number"
                            value={autoRow?.page_end || ''}
                            readOnly
                            className="w-full rounded-lg border border-transparent bg-slate-100 px-2 py-1.5 text-center text-sm font-bold text-slate-600 outline-none"
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

      {/* 3. Published Issues History */}
      <section
        className="rounded-[24px] border bg-white p-6 shadow-[0_8px_30px_rgba(11,28,77,0.06)] md:p-8"
        style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-6">Published Issues Archive</h3>
        {loadingIssues ? (
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 size={16} className="animate-spin text-blue-600" />
            Loading archive...
          </div>
        ) : existingIssues.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">No published issues in the archive yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {existingIssues.map((issue) => (
              <div
                key={issue.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md"
              >
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Volume {issue.volume}, Issue {issue.issue_number}
                  </h4>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {issue.publication_date || issue.publication_year}
                  </p>
                  {issue.title && (
                    <p className="mt-3 text-sm font-medium text-slate-700 line-clamp-2">
                      {issue.title}
                    </p>
                  )}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <FileText size={14} />
                    {issue.articles?.length || 0} Articles
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}