import React from 'react';
import { useParams, useSearchParams } from 'react-router';
import { SubmitPaperForm } from '../features/submission/SubmitPaperForm';

export function SubmitPaper() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const idFromQuery = searchParams.get('id');

  return (
    <SubmitPaperForm
      submissionIdFromRoute={submissionId}
      submissionIdFromQuery={idFromQuery}
    />
  );
}