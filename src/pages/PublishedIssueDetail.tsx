import React from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, FileText, Hash, Layers } from 'lucide-react';
import { getPublishedIssueById } from '../lib/queries-api';
import { useJournalPath } from '../contexts/JournalContext';

const pagesLabel = (start?: number | null, end?: number | null) => {
  if (!start || !end) return 'Pages: N/A';
  return `Pages: ${start}-${end}`;
};

export function PublishedIssueDetail() {
  const { issueId } = useParams();
  const toJournal = useJournalPath();
  const { data: issue, isLoading, isError } = useQuery({
    queryKey: ['published-issue-detail', issueId],
    queryFn: () => getPublishedIssueById(issueId || ''),
    enabled: !!issueId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-sm" />
          <p className="text-sm font-semibold text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-[#F8FAFC] px-4 text-center">
        <div className="w-full max-w-sm border border-slate-200 bg-white p-8 shadow-sm" style={{ borderRadius: '24px' }}>
          <p className="text-sm font-bold text-rose-600">Issue not found.</p>
          <Link to={toJournal('/published')} className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F8FAFC] pb-10 pt-6 md:pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* -- ORQAGA QAYTISH -- (Katta gap-4 oraliq berildi) */}
        <Link
          to={toJournal('/published')}
          className="group mb-6 inline-flex items-center gap-4 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
        >
          <div className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white shadow-sm transition-transform group-hover:-translate-x-1" style={{ borderRadius: '50%' }}>
            <ArrowLeft size={16} />
          </div>
          <span>Back to all issues</span>
        </Link>

        {/* -- ASOSIY KONTEYNER -- */}
        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm" style={{ borderRadius: '24px' }}>
          
          {/* == HEADER QISMI == */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-6 md:px-8 md:py-8">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Table of Contents
            </h1>

            {/* Jurnal Vol, No va Sanasi (Ikonkalarga mr-2 (margin) va parentga gap-3 berildi) */}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm" style={{ borderRadius: '999px' }}>
                <Layers size={18} className="text-blue-600" />
                <span>Vol. {issue.volume} No. {issue.issue_number}</span>
              </div>
              <div className="flex items-center gap-3 border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm" style={{ borderRadius: '999px' }}>
                <CalendarDays size={18} className="text-blue-600" />
                <span>{issue.publication_date || issue.publication_year}</span>
              </div>
            </div>
          </div>

          {/* == MAQOLALAR RO'YXATI == */}
          <div className="bg-white">
            {issue.articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText size={48} className="mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-base font-semibold text-slate-500">No articles available yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {issue.articles.map((article, index) => (
                  <article
                    key={article.id}
                    className="group flex flex-col justify-between gap-5 p-6 transition-colors hover:bg-blue-50/20 md:flex-row md:items-center md:px-8 md:py-6"
                  >
                    {/* Chap qism: Maqola ma'lumotlari */}
                    <div className="flex-1 space-y-2.5">
                      <h3 className="break-words text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 [overflow-wrap:anywhere]">
                        {index + 1}. {article.title}
                      </h3>
                      <p className="text-sm font-medium italic text-slate-600">
                        {article.authors?.map((author) => author.full_name).join(', ') || 'Unknown author'}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold">
                        {/* Pages badge */}
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 text-slate-600" style={{ borderRadius: '12px' }}>
                          <FileText size={14} className="text-slate-400"/>
                          <span>{pagesLabel(article.page_start, article.page_end)}</span>
                        </span>
                        
                        {/* DOI badge */}
                        {article.doi && (
                          <a
                            href={`https://doi.org/${article.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                          >
                            <Hash size={14} /> 
                            <span>DOI: {article.doi}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* O'ng qism: View PDF tugmasi (gap-2 orqali vertikal ochiqlik ta'minlandi) */}
                    <div className="flex shrink-0 items-center justify-center pt-2 md:pt-0">
                      {article.pdf_public_url && (
                        <a
                          href={article.pdf_public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-[100px] flex-col items-center justify-center gap-2 border-2 border-blue-100 bg-white px-4 py-3 text-xs font-bold text-blue-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 active:scale-95"
                          style={{ borderRadius: '20px' }}
                        >
                          <FileText size={24} strokeWidth={1.5} />
                          <span>View PDF</span>
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}