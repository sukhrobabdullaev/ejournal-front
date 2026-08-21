import React from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { getJournals } from '../lib/queries-api';

export function JournalDirectory() {
  const { data: journals = [], isLoading, isError } = useQuery({
    queryKey: ['journals'],
    queryFn: getJournals,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-600">Loading journals...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-4">
          <p className="text-sm font-medium text-rose-700">Something went wrong while loading journals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8 md:pt-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Journals</h1>
          <p className="mt-2 text-slate-600">Choose a journal to browse its published research.</p>
        </div>

        {journals.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            No journals are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {journals.map((journal) => (
              <Link
                key={journal.slug}
                to={`/j/${journal.slug}`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 overflow-hidden">
                  {journal.logo ? (
                    <img src={journal.logo} alt={journal.name} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-7 w-7 text-blue-600" />
                  )}
                </div>
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                  {journal.name}
                </h2>
                {journal.tagline && <p className="mt-1 text-sm text-slate-600">{journal.tagline}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
