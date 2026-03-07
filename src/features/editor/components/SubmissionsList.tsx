import React from 'react';
import { FileText, Clock } from 'lucide-react';
import type { Submission } from '../../../lib/api';

interface SubmissionsListProps {
  submissions: Submission[];
  selectedId?: number;
  onSelect: (id: number) => void;
  emptyMessage?: string;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  selectedId,
  onSelect,
  emptyMessage = 'No submissions in this category',
}) => {
  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {submissions.map((s) => (
        <button
          type="button"
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`w-full cursor-pointer p-4 text-left transition-colors hover:bg-gray-50 ${
            selectedId === s.id ? 'bg-blue-50' : ''
          }`}
        >
          <h3 className="mb-1 line-clamp-2 font-medium text-gray-900">
            {s.title || 'Untitled Submission'}
          </h3>
          <p className="mb-2 text-sm text-gray-600">Author ID: {s.author ?? 'Unknown'}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(s.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
              {s.topic_area?.name || 'No topic'}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
