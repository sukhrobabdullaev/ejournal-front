import type { Submission } from '../../lib/api';

export const getStatusLabel = (status: Submission['status']): string =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const getStatusChipClasses = (status: Submission['status']): string => {
  const baseClass =
    'inline-flex items-center whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium leading-none w-auto h-auto';

  switch (status) {
    case 'submitted':
      return `${baseClass} bg-blue-50 text-blue-700 border border-blue-300`;
    case 'screening':
      return `${baseClass} bg-indigo-50 text-indigo-700 border border-indigo-300`;
    case 'under_review':
    case 'decision_pending':
      return `${baseClass} bg-yellow-50 text-yellow-700 border border-yellow-300`;
    case 'revision_required':
    case 'resubmitted':
      return `${baseClass} bg-orange-50 text-orange-700 border border-orange-300`;
    case 'accepted':
      return `${baseClass} bg-green-50 text-green-700 border border-green-300`;
    case 'rejected':
    case 'desk_rejected':
      return `${baseClass} bg-red-50 text-red-700 border border-red-300`;
    case 'published':
      return `${baseClass} bg-purple-50 text-purple-700 border border-purple-300`;
    default:
      return `${baseClass} bg-gray-100 text-gray-700 border border-gray-300`;
  }
};

export interface ApiError extends Error {
  detail?: string;
}
