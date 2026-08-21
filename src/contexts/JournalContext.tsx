import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Journal } from '../lib/api';
import { getJournalBySlug } from '../lib/queries-api';

interface JournalContextType {
  journal: Journal | null;
  isLoading: boolean;
  journalSlug: string | null;
}

const JournalContext = createContext<JournalContextType>({
  journal: null,
  isLoading: false,
  journalSlug: null,
});

export function JournalProvider({
  slug,
  children,
}: {
  slug: string | null;
  children?: React.ReactNode;
}) {
  const { data: journal, isLoading } = useQuery({
    queryKey: ['journal', slug],
    queryFn: () => (slug ? getJournalBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (journal?.accent_color) {
      document.documentElement.style.setProperty('--color-accent-blue', journal.accent_color);
    }
  }, [journal?.accent_color]);

  return (
    <JournalContext.Provider
      value={{ journal: journal ?? null, isLoading: !!slug && isLoading, journalSlug: slug }}
    >
      {children}
    </JournalContext.Provider>
  );
}

// Never throws outside a provider (unlike useAuth) — Header/Footer render at "/"
// (the journal directory) too, where there is no active journal.
export function useJournal() {
  return useContext(JournalContext);
}

// Convenience hook for building links/navigate() targets that stay within the
// current journal, e.g. toJournal('/submit') -> '/j/mit-journal/submit'.
// Memoized so its identity is stable across renders (safe as a useEffect/useCallback
// dependency) and only changes when journalSlug itself changes.
export function useJournalPath() {
  const { journalSlug } = useJournal();
  return useCallback((path: string) => (journalSlug ? `/j/${journalSlug}${path}` : '/'), [journalSlug]);
}
