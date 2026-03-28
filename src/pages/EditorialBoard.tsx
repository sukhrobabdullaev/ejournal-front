import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Linkedin, Mail } from 'lucide-react';
import { getEditorialBoard } from '../lib/queries-api';
import type { EditorialBoardMember } from '../lib/api';

const ROLE_LABELS: Record<string, string> = {
  editor_in_chief: 'Editor-in-Chief',
  managing_editor: 'Managing Editor',
  associate_editor: 'Associate Editors',
};

function BoardCard({ member }: { member: EditorialBoardMember }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
        <p className="text-sm text-blue-700">{member.affiliation || 'Affiliation not provided'}</p>
      </div>

      {member.expertise?.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {member.expertise.map((tag) => (
            <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {member.email ? (
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-700"
          >
            <Mail size={14} />
            <span>Email</span>
          </a>
        ) : null}
        {member.linkedin_url ? (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-700"
          >
            <Linkedin size={14} />
            <span>LinkedIn</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function EditorialBoard() {
  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['editorial-board'],
    queryFn: () => getEditorialBoard(),
  });

  const grouped: Record<string, EditorialBoardMember[]> = members.reduce(
    (acc, member) => {
      const roleKey = member.role || 'associate_editor';
      if (!acc[roleKey]) acc[roleKey] = [];
      acc[roleKey].push(member);
      return acc;
    },
    {} as Record<string, EditorialBoardMember[]>
  );

  const roleOrder = ['editor_in_chief', 'managing_editor', 'associate_editor'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Editorial Board</h1>
          <p className="text-lg text-gray-600">
            Meet the experts leading the journal review and publication process.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading editorial board...</div>
        ) : null}

        {isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            Failed to load editorial board members.
          </div>
        ) : null}

        {!isLoading && !isError && members.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
            Editorial board members are not configured yet.
          </div>
        ) : null}

        {!isLoading && !isError && members.length > 0
          ? roleOrder.map((role) => {
              const items = grouped[role] || [];
              if (!items.length) return null;
              return (
                <section key={role} className="mb-10">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    {ROLE_LABELS[role] || role}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((member) => (
                      <BoardCard key={member.id} member={member} />
                    ))}
                  </div>
                </section>
              );
            })
          : null}
      </div>
    </div>
  );
}
