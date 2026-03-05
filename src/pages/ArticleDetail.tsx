import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Download, Copy, CheckCircle, Calendar, FileText, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getArticleBySlug } from '../lib/queries-api';

export function ArticleDetail() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const [citationCopied, setCitationCopied] = useState(false);

  const {
    data: article,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['article', articleSlug],
    queryFn: () => getArticleBySlug(articleSlug!),
    enabled: !!articleSlug,
  });

  const authors = article?.authors || [];

  const handleCopyCitation = () => {
    if (!article) return;

    const authorNames = authors.map((a) => a.full_name).join(', ');
    const year = article.published_at ? new Date(article.published_at).getFullYear() : 'n.d.';
    const citation = `${authorNames} (${year}). ${article.title}. Digital Innovation and Emerging Technologies - Ditech Asia Journal. ${article.doi || 'DOI: TBD'}`;

    // Try to copy to clipboard, handle error gracefully
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(citation)
        .then(() => {
          setCitationCopied(true);
          setTimeout(() => setCitationCopied(false), 2000);
        })
        .catch((err) => {
          console.log('Clipboard not available:', err);
          // Fallback: just show the citation copied state anyway
          setCitationCopied(true);
          setTimeout(() => setCitationCopied(false), 2000);
        });
    } else {
      // Clipboard API not available, just show feedback
      setCitationCopied(true);
      setTimeout(() => setCitationCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div
        style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}
        className="flex items-center justify-center"
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: '#64748B' }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (isError || (!loading && !article)) {
    return (
      <div
        style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}
        className="flex items-center justify-center px-4"
      >
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold" style={{ color: '#0B1C4D' }}>
            Article Not Available
          </h2>
          <p className="mb-6" style={{ color: '#64748B' }}>
            The article you are looking for does not exist or is not published yet.
          </p>
          <Link
            to="/articles"
            className="inline-block rounded-lg px-6 py-3 font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)',
            }}
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div className="bg-white" style={{ borderBottom: '1px solid #E2E8F0' }}>
        <div className="mx-auto max-w-[1120px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="hover:underline" style={{ color: '#2563EB' }}>
              Home
            </Link>
            <ChevronRight size={14} style={{ color: '#94A3B8' }} />
            <Link to="/articles" className="hover:underline" style={{ color: '#2563EB' }}>
              Articles
            </Link>
            <ChevronRight size={14} style={{ color: '#94A3B8' }} />
            <span className="line-clamp-1" style={{ color: '#475569' }}>
              {article.title}
            </span>
          </div>
        </div>
      </div>

      <div
        className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '48px', paddingBottom: '80px' }}
      >
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article
              className="bg-white transition-all"
              style={{
                borderRadius: '16px',
                padding: '48px',
                boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
                borderLeft: '4px solid #2563EB',
              }}
            >
              {/* Title */}
              <h1 className="mb-8 text-4xl leading-tight font-bold" style={{ color: '#0B1C4D' }}>
                {article.title}
              </h1>

              {/* Authors */}
              <div className="mb-8 pb-8" style={{ borderBottom: '2px solid #E2E8F0' }}>
                {authors.map((author, index) => (
                  <p
                    key={index}
                    className="mb-2 text-base"
                    style={{ color: '#0B1C4D', lineHeight: '1.7' }}
                  >
                    <span className="font-medium">{author.full_name}</span>
                    {author.is_corresponding && (
                      <sup style={{ color: '#2563EB' }} className="ml-1 font-semibold">
                        *
                      </sup>
                    )}
                    {author.affiliation && (
                      <span className="ml-3 text-sm" style={{ color: '#64748B' }}>
                        {author.affiliation}
                      </span>
                    )}
                  </p>
                ))}
                {authors.some((a) => a.is_corresponding) && (
                  <p className="mt-4 text-xs" style={{ color: '#94A3B8' }}>
                    * Corresponding author
                  </p>
                )}
              </div>

              {/* Metadata Row */}
              <div className="mb-8 pb-8" style={{ borderBottom: '2px solid #E2E8F0' }}>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  {article.received_at && (
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" style={{ color: '#94A3B8' }} />
                      <span className="font-semibold" style={{ color: '#475569' }}>
                        Received:
                      </span>
                      <span className="ml-2" style={{ color: '#0B1C4D' }}>
                        {new Date(article.received_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {article.accepted_at && (
                    <div className="flex items-center">
                      <CheckCircle size={16} className="mr-2" style={{ color: '#10B981' }} />
                      <span className="font-semibold" style={{ color: '#475569' }}>
                        Accepted:
                      </span>
                      <span className="ml-2" style={{ color: '#0B1C4D' }}>
                        {new Date(article.accepted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {article.published_at && (
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2" style={{ color: '#2563EB' }} />
                      <span className="font-semibold" style={{ color: '#475569' }}>
                        Published:
                      </span>
                      <span className="ml-2" style={{ color: '#0B1C4D' }}>
                        {new Date(article.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="font-semibold" style={{ color: '#475569' }}>
                      DOI:
                    </span>
                    <span className="ml-2" style={{ color: '#2563EB' }}>
                      {article.doi || 'TBD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Abstract */}
              <section className="mb-8 pb-8" style={{ borderBottom: '2px solid #E2E8F0' }}>
                <h2 className="mb-5 text-2xl font-bold" style={{ color: '#0B1C4D' }}>
                  Abstract
                </h2>
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '2px solid #E2E8F0',
                  }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: '#475569', lineHeight: '1.8' }}
                  >
                    {article.abstract}
                  </p>
                </div>
              </section>

              {/* Keywords */}
              <section className="mb-8 pb-8" style={{ borderBottom: '2px solid #E2E8F0' }}>
                <h2 className="mb-5 text-2xl font-bold" style={{ color: '#0B1C4D' }}>
                  Keywords
                </h2>
                <div className="flex flex-wrap gap-3">
                  {article.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="rounded-full px-4 py-2 text-sm font-medium"
                      style={{
                        backgroundColor: '#EFF6FF',
                        color: '#1E3A8A',
                        border: '2px solid #93C5FD',
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>

              {/* Citation Box */}
              <section className="mb-8">
                <h2 className="mb-5 text-2xl font-bold" style={{ color: '#0B1C4D' }}>
                  How to Cite
                </h2>
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '2px solid #E2E8F0',
                  }}
                >
                  <p className="mb-3 text-xs font-semibold" style={{ color: '#64748B' }}>
                    APA Citation:
                  </p>
                  <p
                    className="mb-4 text-sm leading-relaxed"
                    style={{ color: '#0B1C4D', lineHeight: '1.8' }}
                  >
                    {authors.map((a) => a.full_name).join(', ')} (
                    {article.published_at ? new Date(article.published_at).getFullYear() : 'n.d.'}).{' '}
                    {article.title}.{' '}
                    <em>Digital Innovation and Emerging Technologies - Ditech Asia Journal</em>.{' '}
                    {article.doi || 'DOI: TBD'}
                  </p>
                  <button
                    onClick={handleCopyCitation}
                    className="flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      backgroundColor: citationCopied ? '#DCFCE7' : '#EFF6FF',
                      color: citationCopied ? '#14532D' : '#1E3A8A',
                      border: `2px solid ${citationCopied ? '#86EFAC' : '#93C5FD'}`,
                    }}
                  >
                    {citationCopied ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Citation Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copy Citation
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* PDF Download Link */}
              <div className="pt-8" style={{ borderTop: '2px solid #E2E8F0' }}>
                {article.pdf_public_url ? (
                  <a
                    href={article.pdf_public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg px-6 py-3 font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)',
                    }}
                  >
                    <Download size={18} className="mr-2" />
                    Download PDF
                  </a>
                ) : (
                  <span className="flex items-center" style={{ color: '#94A3B8' }}>
                    <Download size={18} className="mr-2" />
                    PDF Not Available
                  </span>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-20 bg-white transition-all"
              style={{
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
                borderLeft: '4px solid #2563EB',
              }}
            >
              <h3 className="mb-6 text-lg font-bold" style={{ color: '#0B1C4D' }}>
                Article Information
              </h3>

              <div className="space-y-6 text-sm">
                {article.topic_tags && article.topic_tags.length > 0 && (
                  <div className="pb-6" style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <p className="mb-3 text-xs font-semibold" style={{ color: '#64748B' }}>
                      Topic Area
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {article.topic_tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pb-6" style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <p className="mb-2 text-xs font-semibold" style={{ color: '#64748B' }}>
                    License
                  </p>
                  <p className="text-sm font-medium" style={{ color: '#0B1C4D' }}>
                    CC BY 4.0
                  </p>
                  <p className="mt-2 text-xs" style={{ color: '#94A3B8' }}>
                    Open Access • Free to read and share
                  </p>
                </div>

                <div className="pb-6" style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <p className="mb-2 text-xs font-semibold" style={{ color: '#64748B' }}>
                    Article Type
                  </p>
                  <p className="text-sm font-medium" style={{ color: '#0B1C4D' }}>
                    Research Article
                  </p>
                </div>

                {article.doi && (
                  <div>
                    <p className="mb-2 text-xs font-semibold" style={{ color: '#64748B' }}>
                      DOI
                    </p>
                    <p className="text-xs break-all" style={{ color: '#2563EB' }}>
                      {article.doi}
                    </p>
                  </div>
                )}
              </div>

              {article.pdf_public_url && (
                <div className="mt-8 pt-8" style={{ borderTop: '1px solid #E2E8F0' }}>
                  <a
                    href={article.pdf_public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)',
                    }}
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
