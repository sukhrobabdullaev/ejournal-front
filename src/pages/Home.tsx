import React from 'react';
import { Link } from 'react-router';
import { BookOpen, Users, FileText, Award, CheckCircle, Eye, UserCheck } from 'lucide-react';
import journalCover from 'figma:asset/1213522a5242c1f43db11177313419914eea13eb.png';

export function Home() {
  return (
    <div style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero Section - Two Column Layout */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Column - Content */}
            <div className="space-y-6">
              <h1 className="text-5xl leading-tight font-bold" style={{ color: '#0B1C4D' }}>
                Digital Innovation and Emerging Technologies
              </h1>
              <p className="text-xl" style={{ color: '#475569' }}>
                An International Peer-Reviewed Journal by Ditech Asia
              </p>
              <p className="text-base leading-relaxed" style={{ color: '#475569' }}>
                A premier platform for publishing cutting-edge research in digital innovation,
                artificial intelligence, blockchain, cloud computing, cybersecurity, and emerging
                technologies shaping the future of Asia and beyond.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                >
                  <CheckCircle size={16} />
                  Open Access
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                >
                  <Eye size={16} />
                  Double-Blind Peer Review
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                >
                  <Award size={16} />
                  ISSN Pending
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/submit"
                  className="inline-flex items-center text-base font-semibold shadow-md transition-all"
                  style={{
                    padding: '12px 18px',
                    backgroundColor: '#0B1C4D',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#08163D')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B1C4D')}
                  onMouseDown={(e) => (e.currentTarget.style.backgroundColor = '#061131')}
                  onMouseUp={(e) => (e.currentTarget.style.backgroundColor = '#08163D')}
                >
                  <FileText size={20} className="mr-2" style={{ color: '#FFFFFF' }} />
                  Submit Manuscript
                </Link>
                <Link
                  to="/articles"
                  className="inline-flex items-center text-base font-semibold transition-all"
                  style={{
                    padding: '12px 18px',
                    color: '#0B1C4D',
                    border: '1px solid #0B1C4D',
                    backgroundColor: 'transparent',
                    borderRadius: '12px',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(11, 28, 77, 0.06)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <BookOpen size={20} className="mr-2" style={{ color: '#0B1C4D' }} />
                  Browse Articles
                </Link>
              </div>
            </div>

            {/* Right Column - Journal Cover */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="relative overflow-hidden rounded-xl"
                style={{
                  maxWidth: '420px',
                  boxShadow:
                    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
              >
                <img
                  src={journalCover}
                  alt="Digital Innovation and Emerging Technologies - Ditech Asia Journal Cover"
                  className="h-auto w-full"
                  style={{
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold" style={{ color: '#0B1C4D' }}>
              Latest Announcements
            </h2>
            <p className="text-lg" style={{ color: '#475569' }}>
              Stay updated with important news and announcements
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Announcement Card 1 */}
            <div
              className="rounded-xl bg-white p-6 transition-all hover:shadow-lg"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                borderLeft: '4px solid #2563EB',
              }}
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: '#EFF6FF' }}>
                  <BookOpen size={20} style={{ color: '#2563EB' }} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold" style={{ color: '#0B1C4D' }}>
                    Call for Papers
                  </h3>
                  <p className="mb-3 text-sm" style={{ color: '#475569' }}>
                    We are now accepting submissions for our inaugural issue. Submit your research
                    on digital innovation, AI, blockchain, and emerging technologies.
                  </p>
                  <span className="text-xs font-medium" style={{ color: '#2563EB' }}>
                    Published: March 1, 2025
                  </span>
                </div>
              </div>
            </div>

            {/* Announcement Card 2 */}
            <div
              className="rounded-xl bg-white p-6 transition-all hover:shadow-lg"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                borderLeft: '4px solid #2563EB',
              }}
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: '#EFF6FF' }}>
                  <Users size={20} style={{ color: '#2563EB' }} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold" style={{ color: '#0B1C4D' }}>
                    Join Our Editorial Board
                  </h3>
                  <p className="mb-3 text-sm" style={{ color: '#475569' }}>
                    We are inviting distinguished researchers and professionals to join our
                    editorial board and help shape the future of digital innovation research.
                  </p>
                  <span className="text-xs font-medium" style={{ color: '#2563EB' }}>
                    Published: February 15, 2025
                  </span>
                </div>
              </div>
            </div>

            {/* Announcement Card 3 */}
            <div
              className="rounded-xl bg-white p-6 transition-all hover:shadow-lg"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                borderLeft: '4px solid #2563EB',
              }}
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: '#EFF6FF' }}>
                  <UserCheck size={20} style={{ color: '#2563EB' }} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold" style={{ color: '#0B1C4D' }}>
                    Reviewers Wanted
                  </h3>
                  <p className="mb-3 text-sm" style={{ color: '#475569' }}>
                    We are seeking expert reviewers in various fields of technology and innovation.
                    Join us in maintaining the highest standards of academic publishing.
                  </p>
                  <span className="text-xs font-medium" style={{ color: '#2563EB' }}>
                    Published: February 1, 2025
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold" style={{ color: '#0B1C4D' }}>
              Why Publish With Us
            </h2>
            <p className="mx-auto max-w-3xl text-lg" style={{ color: '#475569' }}>
              Join a growing community of researchers and practitioners advancing the frontiers of
              digital innovation and emerging technologies
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EFF6FF' }}
              >
                <CheckCircle size={32} style={{ color: '#2563EB' }} />
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: '#0B1C4D' }}>
                Open Access
              </h3>
              <p className="text-sm" style={{ color: '#475569' }}>
                All articles are freely accessible to readers worldwide, maximizing the impact of
                your research
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EFF6FF' }}
              >
                <Eye size={32} style={{ color: '#2563EB' }} />
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: '#0B1C4D' }}>
                Rigorous Peer Review
              </h3>
              <p className="text-sm" style={{ color: '#475569' }}>
                Double-blind peer review process ensures quality and fairness in every published
                article
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EFF6FF' }}
              >
                <Users size={32} style={{ color: '#2563EB' }} />
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: '#0B1C4D' }}>
                Expert Editorial Board
              </h3>
              <p className="text-sm" style={{ color: '#475569' }}>
                Guidance from leading experts in digital innovation and emerging technologies
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EFF6FF' }}
              >
                <Award size={32} style={{ color: '#2563EB' }} />
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: '#0B1C4D' }}>
                Fast Publication
              </h3>
              <p className="text-sm" style={{ color: '#475569' }}>
                Efficient review and publication process to get your research published quickly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20"
        style={{
          backgroundColor: '#0B1C4D',
          color: '#FFFFFF',
        }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold">Ready to Share Your Research?</h2>
          <p className="text-opacity-90 mb-8 text-xl text-white">
            Submit your manuscript today and contribute to the advancement of digital innovation and
            emerging technologies
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/submit"
              className="inline-flex items-center text-lg font-semibold shadow-lg transition-all"
              style={{
                padding: '12px 24px',
                backgroundColor: '#FFFFFF',
                color: '#0B1C4D',
                borderRadius: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <FileText size={24} className="mr-2" style={{ color: '#0B1C4D' }} />
              Submit Your Manuscript
            </Link>
            <Link
              to="/guidelines"
              className="inline-flex items-center text-lg font-semibold transition-all"
              style={{
                padding: '12px 24px',
                border: '2px solid #FFFFFF',
                color: '#FFFFFF',
                backgroundColor: 'transparent',
                borderRadius: '12px',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              View Author Guidelines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
