import React from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Download } from 'lucide-react';
import { getPublishedIssues } from '../lib/queries-api';

export function PublishedIssues() {
  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['published-issues'],
    queryFn: getPublishedIssues,
  });

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
    <div className="bg-[#F7FAFF] pb-16 pt-6 md:pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#0B1C4D] to-[#1D4ED8] px-8 py-10 text-white shadow-sm">
          <h1 className="text-3xl font-bold">Published Issues</h1>
          <p className="mt-2 text-sm text-blue-100">
            Browse complete journal volumes and download full merged PDFs.
          </p>
        </div>

        {issues.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[#C9DCF6] bg-white p-10 text-center text-sm text-slate-500">
            No published issues yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {issues.map((issue) => (
              <article
                key={issue.id}
                className="rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: '#D8E4F6' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#1D4ED8]">
                      Volume {issue.volume} | Issue {issue.issue_number}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#0B1C4D]">
                      {issue.title || `Volume ${issue.volume}, Issue ${issue.issue_number}`}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {issue.publication_date || issue.publication_year}
                    </p>
                  </div>
                  <BookOpen size={20} className="text-[#1D4ED8]" />
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    to={`/published/${issue.id}`}
                    className="inline-flex items-center rounded-lg border border-[#1D4ED8] px-3 py-2 text-sm font-semibold text-[#1D4ED8] transition-all duration-300 hover:bg-[#EFF6FF]"
                  >
                    Open Table of Contents
                  </Link>
                  {issue.full_issue_pdf_url && (
                    <a
                      href={issue.full_issue_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#1D4ED8] px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-md"
                    >
                      <Download size={14} />
                      Full PDF
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
