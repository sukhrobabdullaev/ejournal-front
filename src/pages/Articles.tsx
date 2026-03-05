import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublishedArticles } from '../lib/queries-api';

export function Articles() {
  const {
    data: articles = [],
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['articles'],
    queryFn: getPublishedArticles,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;

  // Extract unique years and topics from articles
  const years = useMemo(() => {
    const yearSet = new Set<string>();
    articles.forEach((article) => {
      if (article.published_at) {
        yearSet.add(new Date(article.published_at).getFullYear().toString());
      }
    });
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [articles]);

  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    articles.forEach((article) => {
      article.topic_tags?.forEach((tag) => topicSet.add(tag));
    });
    return Array.from(topicSet).sort();
  }, [articles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.abstract.toLowerCase().includes(query) ||
          article.keywords.some((k) => k.toLowerCase().includes(query))
      );
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(
        (article) =>
          article.published_at &&
          new Date(article.published_at).getFullYear().toString() === selectedYear
      );
    }

    // Topic filter
    if (selectedTopic !== 'all') {
      filtered = filtered.filter((article) => article.topic_tags?.includes(selectedTopic));
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return dateA - dateB;
      });
    }

    return filtered;
  }, [articles, searchQuery, selectedYear, selectedTopic, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-600">Failed to load articles. Please try again later.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Error Loading Articles</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero Header */}
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '80px', paddingBottom: '60px' }}>
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: '#FFFFFF' }}>
            Articles
          </h1>
          <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Browse our collection of peer-reviewed research in computing and technology
          </p>
        </div>
      </div>

      <div
        className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '80px', paddingBottom: '80px' }}
      >
        {/* Search and Filters */}
        <div
          className="mb-8 bg-white transition-all hover:shadow-xl"
          style={{
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB',
          }}
        >
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search
                className="absolute top-1/2 left-3 -translate-y-1/2 transform"
                size={18}
                style={{ color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search by title, author, keyword..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
              />
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
              >
                <option value="all">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div
            className="mt-5 flex items-center justify-between pt-5"
            style={{ borderTop: '1px solid #E2E8F0' }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm" style={{ color: '#64748B' }}>
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <p className="text-sm" style={{ color: '#64748B' }}>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Article List */}
        {paginatedArticles.length === 0 ? (
          <div
            className="rounded-xl py-16 text-center"
            style={{
              backgroundColor: '#F8FAFC',
              border: '2px dashed #CBD5E1',
            }}
          >
            <p style={{ color: '#64748B' }}>No published articles found.</p>
            <p className="mt-2 text-sm" style={{ color: '#94A3B8' }}>
              {searchQuery || selectedYear !== 'all' || selectedTopic !== 'all'
                ? 'Try adjusting your filters.'
                : 'Check back soon for new research publications.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white transition-all hover:shadow-xl"
                style={{
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
                }}
              >
                <div className="mb-3">
                  <Link
                    to={`/articles/${article.slug}`}
                    className="text-xl font-semibold hover:underline"
                    style={{ color: '#2563EB' }}
                  >
                    {article.title}
                  </Link>
                </div>

                {article.authors && article.authors.length > 0 && (
                  <p className="mb-3 text-sm" style={{ color: '#475569' }}>
                    {article.authors.join(', ')}
                  </p>
                )}

                <p
                  className="mb-4 line-clamp-2 text-sm"
                  style={{ color: '#64748B', lineHeight: '1.7' }}
                >
                  {article.abstract}
                </p>

                {article.keywords && article.keywords.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {article.keywords.slice(0, 5).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="rounded-full px-3 py-1 text-xs"
                        style={{
                          color: '#475569',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="flex items-center justify-between text-sm"
                  style={{ color: '#64748B' }}
                >
                  <span>
                    Published:{' '}
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                    {article.doi && <> | DOI: {article.doi}</>}
                  </span>
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/articles/${article.slug}`}
                      className="text-[#1d4ed8] hover:underline"
                    >
                      View
                    </Link>
                    {article.pdf_public_url && (
                      <a
                        href={article.pdf_public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1d4ed8] hover:underline"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-1.5 text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
