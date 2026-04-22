import React from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Download, FileText } from 'lucide-react';
import { getPublishedIssueById } from '../lib/queries-api';

const pagesLabel = (start?: number | null, end?: number | null) => {
  if (!start || !end) {
    return 'Pages: N/A';
  }
  return `Pages: ${start}-${end}`;
};

export function PublishedIssueDetail() {
  const { issueId } = useParams();
  const { data: issue, isLoading, isError } = useQuery({
    queryKey: ['published-issue-detail', issueId],
    queryFn: () => getPublishedIssueById(issueId || ''),
    enabled: !!issueId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F7FAFF]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#1D4ED8] border-t-transparent" />
          <p className="text-sm text-slate-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F7FAFF] px-4 text-center">
        <p className="text-sm text-red-600">Issue not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F8FE] pb-16 pt-6 md:pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/published"
          className="mb-5 inline-flex items-center gap-2.5 text-sm font-medium text-slate-500 transition-all duration-300 hover:text-[#1D4ED8]"
        >
          <ArrowLeft size={16} />
          Back to Published Issues
        </Link>

        <section className="rounded-2xl border border-[#D8E4F6] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:p-6 md:p-9">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1D4ED8]">Published Issue</p>
          <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-[#0B1C4D] sm:text-3xl md:text-4xl [overflow-wrap:anywhere]">{issue.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-sm text-slate-600">
            <span className="inline-flex items-center rounded-md bg-[#F5F9FF] px-2.5 py-1.5 font-semibold text-slate-700">
              Vol. {issue.volume} No. {issue.issue_number}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F5F9FF] px-2.5 py-1.5">
              <CalendarDays size={14} />
              {issue.publication_date || issue.publication_year}
            </span>
          </div>

          {issue.full_issue_pdf_url && (
            <div className="mt-6">
              <a
                href={issue.full_issue_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1D4ED8] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1E40AF]"
              >
                <Download size={16} />
                Download Full Journal PDF
              </a>
            </div>
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#D8E4F6] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[#E3ECFB] px-5 py-4 sm:px-6 md:px-7 md:py-[18px]">
            <h2 className="break-words text-2xl font-semibold text-[#0B1C4D] sm:text-3xl">Table of Contents</h2>
          </div>

          {issue.articles.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-500">No articles in this issue yet.</p>
          ) : (
            <div className="divide-y divide-[#EEF3FC]">
              {issue.articles.map((article) => (
                <article
                  key={article.id}
                  className="px-5 py-5 transition-colors hover:bg-[#FAFCFF] sm:px-6 md:px-7"
                >
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-semibold leading-snug text-[#0B1C4D] [overflow-wrap:anywhere]">{article.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {article.authors?.map((author) => author.full_name).join(', ') || 'Unknown Author'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {pagesLabel(article.page_start, article.page_end)}
                      </p>
                      {article.doi && (
                        <a
                          href={`https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex text-sm font-semibold text-[#2563EB] hover:underline"
                        >
                          DOI: {article.doi}
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {article.pdf_public_url && (
                        <a
                          href={article.pdf_public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1D4ED8] px-3 py-2 text-xs font-semibold text-[#1D4ED8] transition-all duration-300 hover:bg-[#EFF6FF]"
                        >
                          <FileText size={13} />
                          View PDF
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
