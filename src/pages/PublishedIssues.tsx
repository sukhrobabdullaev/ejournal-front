import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarDays, ChevronDown, Download, Search, SlidersHorizontal } from 'lucide-react';
import { getPublishedIssues } from '../lib/queries-api';

export function PublishedIssues() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

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

  const currentIssue = filteredIssues[0] || null;
  const archiveIssues = filteredIssues.slice(1);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F7FAFF]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#1D4ED8] border-t-transparent" />
          <p className="text-sm text-slate-600">Loading published issues...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F7FAFF] px-4 text-center">
        <p className="text-sm text-red-600">Failed to load published issues.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F8FE] pb-16 pt-6 md:pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#D9E5FA] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="break-words text-2xl font-bold text-[#0B1C4D] sm:text-3xl md:text-4xl">Published Journals</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
                Browse published issues, open table of contents, and access full PDFs.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#CFE0FF] bg-[#F3F8FF] px-3 py-2 text-sm font-semibold text-[#1D4ED8]">
              <BookOpen size={16} />
              {filteredIssues.length} issues
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_210px]">
            <label className="flex h-14 items-center gap-3 rounded-xl border border-[#D8E4F6] bg-white px-4 transition-colors focus-within:border-[#93C5FD]">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, volume, issue, year"
                className="w-full bg-transparent text-sm leading-none text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="relative flex h-14 items-center gap-3 rounded-xl border border-[#D8E4F6] bg-white px-4 transition-colors focus-within:border-[#93C5FD]">
              <SlidersHorizontal size={16} className="shrink-0 text-slate-400" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'newest' | 'oldest')}
                className="w-full appearance-none bg-transparent pr-8 text-sm leading-none text-slate-700 outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <ChevronDown size={17} className="pointer-events-none absolute right-4 text-slate-500" />
            </label>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[#C9DCF6] bg-white p-10 text-center text-sm text-slate-500">
            No matching issues found.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {currentIssue && (
              <section className="rounded-2xl border border-[#D8E4F6] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#1D4ED8]">Current Issue</p>
                    <h2 className="mt-2 break-words text-xl font-bold leading-tight text-[#0B1C4D] sm:text-2xl md:text-3xl [overflow-wrap:anywhere]">
                      {currentIssue.title || `Volume ${currentIssue.volume}, Issue ${currentIssue.issue_number}`}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-sm text-slate-600">
                      <span className="inline-flex items-center rounded-md bg-[#F5F9FF] px-2.5 py-1.5 font-semibold text-slate-700">
                        Vol. {currentIssue.volume} No. {currentIssue.issue_number}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F5F9FF] px-2.5 py-1.5">
                        <CalendarDays size={14} />
                        {currentIssue.publication_date || currentIssue.publication_year}
                      </span>
                    </div>
                  </div>
                  <BookOpen size={22} className="text-[#1D4ED8]" />
                </div>

                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
                  <Link
                    to={`/published/${currentIssue.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-[#1D4ED8] transition-all duration-300 hover:bg-[#EFF6FF] sm:w-auto"
                  >
                    Open Table of Contents
                  </Link>
                  {currentIssue.full_issue_pdf_url && (
                    <a
                      href={currentIssue.full_issue_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-md sm:w-auto"
                    >
                      <Download size={14} />
                      Download Full PDF
                    </a>
                  )}
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-2xl border border-[#D8E4F6] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="border-b border-[#E3ECFB] px-5 py-4 sm:px-6 md:px-7">
                <h3 className="text-lg font-semibold text-[#0B1C4D]">Archive</h3>
              </div>

              <div className="divide-y divide-[#EEF3FC]">
                {archiveIssues.length === 0 ? (
                  <div className="px-6 py-8 text-sm text-slate-500">No additional archive issues.</div>
                ) : (
                  archiveIssues.map((issue) => (
                    <article key={issue.id} className="px-5 py-5 transition-colors hover:bg-[#FAFCFF] sm:px-6 md:px-7">
                      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#1D4ED8]">
                            Volume {issue.volume} | Issue {issue.issue_number}
                          </p>
                          <h4 className="mt-1 break-words text-base font-semibold text-[#0B1C4D] sm:text-lg [overflow-wrap:anywhere]">
                            {issue.title || `Volume ${issue.volume}, Issue ${issue.issue_number}`}
                          </h4>
                          <p className="mt-1 text-sm text-slate-600">
                            {issue.publication_date || issue.publication_year}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
                          <Link
                            to={`/published/${issue.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1D4ED8] px-3 py-2 text-xs font-semibold text-[#1D4ED8] transition-colors hover:bg-[#EFF6FF]"
                          >
                            Open
                          </Link>
                          {issue.full_issue_pdf_url && (
                            <a
                              href={issue.full_issue_pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF]"
                            >
                              <Download size={12} />
                              PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
