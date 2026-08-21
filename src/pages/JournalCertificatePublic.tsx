import React from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Download, Share2, QrCode, ExternalLink } from 'lucide-react';

import { getPublicJournalCertificateByCode } from '../lib/queries-api';
import { useJournalPath } from '../contexts/JournalContext';

export function JournalCertificatePublic() {
  const { code } = useParams<{ code: string }>();
  const toJournal = useJournalPath();

  const { data: certificate, isLoading } = useQuery({
    queryKey: ['journal-certificate-public', code],
    queryFn: () => (code ? getPublicJournalCertificateByCode(code) : Promise.resolve(null)),
    enabled: !!code,
    retry: false,
  });

  const handleShare = async () => {
    if (!certificate) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Journal Publication Certificate',
          text: `${certificate.author_name} - ${certificate.submission_title}`,
          url: certificate.certificate_page_url,
        });
        return;
      }
      await navigator.clipboard.writeText(certificate.certificate_page_url);
      alert('Certificate link copied to clipboard.');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-slate-600">Loading certificate...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-2xl rounded-md border border-[#D8E4F6] bg-white p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#0B1C4D]">Certificate not found</h1>
          <p className="mb-6 text-sm text-slate-600">
            This journal certificate link is invalid or has expired.
          </p>
          <Link
            to={toJournal('')}
            className="rounded-md bg-[#0F4FA8] px-4 py-2 text-sm font-semibold text-white"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9FF] to-[#EEF4FD] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center rounded-md border border-[#C9DCF6] bg-white px-3 py-2 text-xs font-semibold text-[#0B1C4D] shadow-sm transition-colors hover:bg-[#F3F8FF]"
          >
            <Share2 size={14} className="mr-1" />
            Share
          </button>
          <a
            href={certificate.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-[#C9DCF6] bg-white px-3 py-2 text-xs font-semibold text-[#0B1C4D] shadow-sm transition-colors hover:bg-[#F3F8FF]"
          >
            <Download size={14} className="mr-1" />
            Download PDF
          </a>
        </div>

        <div className="rounded-md border border-[#D1D5DB] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-10">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-[#374151]">
              DITECH ASIA
            </p>
            <h1 className="text-3xl font-bold text-[#0B1C4D] md:text-4xl">
              CERTIFICATE OF JOURNAL PUBLICATION
            </h1>
          </div>

          <div className="mb-10 text-center">
            <p className="text-lg font-semibold text-slate-900">This certificate is awarded to</p>
            <p className="mt-2 text-4xl font-bold text-[#0B1C4D]">{certificate.author_name}</p>
            <p className="mt-5 text-lg text-slate-700">for contribution to issue:</p>
            <p className="mx-auto mt-2 max-w-3xl text-2xl font-semibold text-slate-900">
              {certificate.issue_title}
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-lg text-slate-800">
              Article: {certificate.submission_title}
            </p>
            <p className="mt-3 text-base text-slate-600">
              Issued on{' '}
              {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="grid gap-6 border-t border-[#D8E4F6] pt-6 md:grid-cols-2">
            <div className="rounded-md border border-[#D8E4F6] bg-[#F8FBFF] p-4">
              <p className="mb-2 text-sm font-semibold text-[#0B1C4D]">Certificate QR Code</p>
              <img
                src={certificate.qr_svg_url}
                alt="Certificate QR"
                className="h-36 w-36 rounded border border-[#C9DCF6] bg-white p-2"
              />
              <p className="mt-2 text-xs text-slate-600">
                QR kodni skaner qilsangiz ushbu jurnal sertifikat sahifasi ochiladi.
              </p>
            </div>

            <div className="rounded-md border border-[#D8E4F6] bg-[#F8FBFF] p-4">
              <p className="mb-2 text-sm font-semibold text-[#0B1C4D]">Verification</p>
              <a
                href={certificate.public_api_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm font-medium text-[#0F4FA8] hover:text-[#0B1C4D]"
              >
                Open API Verification
                <ExternalLink size={14} className="ml-1" />
              </a>
              <p className="mt-3 break-all text-xs text-slate-600">
                Verification Code: {certificate.verification_code}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

