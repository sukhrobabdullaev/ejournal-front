import React from 'react';
import { Link, Navigate, Outlet, useParams } from 'react-router';
import { useJournal } from '../contexts/JournalContext';

// The JournalProvider itself lives at the App shell level (so Header/Footer,
// which render outside <Routes>, also get journal context) — this layout just
// guards against a route match with no slug captured, and against an unknown slug.
export function JournalLayout() {
  const { journalSlug } = useParams<{ journalSlug: string }>();
  const { journal, isLoading } = useJournal();

  if (!journalSlug) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-600">Loading journal...</p>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10">
          <h1 className="mb-2 text-xl font-bold text-slate-900">Journal not found</h1>
          <p className="mb-6 text-sm text-slate-600">
            "{journalSlug}" doesn't match a journal on this platform.
          </p>
          <Link to="/" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Browse journals
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
