import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal } from 'lucide-react';
import { getPublishedIssues } from '../lib/queries-api';

export function PublishedIssues() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / ITEMS_PER_PAGE));

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
    return filteredIssues.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIssues, page]);

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
      className="relative overflow-hidden pb-18 pt-8 md:pt-10"
      style={{
        background: '#F8FAFC',
        fontFamily: 'Geist, Inter, Segoe UI, sans-serif',
      }}
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm md:px-6 md:py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-2.5">
              <p className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                Academic Archive
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-3xl font-bold leading-tight text-slate-800 md:text-4xl">
                  Published Issues
                </h1>
                <span className="inline-flex h-7 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-700 shadow-sm">
                  <BookOpen size={13} className="text-slate-600" />
                  {filteredIssues.length} ta son
                </span>
              </div>
              <p className="text-base leading-7 text-gray-600">
                Sonlarni tez toping, TOC ko‘ring va to‘liq PDFni yuklab oling.
              </p>
            </div>
          </div>

          <div className="mt-5 flex w-full flex-row items-center gap-3">
            <label className="flex h-[52px] min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:shadow-[0_8px_22px_rgba(37,99,235,0.14)]">
              <Search size={18} strokeWidth={2.2} className="shrink-0 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sarlavha, volume, issue yoki yil bo‘yicha qidiring"
                className="w-full bg-transparent text-sm leading-none text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="relative flex h-[52px] w-[220px] min-w-[200px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:shadow-[0_8px_22px_rgba(37,99,235,0.14)]">
              <SlidersHorizontal size={18} strokeWidth={2.2} className="shrink-0 text-slate-500" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'newest' | 'oldest')}
                className="w-full appearance-none bg-transparent pr-7 text-sm leading-none text-slate-700 outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-500" />
            </label>
          </div>
        </section>

        {filteredIssues.length === 0 ? (
          <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Qidiruv bo‘yicha mos sonlar topilmadi.
          </section>
        ) : (
          <section className="mt-6 space-y-3">
            {paginatedIssues.map((issue, index) => {
              const displayIndex = (page - 1) * ITEMS_PER_PAGE + index + 1;
              return (
                <article
                  key={issue.id}
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 hover:border-blue-200"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="flex flex-wrap items-center gap-1.5 text-xs font-medium tracking-tight text-slate-500">
                        <span>Vol {issue.volume}</span>
                        <span className="text-slate-400">•</span>
                        <span>Issue {issue.issue_number}</span>
                        <span className="text-slate-400">•</span>
                        <span>{issue.publication_year}</span>
                      </p>

                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h2 className="min-w-0 break-words text-lg font-semibold leading-tight text-slate-800 [overflow-wrap:anywhere]">
                          {displayIndex}. {issue.title || `Volume ${issue.volume}, Issue ${issue.issue_number}`}
                        </h2>

                        <div className="flex shrink-0 items-center gap-1">
                          <Link
                            to={`/published/${issue.id}`}
                            className="inline-flex h-8 items-center justify-center rounded-xl px-2.5 text-xs font-semibold text-[#1E3A8A] transition-colors hover:bg-blue-50 hover:text-blue-700"
                          >
                            View TOC
                          </Link>
                          {issue.full_issue_pdf_url ? (
                            <a
                              href={issue.full_issue_pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl px-2.5 text-xs font-semibold text-[#1E3A8A] transition-colors hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Download size={12} />
                              Full PDF
                            </a>
                          ) : (
                            <span className="inline-flex h-8 items-center justify-center rounded-xl px-2.5 text-[11px] font-medium text-slate-400">
                              PDF unavailable
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays size={12} className="text-slate-500" />
                        {issue.publication_date || issue.publication_year}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
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
          </section>
        )}
      </div>
    </div>
  );
}
