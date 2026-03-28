import React from 'react';

interface ReviewDetailsModalProps {
  assignment: any;
  isOpen?: boolean;
  onClose: () => void;
}

const recommendationStyleMap: Record<string, React.CSSProperties> = {
  accept: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    borderColor: '#86EFAC',
  },
  reject: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderColor: '#FCA5A5',
  },
};

const defaultRecommendationStyle: React.CSSProperties = {
  backgroundColor: '#FEF3C7',
  color: '#92400E',
  borderColor: '#FCD34D',
};

export const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({ assignment, isOpen, onClose }) => {
  const open = typeof isOpen === 'boolean' ? isOpen : Boolean(assignment);

  if (!open || !assignment) {
    return null;
  }

  const { review, status, due_date: dueDate, reviewer_email: reviewerEmail } = assignment;
  const recommendation = review?.recommendation || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="saas-fade-menu flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border bg-white shadow-[0_24px_52px_rgba(15,23,42,0.24)]"
        style={{ borderColor: '#D8E4F6', transition: 'all 0.3s ease-in-out' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-lg font-semibold text-[#0B1C4D]">Review Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
            style={{ borderColor: '#C9DCF6', transition: 'all 0.3s ease-in-out' }}
          >
            <span className="text-lg leading-none text-slate-600">x</span>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-3 rounded-xl border bg-[#F8FBFF] p-4 text-sm sm:grid-cols-3" style={{ borderColor: '#D8E4F6' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviewer</p>
              <p className="mt-1 break-all text-sm font-semibold text-[#0B1C4D]">{reviewerEmail}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-1 text-sm font-semibold capitalize text-[#0B1C4D]">{String(status).replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</p>
              <p className="mt-1 text-sm font-semibold text-[#0B1C4D]">{dueDate || 'N/A'}</p>
            </div>
          </div>

          {!review ? (
            <div className="rounded-xl border border-dashed border-[#C9DCF6] bg-[#F8FBFF] px-4 py-8 text-center text-sm text-slate-600">
              {status === 'invited' && 'Reviewer has been invited but has not responded yet.'}
              {status === 'accepted' && 'Review is currently in progress.'}
              {status === 'declined' && 'Reviewer declined the invitation.'}
              {status === 'expired' && 'Review assignment has expired.'}
              {!['invited', 'accepted', 'declined', 'expired'].includes(status) &&
                'No review submitted yet.'}
            </div>
          ) : (
            <>
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recommendation</h3>
                <span
                  className="mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase"
                  style={{
                    ...(recommendationStyleMap[recommendation] || defaultRecommendationStyle),
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {recommendation.replace('_', ' ')}
                </span>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h3>
                <p className="whitespace-pre-wrap rounded-xl border bg-white p-3 text-sm text-slate-700" style={{ borderColor: '#E2E8F0' }}>
                  {review.summary || 'N/A'}
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Strengths</h3>
                <p className="whitespace-pre-wrap rounded-xl border bg-white p-3 text-sm text-slate-700" style={{ borderColor: '#E2E8F0' }}>
                  {review.strengths || 'N/A'}
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Weaknesses</h3>
                <p className="whitespace-pre-wrap rounded-xl border bg-white p-3 text-sm text-slate-700" style={{ borderColor: '#E2E8F0' }}>
                  {review.weaknesses || 'N/A'}
                </p>
              </section>

              {review.confidential_to_editor && (
                <section className="rounded-xl border bg-amber-50 p-3" style={{ borderColor: '#FCD34D' }}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
                    Confidential To Editor
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-amber-900">{review.confidential_to_editor}</p>
                </section>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end border-t px-6 py-4" style={{ borderColor: '#E2E8F0' }}>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
            style={{ borderColor: '#C9DCF6', color: '#0B1C4D', transition: 'all 0.3s ease-in-out' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
