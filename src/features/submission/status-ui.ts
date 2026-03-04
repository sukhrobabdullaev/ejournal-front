import type { SubmissionStatus } from '../../lib/api';

export const getStatusLabel = (status: SubmissionStatus): string =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const getStatusChipClasses = (status: SubmissionStatus): string => {
  switch (status) {
    case 'draft':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300';
    case 'submitted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-300';
    case 'screening':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-300';
    case 'under_review':
    case 'decision_pending':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-300';
    case 'revision_required':
    case 'resubmitted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-300';
    case 'accepted':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-300';
    case 'rejected':
    case 'desk_rejected':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-300';
    case 'published':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-300';
    case 'withdrawn':
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300';
    default:
      return 'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300';
  }
};

