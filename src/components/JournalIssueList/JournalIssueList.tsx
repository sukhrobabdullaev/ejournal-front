import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen } from 'lucide-react';

interface JournalIssue {
  id: number;
  title: string;
  date: string;
  volume?: string;
  articleCount?: number;
}

const mockIssues: JournalIssue[] = [
  { id: 1, title: 'Journal Issue 1', date: '2026-03-01', volume: 'Vol. 1, No. 1', articleCount: 5 },
  { id: 2, title: 'Journal Issue 2', date: '2026-03-08', volume: 'Vol. 1, No. 2', articleCount: 4 },
  { id: 3, title: 'Journal Issue 3', date: '2026-03-15', volume: 'Vol. 1, No. 3', articleCount: 6 },
  { id: 4, title: 'Journal Issue 4', date: '2026-03-22', volume: 'Vol. 1, No. 4', articleCount: 3 },
  { id: 5, title: 'Journal Issue 5', date: '2026-02-01', volume: 'Vol. 1, No. 5', articleCount: 7 },
  { id: 6, title: 'Journal Issue 6', date: '2026-02-15', volume: 'Vol. 1, No. 6', articleCount: 5 },
];

type ViewMode = 'weekly' | 'monthly';

export function JournalIssueList() {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [journalIssues, setJournalIssues] = useState<JournalIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Simulate an API call — replace with real fetch when backend is ready:
    // fetch(`/api/journal-issues?viewMode=${viewMode}`)
    //   .then((res) => res.json())
    //   .then((data) => setJournalIssues(data))
    //   .catch(() => setError('Failed to load journal issues. Please try again.'))
    //   .finally(() => setIsLoading(false));
    const timer = setTimeout(() => {
      setJournalIssues(mockIssues);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [viewMode]);

  const now = new Date();

  const filteredIssues =
    viewMode === 'weekly'
      ? journalIssues.filter((issue) => {
          const issueDate = new Date(issue.date);
          // Determine start (Sunday) and end (Saturday) of the current calendar week
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          return issueDate >= startOfWeek && issueDate <= endOfWeek;
        })
      : journalIssues.filter((issue) => {
          const issueDate = new Date(issue.date);
          return (
            issueDate.getFullYear() === now.getFullYear() &&
            issueDate.getMonth() === now.getMonth()
          );
        });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="mb-2 text-3xl font-bold" style={{ color: '#0B1C4D' }}>
        Journal Issues
      </h2>
      <p className="mb-6 text-sm" style={{ color: '#64748B' }}>
        Browse journal issues by week or month. Backend integration coming soon.
      </p>

      {/* View mode toggle */}
      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setViewMode('weekly')}
          className="rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: viewMode === 'weekly' ? '#0B1C4D' : '#F1F5F9',
            color: viewMode === 'weekly' ? '#FFFFFF' : '#475569',
            cursor: viewMode === 'weekly' ? 'not-allowed' : 'pointer',
          }}
          disabled={viewMode === 'weekly'}
        >
          Weekly
        </button>
        <button
          onClick={() => setViewMode('monthly')}
          className="rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: viewMode === 'monthly' ? '#0B1C4D' : '#F1F5F9',
            color: viewMode === 'monthly' ? '#FFFFFF' : '#475569',
            cursor: viewMode === 'monthly' ? 'not-allowed' : 'pointer',
          }}
          disabled={viewMode === 'monthly'}
        >
          Monthly
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-sm" style={{ color: '#64748B' }}>
            Loading journal issues…
          </span>
        </div>
      ) : error ? (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
        >
          {error}
        </div>
      ) : filteredIssues.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ backgroundColor: '#F8FAFC', border: '2px dashed #CBD5E1' }}
        >
          <BookOpen className="mx-auto mb-3 h-12 w-12" style={{ color: '#CBD5E1' }} />
          <p className="text-sm" style={{ color: '#64748B' }}>
            No journal issues found for this {viewMode === 'weekly' ? 'week' : 'month'}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border p-5 transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E2E8F0' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="mb-1 text-lg font-semibold" style={{ color: '#0B1C4D' }}>
                    {issue.title}
                  </h3>
                  {issue.volume && (
                    <p className="mb-2 text-sm" style={{ color: '#2563EB' }}>
                      {issue.volume}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm" style={{ color: '#64748B' }}>
                    <Calendar size={14} />
                    <span>
                      {new Date(issue.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                {issue.articleCount !== undefined && (
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                  >
                    {issue.articleCount} article{issue.articleCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
