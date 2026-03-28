import React from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, FileText } from 'lucide-react';
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
    <div className="bg-[#F7FAFF] pb-16 pt-6 md:pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/published"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-300 hover:text-[#1D4ED8]"
        >
          <ArrowLeft size={16} />
          Back to Published Issues
        </Link>

        <section
          className="rounded-2xl border bg-white p-8 shadow-sm"
          style={{ borderColor: '#D8E4F6' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1D4ED8]">
            Volume {issue.volume}, Issue {issue.issue_number}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#0B1C4D]">{issue.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {issue.publication_date || issue.publication_year}
          </p>

          {issue.full_issue_pdf_url && (
            <div className="mt-6 flex justify-center">
              <a
                href={issue.full_issue_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Download size={16} />
                Download Full Journal PDF
              </a>
            </div>
          )}
        </section>

        <section
          className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
          style={{ borderColor: '#D8E4F6' }}
        >
          <h2 className="text-xl font-semibold text-[#0B1C4D]">Table of Contents</h2>
          {issue.articles.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No articles in this issue yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {issue.articles.map((article) => (
                <article
                  key={article.id}
                  className="rounded-xl border bg-[#F8FBFF] p-4 transition-all duration-300 hover:shadow-sm"
                  style={{ borderColor: '#D8E4F6' }}
                >
                  <h3 className="text-base font-semibold text-[#0B1C4D]">{article.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {article.authors?.map((author) => author.full_name).join(', ') || 'Unknown Author'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {pagesLabel(article.page_start, article.page_end)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {article.pdf_public_url && (
                      <a
                        href={article.pdf_public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#1D4ED8] px-3 py-1.5 text-sm font-semibold text-[#1D4ED8] transition-all duration-300 hover:bg-[#EFF6FF]"
                      >
                        <FileText size={14} />
                        View/Download PDF
                      </a>
                    )}
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
