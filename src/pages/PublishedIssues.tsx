import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Download, FileText, Layers, Search } from 'lucide-react';
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
      if (!text) return true;

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
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-600">Jurnallar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-4">
          <p className="text-sm font-medium text-rose-700">Jurnallarni yuklashda xatolik yuz berdi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8 md:pt-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* ── HEADER & SEARCH SECTION ── */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Academic Archive
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Published Issues
            </h1>
            <p className="text-base text-slate-600">
              Sonlarni tez toping, TOC ko‘ring va to‘liq PDF ni yuklab oling.
            </p>
          </div>

          {/* ── SEARCH & FILTER ── */}
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
            
            {/* 1. Search Input */}
            <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 hover:border-slate-400">
              <Search 
                size={18} 
                className="shrink-0 text-slate-400" 
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sarlavha, volume, issue yoki yil bo‘yicha qidiring"
                className="h-full w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              
              {/* 2. Sort Select */}
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'newest' | 'oldest')}
                className="h-11 min-w-[150px] cursor-pointer rounded-xl border border-slate-300 bg-white pl-4 pr-8 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>

              {/* 3. Count Badge */}
              <div className="flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 border border-slate-200">
                <BookOpen size={16} className="shrink-0 text-slate-500" />
                <span>{filteredIssues.length} ta son</span>
              </div>
            </div>
          </div>
        </section>

        {filteredIssues.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Search size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-base font-medium text-slate-600">Qidiruv bo‘yicha mos sonlar topilmadi.</p>
            <p className="mt-1 text-sm text-slate-500">Boshqa so'zlar bilan qidirib ko'ring.</p>
          </section>
        ) : (
          <>
            {/* ── FEATURED ISSUE ── */}
            {featuredIssue && (
              <section className="mb-6">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
                  <div className="flex flex-col gap-8 md:flex-row md:items-center">
                    
                    {/* Featured Thumbnail */}
<div 
  className="relative flex min-h-[280px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl p-6 text-center shadow-sm md:w-[260px] border"
  style={{ 
    backgroundColor: '#f0f9ff', // O'sha och havorang (Sky-50)
    borderColor: '#e0f2fe'      // Chegara uchun bir oz to'qroq havorang
  }}
> 
  <div className="relative z-10 space-y-4">
    <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: '#0f172a' }}>
      Academic Journal
    </p>
    <h2 className="text-6xl font-black tracking-tight" style={{ color: '#0f172a' }}>
      Vol {featuredIssue.volume}
    </h2>
    <div className="h-1 w-16 mx-auto rounded-full" style={{ backgroundColor: '#0f172a' }}></div>
    <p className="text-2xl font-bold" style={{ color: '#11233c' }}>
      Issue {featuredIssue.issue_number}
    </p>
  </div>
</div>

                    {/* Featured Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="mb-4">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 border border-amber-200">
                          Featured Issue
                        </span>
                      </div>

                      {/* Badgelar qismi */}
                      <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-semibold">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 shadow-sm">
                          <Layers size={14} /> Vol {featuredIssue.volume}
                        </span>
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 shadow-sm">
                          Issue {featuredIssue.issue_number}
                        </span>
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 shadow-sm">
                          <CalendarDays size={14} className="mr-1.5 text-slate-500" />
                          {featuredIssue.publication_year}
                        </span>
                      </div>

                      <h2 className="mb-3 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                        {featuredIssue.title || `Volume ${featuredIssue.volume}, Issue ${featuredIssue.issue_number}`}
                      </h2>

                      <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-600">
                        Eng so‘nggi nashr etilgan akademik to'plam. TOC orqali barcha maqolalarni qulay tarzda ko‘ring yoki to‘liq jurnalni PDF formatida yuklab oling.
                      </p>

                      {/* Tugmalar qismi (Rasmga moslashtirilgan ko'k dizayn va silliq burchaklar) */}
                      <div className="flex flex-wrap items-center gap-4">
                        <Link
                          to={`/published/${featuredIssue.id}`}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 text-base font-medium text-blue-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-slate-200"
                        >
                          <FileText size={20} className="text-blue-600" />
                          View TOC
                        </Link>

                        {featuredIssue.full_issue_pdf_url ? (
                          <a
  href={featuredIssue.full_issue_pdf_url}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-8 text-base font-medium shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-slate-200"
  // Inline style har qanday global ranglarni bekor qiladi
  style={{ 
    backgroundColor: '#ffffff', // Oq fon
    color: '#2563eb'            // To'q ko'k matn
  }}
>
  <Download 
    size={20} 
    style={{ color: '#2563eb' }} // Ikonka ham to'q ko'k
  />
  <span style={{ color: '#2563eb' }}>Full PDF</span>
</a>
                        ) : (
                          <span className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-8 text-base font-medium text-slate-400">
                            PDF unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* ── PAGINATED LIST ── */}
            {paginatedIssues.length > 0 && (
              <section className="mt-8">
                <div className="grid gap-4">
                  {paginatedIssues.map((issue) => (
                    <article
                      key={issue.id}
                      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md md:p-6"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                          
                          {/* List Item Badges */}
                          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700 shadow-sm">
                              <Layers size={12} /> Vol {issue.volume}
                            </span>
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 shadow-sm">
                              Issue {issue.issue_number}
                            </span>
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 shadow-sm">
                              {issue.publication_year}
                            </span>
                          </div>

                          <h3 className="truncate whitespace-normal text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                            {issue.title || `Volume ${issue.volume}, Issue ${issue.issue_number}`}
                          </h3>

                          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                            <CalendarDays size={14} className="text-slate-400" />
                            {issue.publication_date || issue.publication_year}
                          </p>
                        </div>

                        {/* List Item Buttons (Moslashtirildi) */}
                        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-100 pt-4 md:border-t-0 md:pl-6 md:pt-0">
                          <Link
                            to={`/published/${issue.id}`}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300"
                          >
                            <FileText size={16} className="text-blue-600" />
                            TOC
                          </Link>

                          {issue.full_issue_pdf_url ? (
                            <a
                              href={issue.full_issue_pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-100"
                            >
                              <Download size={16} className="text-white" />
                              PDF
                            </a>
                          ) : (
                            <span className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 text-sm font-medium text-slate-400">
                              No PDF
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* ── PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="hidden items-center gap-1.5 sm:flex">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold shadow-sm transition-colors ${
                        page === p
                          ? 'border border-blue-600 bg-blue-600 text-white'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex items-center px-4 text-sm font-semibold text-slate-600 sm:hidden">
                  {page} / {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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