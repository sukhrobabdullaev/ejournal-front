import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Download, FileText, Layers, Search, SlidersHorizontal } from 'lucide-react';
import { getPublishedIssues } from '../lib/queries-api';

export function PublishedIssues() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['published-issues'],
    queryFn: getPublishedIssues,
  });

  const filteredIssues = useMemo(() => {
    const text = query.trim().toLowerCase();

    const base = issues.filter((issue) => {
      if (!text) {
        return true;
      }

      const haystack = [
        issue.title,
        `volume ${issue.volume}`,
        `issue ${issue.issue_number}`,
        String(issue.publication_year),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(text);
    });

    const sorted = [...base].sort((a, b) => {
      const aDate = a.publication_date || `${a.publication_year}-01-01`;
      const bDate = b.publication_date || `${b.publication_year}-01-01`;

      if (sortBy === 'newest') {
        return bDate.localeCompare(aDate);
      }
      return aDate.localeCompare(bDate);
    });

    return sorted;
  }, [issues, query, sortBy]);

  const featuredIssue = filteredIssues[0] || null;
  const remainingIssues = featuredIssue ? filteredIssues.slice(1) : [];
  const totalPages = Math.max(1, Math.ceil(remainingIssues.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [query, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedIssues = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return remainingIssues.slice(start, start + ITEMS_PER_PAGE);
  }, [remainingIssues, page]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#1D4ED8] border-t-transparent" />
          <p className="text-sm text-slate-600">Loading published issues...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white px-4 text-center">
        <p className="text-sm text-red-600">Failed to load published issues.</p>
      </div>
    );
  }

  return (
    <div
      className="relative pb-18 pt-8 md:pt-10"
      style={{
        background: '#F8FAFC',
        fontFamily: 'Geist, Inter, Segoe UI, sans-serif',
      }}
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <section className="sticky top-3 z-20 rounded-[28px] border border-[#E2E8F0] bg-white/95 px-6 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm md:px-8 md:py-7">
          <div className="max-w-3xl space-y-3">
            <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
              Academic Archive
            </p>
            <h1 className="text-3xl font-bold leading-tight text-slate-800 md:text-4xl">
              Published Issues
            </h1>
            <p className="text-base leading-7 text-gray-600">
              Sonlarni tez toping, TOC ko‘ring va to‘liq PDFni yuklab oling.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <label
              className="relative flex min-w-0 items-center rounded-full border border-slate-200 bg-white shadow-sm transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:shadow-[0_8px_22px_rgba(37,99,235,0.14)] lg:flex-1"
              style={{ height: 50 }}
            >
              <Search size={18} strokeWidth={2.2} className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sarlavha, volume, issue yoki yil bo‘yicha qidiring"
                className="h-full w-full rounded-full bg-transparent text-[15px] leading-none text-slate-700 outline-none placeholder:text-slate-400"
                style={{ paddingLeft: 52, paddingRight: 20 }}
              />
            </label>

            <div className="flex items-center gap-3 lg:ml-auto">
              <label
                className="relative flex min-w-[248px] items-center rounded-full border border-slate-200 bg-white shadow-sm transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:shadow-[0_8px_22px_rgba(37,99,235,0.14)]"
                style={{ height: 48 }}
              >
                <SlidersHorizontal size={17} strokeWidth={2.1} className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as 'newest' | 'oldest')}
                  className="h-full w-full rounded-full bg-transparent text-[15px] leading-none text-slate-700 outline-none"
                  style={{ paddingLeft: 50, paddingRight: 36 }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>

              <div className="inline-flex h-12 min-w-[132px] items-center justify-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 text-sm font-semibold text-[#1D4ED8]">
                <BookOpen size={13} className="text-[#1D4ED8]" />
                {filteredIssues.length} ta son
              </div>
            </div>
          </div>
        </section>

        {filteredIssues.length === 0 ? (
          <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Qidiruv bo‘yicha mos sonlar topilmadi.
          </section>
        ) : (
          <>
            {featuredIssue && (
              <section className="mt-6">
                <article className="rounded-[20px] border border-[#D9E6FB] bg-[#F8FAFC] p-6 shadow-[0_10px_28px_rgba(15,23,42,0.08)] md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
                    <div
                      className="relative shrink-0 overflow-hidden rounded-2xl border border-[#BFDBFE] p-5 text-white shadow-[0_14px_28px_rgba(37,99,235,0.35)] md:w-[230px]"
                      style={{ background: 'linear-gradient(145deg, #1E3A8A 0%, #2563EB 55%, #60A5FA 100%)' }}
                    >
                      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15" />
                      <span className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/10" />

                      <div className="relative flex h-full min-h-[240px] flex-col justify-between rounded-xl border border-white/25 bg-white/12 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#DCE9FF' }}>
                          Ditech Asia Journal
                        </p>

                        <div>
                          <h2 className="text-[46px] font-black leading-none" style={{ color: '#FFFFFF' }}>
                            Vol {featuredIssue.volume}
                          </h2>
                          <p className="mt-2 text-lg font-semibold" style={{ color: '#EDF4FF' }}>
                            Issue {featuredIssue.issue_number}
                          </p>
                        </div>

                        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/22 px-3 py-1 text-xs font-semibold" style={{ color: '#FFFFFF' }}>
                          <CalendarDays size={12} />
                          {featuredIssue.publication_date || featuredIssue.publication_year}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <div className="mb-2">
                        <span className="inline-flex items-center rounded-full border border-[#BFDBFE] bg-[#DBEAFE] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8]">
                          Featured Issue
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1D4ED8]">
                          <Layers size={12} /> Vol {featuredIssue.volume}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                          Issue {featuredIssue.issue_number}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                          {featuredIssue.publication_year}
                        </span>
                      </div>

                      <h2
                        className="mt-3 min-w-0 break-words text-2xl font-semibold leading-snug text-slate-900 [overflow-wrap:anywhere] md:text-[2rem]"
                        style={{ fontFamily: 'Inter, Roboto, Segoe UI, sans-serif' }}
                      >
                        {featuredIssue.title || `Volume ${featuredIssue.volume}, Issue ${featuredIssue.issue_number}`}
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Eng so‘nggi nashr. TOC orqali maqolalarni tez ko‘ring yoki to‘liq PDFni bir bosishda yuklab oling.
                      </p>

                      <div className="mt-6 flex flex-wrap items-center justify-start gap-2.5 md:justify-end">
                        <Link
                          to={`/published/${featuredIssue.id}`}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-5 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-[#93C5FD] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                        >
                          <FileText size={14} />
                          View TOC
                        </Link>

                        {featuredIssue.full_issue_pdf_url ? (
                          <a
                            href={featuredIssue.full_issue_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(29,78,216,0.30)] transition-all duration-200 hover:bg-[#1E40AF] hover:shadow-[0_12px_24px_rgba(29,78,216,0.36)]"
                          >
                            <Download size={14} />
                            Full PDF
                          </a>
                        ) : (
                          <span className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-medium text-slate-400">
                            PDF unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            )}

            {paginatedIssues.length > 0 && (
              <section className="mt-5">
                <div className="space-y-4">
                  {paginatedIssues.map((issue) => {
                    return (
                      <article
                        key={issue.id}
                        className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-[#BFDBFE] hover:shadow-[0_10px_22px_rgba(37,99,235,0.10)] md:p-7"
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1D4ED8]">
                                <Layers size={12} /> Vol {issue.volume}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                                Issue {issue.issue_number}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                                {issue.publication_year}
                              </span>
                            </div>

                            <h3
                              className="mt-4 min-w-0 break-words text-[1.7rem] font-semibold leading-snug text-slate-900 [overflow-wrap:anywhere]"
                              style={{ fontFamily: 'Inter, Roboto, Segoe UI, sans-serif' }}
                            >
                              {issue.title || `Volume ${issue.volume}, Issue ${issue.issue_number}`}
                            </h3>

                            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
                              <CalendarDays size={14} className="text-slate-400" />
                              {issue.publication_date || issue.publication_year}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-wrap items-center gap-2.5 md:pl-4">
                            <Link
                              to={`/published/${issue.id}`}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-5 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-[#93C5FD] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                            >
                              <FileText size={14} />
                              View TOC
                            </Link>

                            {issue.full_issue_pdf_url ? (
                              <a
                                href={issue.full_issue_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(29,78,216,0.28)] transition-all duration-200 hover:bg-[#1E40AF] hover:shadow-[0_10px_20px_rgba(29,78,216,0.32)]"
                              >
                                <Download size={14} />
                                Full PDF
                              </a>
                            ) : (
                              <span className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-medium text-slate-400">
                                PDF unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {totalPages > 1 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#C7D6FA] bg-white px-3 text-xs font-medium text-[#1D3A8F] transition-all duration-300 hover:bg-[#EEF4FF] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all duration-300 ${
                      page === p
                        ? 'border-[#4F46E5] bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-[0_8px_16px_rgba(79,70,229,0.3)]'
                        : 'border-[#C7D6FA] bg-white text-[#1D3A8F] hover:bg-[#EEF4FF]'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#C7D6FA] bg-white px-3 text-xs font-medium text-[#1D3A8F] transition-all duration-300 hover:bg-[#EEF4FF] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
