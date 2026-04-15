import type { Submission } from '../../lib/api';

export const getStatusLabel = (status: Submission['status']): string =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const getStatusChipClasses = (status: Submission['status']): string => {
  const baseClass =
    'inline-flex items-center whitespace-nowrap rounded-lg border px-3 !py-0 text-sm font-medium !leading-none w-auto h-auto';

  switch (status) {
    case 'submitted':
      return `${baseClass} bg-blue-50 text-blue-600 border-blue-200`;
    case 'screening':
      return `${baseClass} bg-indigo-50 text-indigo-600 border-indigo-200`;
    case 'under_review':
    case 'decision_pending':
      return `${baseClass} bg-amber-50 text-amber-600 border-amber-200`;
    case 'revision_required':
    case 'resubmitted':
      return `${baseClass} bg-orange-50 text-orange-600 border-orange-200`;
    case 'accepted':
      return `${baseClass} bg-emerald-50 text-emerald-600 border-emerald-200`;
    case 'rejected':
    case 'desk_rejected':
      return `${baseClass} bg-rose-50 text-rose-600 border-rose-200`;
    case 'published':
      return `${baseClass} bg-violet-50 text-violet-600 border-violet-200`;
    default:
      return `${baseClass} bg-slate-100 text-slate-600 border-slate-200`;
  }
};

export interface ApiError extends Error {
  detail?: string;
}
