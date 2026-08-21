import React from 'react';
import { Download, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useJournal, useJournalPath } from '../contexts/JournalContext';

export function AuthorGuidelines() {
  const { journal } = useJournal();
  const toJournal = useJournalPath();
  const journalName = journal?.name ? `${journal.name} Journal` : 'This journal';
  return (
    <div style={{ backgroundColor: '#FFFFFF', fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif' }}>
      {/* Hero Section - Refined & Spacious */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #F0F4F9 0%, #E8EEF5 100%)',
          paddingTop: '120px',
          paddingBottom: '100px',
          borderBottom: '1px solid rgba(30, 58, 138, 0.08)',
        }}
      >
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <h1 
            className="mb-6 text-6xl font-bold leading-tight"
            style={{ color: '#0F2557', letterSpacing: '-0.5px' }}
          >
            Author Guidelines
          </h1>
          <p 
            className="text-xl max-w-2xl"
            style={{ color: '#475569', lineHeight: '1.8', fontWeight: '400' }}
          >
            Comprehensive instructions for preparing and submitting manuscripts to <span style={{ color: '#1E3A8A', fontWeight: '600' }}>{journalName}</span>
          </p>
        </div>
      </div>

      {/* Main Content Area - Generously Spaced */}
      <div
        className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '100px', paddingBottom: '100px' }}
      >
        {/* Quick Actions - Card Style with Premium Spacing */}
        <div className="mb-20 grid gap-6 md:grid-cols-2">
          {/* Submit Card */}
          <Link
            to={toJournal('/submit')}
            className="group"
            style={{
              display: 'block',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                padding: '48px',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(30, 58, 138, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.12)';
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-3 text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                    Submit Your Manuscript
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '15px', lineHeight: '1.6' }}>
                    Ready to share your research? Start here
                  </p>
                </div>
                <FileText 
                  size={40} 
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </Link>

          {/* Download Template Card */}
          <button
            style={{
              padding: '48px',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(30, 58, 138, 0.06)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'block',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(30, 58, 138, 0.1)';
              e.currentTarget.style.borderColor = '#3B82F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.06)';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-3 text-2xl font-bold" style={{ color: '#0F2557' }}>
                  Download Template
                </h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.6' }}>
                  LaTeX & Word formats available
                </p>
              </div>
              <Download 
                size={40} 
                style={{ color: '#3B82F6' }}
                className="flex-shrink-0"
              />
            </div>
          </button>
        </div>

        {/* Main Content Sections - Card-based with Breathing Room */}
        <div className="space-y-16">
          {/* Manuscript Types Section */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px',
              boxShadow: '0 4px 16px rgba(30, 58, 138, 0.06)',
              border: '1px solid #E8EEF5',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.06)';
            }}
          >
            <div style={{ marginBottom: '48px', paddingBottom: '24px', borderBottom: '2px solid #E8EEF5' }}>
              <h2 className="text-4xl font-bold" style={{ color: '#0F2557' }}>
                01. Manuscript Types
              </h2>
            </div>

            <div className="space-y-12">
              {[
                {
                  title: 'Research Articles',
                  desc: 'Original research papers presenting novel findings in computing and technology. Typical length: 5,000–10,000 words including references.',
                },
                {
                  title: 'Review Articles',
                  desc: 'Comprehensive reviews of specific topics providing critical analysis of existing literature. Typical length: 7,000–12,000 words including references.',
                },
                {
                  title: 'Technical Notes',
                  desc: 'Brief communications of significant technical developments, tools, or methodologies. Typical length: 2,000–4,000 words including references.',
                },
              ].map((item, idx) => (
                <div key={idx} style={{ paddingLeft: '0' }}>
                  <div className="flex items-start">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#EFF6FF',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '20px',
                        flexShrink: 0,
                        border: '2px solid #3B82F6',
                      }}
                    >
                      <CheckCircle size={24} style={{ color: '#3B82F6' }} />
                    </div>
                    <div>
                      <h3 className="mb-3 text-lg font-bold" style={{ color: '#0F2557' }}>
                        {item.title}
                      </h3>
                      <p style={{ color: '#64748B', lineHeight: '1.8', fontSize: '15px' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Formatting Requirements Section */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px',
              boxShadow: '0 4px 16px rgba(30, 58, 138, 0.06)',
              border: '1px solid #E8EEF5',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.06)';
            }}
          >
            <div style={{ marginBottom: '48px', paddingBottom: '24px', borderBottom: '2px solid #E8EEF5' }}>
              <h2 className="text-4xl font-bold" style={{ color: '#0F2557' }}>
                02. Formatting Requirements
              </h2>
            </div>

            <div className="space-y-10">
              {[
                {
                  title: 'File Format',
                  desc: 'Submit manuscripts as PDF for initial review. Accepted papers may require source files (LaTeX, Word).',
                },
                {
                  title: 'Page Layout',
                  desc: 'A4 or US Letter size, single column, double-spaced, 12pt font, 2.5cm (1 inch) margins.',
                },
                {
                  title: 'Structure',
                  desc: 'Title, Authors & Affiliations, Abstract (250–300 words), Keywords (3–10), Introduction, Methods, Results, Discussion, Conclusion, References.',
                },
                {
                  title: 'Figures & Tables',
                  desc: 'High resolution (minimum 300 DPI), clearly labeled with captions. Submit as separate files if requested.',
                },
                {
                  title: 'References',
                  desc: 'Use APA 7th edition style. Minimum 20 references for research articles, properly cited throughout the text.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start">
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#3B82F6',
                      borderRadius: '50%',
                      marginRight: '20px',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 className="mb-2 text-lg font-bold" style={{ color: '#0F2557' }}>
                      {item.title}
                    </h3>
                    <p style={{ color: '#64748B', lineHeight: '1.8', fontSize: '15px' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ethics & Plagiarism Section */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px',
              boxShadow: '0 4px 16px rgba(30, 58, 138, 0.06)',
              border: '1px solid #E8EEF5',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.06)';
            }}
          >
            <div style={{ marginBottom: '48px', paddingBottom: '24px', borderBottom: '2px solid #E8EEF5' }}>
              <h2 className="text-4xl font-bold" style={{ color: '#0F2557' }}>
                03. Ethics & Plagiarism
              </h2>
            </div>

            {/* Alert Box */}
            <div
              style={{
                backgroundColor: '#FEF8F0',
                border: '2px solid #FED7AA',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '48px',
              }}
            >
              <div className="flex items-start">
                <AlertCircle 
                  size={28}
                  style={{ color: '#D97706', marginRight: '20px', marginTop: '2px', flexShrink: 0 }}
                />
                <div>
                  <p className="mb-2 text-lg font-bold" style={{ color: '#92400E' }}>
                    Zero Tolerance Policy
                  </p>
                  <p style={{ color: '#78350F', lineHeight: '1.8', fontSize: '15px' }}>
                    {journalName} has a strict zero-tolerance policy for plagiarism, data fabrication, and unethical research practices. All submissions undergo comprehensive plagiarism screening using industry-standard tools.
                  </p>
                </div>
              </div>
            </div>

            {/* Ethics Items */}
            <div className="space-y-12">
              {[
                {
                  title: 'Originality',
                  desc: 'Manuscripts must be original work not previously published or under consideration elsewhere. Preprints on recognized servers (arXiv, bioRxiv) are acceptable.',
                },
                {
                  title: 'Authorship',
                  desc: 'All listed authors must have made substantial contributions to the work. Corresponding author is responsible for ensuring all co-authors approve the final version.',
                },
                {
                  title: 'Research Ethics',
                  desc: 'Studies involving human subjects or animals must have received appropriate ethics approval. Include ethics statement and approval numbers in the manuscript.',
                },
                {
                  title: 'Data Availability',
                  desc: 'Authors should make research data available upon reasonable request, unless restricted by ethical or legal considerations.',
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <h3 className="mb-3 text-lg font-bold" style={{ color: '#0F2557' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#64748B', lineHeight: '1.8', fontSize: '15px', marginLeft: '0' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Review Process Section */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px',
              boxShadow: '0 4px 16px rgba(30, 58, 138, 0.06)',
              border: '1px solid #E8EEF5',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.06)';
            }}
          >
            <div style={{ marginBottom: '48px', paddingBottom: '24px', borderBottom: '2px solid #E8EEF5' }}>
              <h2 className="text-4xl font-bold" style={{ color: '#0F2557' }}>
                04. Review Process Overview
              </h2>
            </div>

            <div className="space-y-12">
              {[
                { num: '1', title: 'Submission & Initial Check', desc: 'Manuscripts are checked for completeness, formatting, and scope alignment (1–3 days).' },
                { num: '2', title: 'Editorial Screening', desc: 'Editor-in-Chief or Associate Editor evaluates scientific quality and fit (7–14 days target).' },
                { num: '3', title: 'Peer Review', desc: 'Double-blind review by 2–3 expert reviewers (4–6 weeks typical).' },
                { num: '4', title: 'Decision & Revision', desc: 'Authors receive decision (accept, minor/major revision, reject) and reviewer comments.' },
                { num: '5', title: 'Publication', desc: 'Final manuscripts are copyedited, formatted, and published online with DOI assignment.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start">
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: '#EFF6FF',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '24px',
                      flexShrink: 0,
                      border: '2px solid #3B82F6',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#3B82F6',
                    }}
                  >
                    {item.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 className="mb-2 text-lg font-bold" style={{ color: '#0F2557' }}>
                      {item.title}
                    </h3>
                    <p style={{ color: '#64748B', lineHeight: '1.8', fontSize: '15px' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Publication Fees Section */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px',
              boxShadow: '0 4px 16px rgba(30, 58, 138, 0.06)',
              border: '1px solid #E8EEF5',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.06)';
            }}
          >
            <div style={{ marginBottom: '48px', paddingBottom: '24px', borderBottom: '2px solid #E8EEF5' }}>
              <h2 className="text-4xl font-bold" style={{ color: '#0F2557' }}>
                05. Publication Fees
              </h2>
            </div>

            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '2px solid #86EFAC',
                borderRadius: '16px',
                padding: '32px',
              }}
            >
              <p className="mb-3 text-lg font-bold" style={{ color: '#166534' }}>
                MVP Phase: No Fees
              </p>
              <p style={{ color: '#15803D', lineHeight: '1.8', fontSize: '15px' }}>
                During our initial launch phase, {journalName} does not charge article processing charges (APCs) or submission fees. This policy is subject to change as the journal matures, and authors will be notified of any future fee structure with adequate advance notice.
              </p>
            </div>
          </section>

          {/* How to Submit Section */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px',
              boxShadow: '0 4px 16px rgba(30, 58, 138, 0.06)',
              border: '1px solid #E8EEF5',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.06)';
            }}
          >
            <div style={{ marginBottom: '48px', paddingBottom: '24px', borderBottom: '2px solid #E8EEF5' }}>
              <h2 className="text-4xl font-bold" style={{ color: '#0F2557' }}>
                06. How to Submit
              </h2>
            </div>

            <p className="mb-12" style={{ color: '#64748B', lineHeight: '1.8', fontSize: '15px' }}>
              Submissions are made through our online submission system. Ensure you have the following ready before starting:
            </p>

            <ul className="mb-16 space-y-4">
              {[
                'Manuscript PDF file',
                'Complete author information and affiliations',
                'Abstract and keywords',
                'Cover letter (optional but recommended)',
                'Ethics statements and approvals (if applicable)',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center" style={{ color: '#64748B', fontSize: '15px' }}>
                  <CheckCircle 
                    size={20}
                    style={{ color: '#10B981', marginRight: '16px', flexShrink: 0 }}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link
                to={toJournal('/submit')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '18px 40px',
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 8px 24px rgba(30, 58, 138, 0.2)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(30, 58, 138, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 58, 138, 0.2)';
                }}
              >
                Start Your Submission
                <ArrowRight size={20} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
