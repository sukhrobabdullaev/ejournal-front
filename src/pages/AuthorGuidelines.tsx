import React from 'react';
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';

export function AuthorGuidelines() {
  return (
    <div style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero Header */}
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '80px', paddingBottom: '60px' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Author Guidelines
          </h1>
          <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Comprehensive instructions for preparing and submitting manuscripts to Ditech Asia Journal
          </p>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Link
            to="/submit"
            className="flex items-center justify-between transition-all hover:shadow-xl"
            style={{
              padding: '32px',
              backgroundColor: '#0B1C4D',
              color: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.15)'
            }}
          >
            <div>
              <h3 className="font-semibold text-xl mb-2 text-[#ffffff]">Submit Your Manuscript</h3>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Ready to submit? Start here</p>
            </div>
            <FileText size={32} />
          </Link>

          <button 
            className="flex items-center justify-between transition-all hover:shadow-xl"
            style={{
              padding: '32px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '2px solid #0B1C4D',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)'
            }}
          >
            <div>
              <h3 className="font-semibold text-xl mb-2" style={{ color: '#0B1C4D' }}>Download Template</h3>
              <p className="text-sm text-left" style={{ color: '#475569' }}>LaTeX & Word formats</p>
            </div>
            <Download size={32} style={{ color: '#0B1C4D' }} />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Manuscript Types */}
          <section 
            className="bg-white transition-all hover:shadow-xl"
            style={{
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              borderLeft: '4px solid #2563EB'
            }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#0B1C4D' }}>
              Manuscript Types
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center" style={{ color: '#0B1C4D' }}>
                  <CheckCircle className="mr-3" size={20} style={{ color: '#2563EB' }} />
                  Research Articles
                </h3>
                <p className="text-base ml-8" style={{ color: '#475569', lineHeight: '1.7' }}>
                  Original research papers presenting novel findings in computing and technology. 
                  Typical length: 5,000-10,000 words including references.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center" style={{ color: '#0B1C4D' }}>
                  <CheckCircle className="mr-3" size={20} style={{ color: '#2563EB' }} />
                  Review Articles
                </h3>
                <p className="text-base ml-8" style={{ color: '#475569', lineHeight: '1.7' }}>
                  Comprehensive reviews of specific topics providing critical analysis of existing literature. 
                  Typical length: 7,000-12,000 words including references.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center" style={{ color: '#0B1C4D' }}>
                  <CheckCircle className="mr-3" size={20} style={{ color: '#2563EB' }} />
                  Technical Notes
                </h3>
                <p className="text-base ml-8" style={{ color: '#475569', lineHeight: '1.7' }}>
                  Brief communications of significant technical developments, tools, or methodologies. 
                  Typical length: 2,000-4,000 words including references.
                </p>
              </div>
            </div>
          </section>

          {/* Formatting Requirements */}
          <section 
            className="bg-white transition-all hover:shadow-xl"
            style={{
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              borderLeft: '4px solid #2563EB'
            }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#0B1C4D' }}>
              Formatting Requirements
            </h2>
            
            <div className="space-y-5">
              <div className="flex items-start">
                <span 
                  className="rounded-full mt-2 mr-4 flex-shrink-0" 
                  style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                ></span>
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>File Format</p>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Submit manuscripts as PDF for initial review. Accepted papers may require source files (LaTeX, Word).
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span 
                  className="rounded-full mt-2 mr-4 flex-shrink-0" 
                  style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                ></span>
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>Page Layout</p>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    A4 or US Letter size, single column, double-spaced, 12pt font, 2.5cm (1 inch) margins.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span 
                  className="rounded-full mt-2 mr-4 flex-shrink-0" 
                  style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                ></span>
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>Structure</p>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Title, Authors & Affiliations, Abstract (250-300 words), Keywords (3-10), Introduction, Methods, Results, Discussion, Conclusion, References.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span 
                  className="rounded-full mt-2 mr-4 flex-shrink-0" 
                  style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                ></span>
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>Figures & Tables</p>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    High resolution (minimum 300 DPI), clearly labeled with captions. Submit as separate files if requested.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span 
                  className="rounded-full mt-2 mr-4 flex-shrink-0" 
                  style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                ></span>
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>References</p>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Use APA 7th edition style. Minimum 20 references for research articles, properly cited throughout the text.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Ethics & Plagiarism */}
          <section 
            className="bg-white transition-all hover:shadow-xl"
            style={{
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              borderLeft: '4px solid #2563EB'
            }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#0B1C4D' }}>
              Ethics & Plagiarism
            </h2>
            
            <div 
              className="mb-8"
              style={{
                backgroundColor: '#FEF2F2',
                border: '2px solid #FCA5A5',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <div className="flex items-start">
                <AlertCircle className="flex-shrink-0 mt-1 mr-4" size={24} style={{ color: '#DC2626' }} />
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#991B1B' }}>Zero Tolerance Policy</p>
                  <p className="text-sm" style={{ color: '#7F1D1D', lineHeight: '1.7' }}>
                    Ditech Asia Journal has a strict zero-tolerance policy for plagiarism, data fabrication, 
                    and unethical research practices. All submissions undergo plagiarism screening.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#0B1C4D' }}>Originality</h3>
                <p style={{ color: '#475569', lineHeight: '1.7' }}>
                  Manuscripts must be original work not previously published or under consideration elsewhere. 
                  Preprints on recognized servers (arXiv, bioRxiv) are acceptable.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#0B1C4D' }}>Authorship</h3>
                <p style={{ color: '#475569', lineHeight: '1.7' }}>
                  All listed authors must have made substantial contributions to the work. 
                  Corresponding author is responsible for ensuring all co-authors approve the final version.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#0B1C4D' }}>Research Ethics</h3>
                <p style={{ color: '#475569', lineHeight: '1.7' }}>
                  Studies involving human subjects or animals must have received appropriate ethics approval. 
                  Include ethics statement and approval numbers in the manuscript.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#0B1C4D' }}>Data Availability</h3>
                <p style={{ color: '#475569', lineHeight: '1.7' }}>
                  Authors should make research data available upon reasonable request, 
                  unless restricted by ethical or legal considerations.
                </p>
              </div>
            </div>
          </section>

          {/* Review Process */}
          <section 
            className="bg-white transition-all hover:shadow-xl"
            style={{
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              borderLeft: '4px solid #2563EB'
            }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#0B1C4D' }}>
              Review Process Overview
            </h2>
            
            <div className="space-y-6">
              <div className="flex">
                <div 
                  className="flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-4"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#EFF6FF', 
                    color: '#2563EB' 
                  }}
                >
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#0B1C4D' }}>
                    Submission & Initial Check
                  </h3>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Manuscripts are checked for completeness, formatting, and scope alignment (1-3 days).
                  </p>
                </div>
              </div>

              <div className="flex">
                <div 
                  className="flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-4"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#EFF6FF', 
                    color: '#2563EB' 
                  }}
                >
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#0B1C4D' }}>
                    Editorial Screening
                  </h3>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Editor-in-Chief or Associate Editor evaluates scientific quality and fit (7-14 days target).
                  </p>
                </div>
              </div>

              <div className="flex">
                <div 
                  className="flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-4"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#EFF6FF', 
                    color: '#2563EB' 
                  }}
                >
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#0B1C4D' }}>
                    Peer Review
                  </h3>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Double-blind review by 2-3 expert reviewers (4-6 weeks typical).
                  </p>
                </div>
              </div>

              <div className="flex">
                <div 
                  className="flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-4"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#EFF6FF', 
                    color: '#2563EB' 
                  }}
                >
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#0B1C4D' }}>
                    Decision & Revision
                  </h3>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Authors receive decision (accept, minor/major revision, reject) and reviewer comments.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div 
                  className="flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-4"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#EFF6FF', 
                    color: '#2563EB' 
                  }}
                >
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#0B1C4D' }}>
                    Publication
                  </h3>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Final manuscripts are copyedited, formatted, and published online with DOI assignment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Publication Fees */}
          <section 
            className="bg-white transition-all hover:shadow-xl"
            style={{
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              borderLeft: '4px solid #2563EB'
            }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#0B1C4D' }}>
              Publication Fees
            </h2>
            
            <div 
              style={{
                backgroundColor: '#F0FDF4',
                border: '2px solid #86EFAC',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <p className="font-semibold mb-2" style={{ color: '#166534' }}>MVP Phase: No Fees</p>
              <p style={{ color: '#14532D', lineHeight: '1.7' }}>
                During our initial launch phase, Ditech Asia Journal does not charge article processing charges (APCs) 
                or submission fees. This policy is subject to change as the journal matures, and authors 
                will be notified of any future fee structure.
              </p>
            </div>
          </section>

          {/* How to Submit */}
          <section 
            className="bg-white transition-all hover:shadow-xl"
            style={{
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              borderLeft: '4px solid #2563EB'
            }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#0B1C4D' }}>
              How to Submit
            </h2>
            
            <p className="mb-8" style={{ color: '#475569', lineHeight: '1.7' }}>
              Submissions are made through our online submission system. Ensure you have the following ready:
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start" style={{ color: '#475569', lineHeight: '1.7' }}>
                <CheckCircle className="flex-shrink-0 mt-0.5 mr-3" size={20} style={{ color: '#10B981' }} />
                Manuscript PDF file
              </li>
              <li className="flex items-start" style={{ color: '#475569', lineHeight: '1.7' }}>
                <CheckCircle className="flex-shrink-0 mt-0.5 mr-3" size={20} style={{ color: '#10B981' }} />
                Complete author information and affiliations
              </li>
              <li className="flex items-start" style={{ color: '#475569', lineHeight: '1.7' }}>
                <CheckCircle className="flex-shrink-0 mt-0.5 mr-3" size={20} style={{ color: '#10B981' }} />
                Abstract and keywords
              </li>
              <li className="flex items-start" style={{ color: '#475569', lineHeight: '1.7' }}>
                <CheckCircle className="flex-shrink-0 mt-0.5 mr-3" size={20} style={{ color: '#10B981' }} />
                Cover letter (optional but recommended)
              </li>
              <li className="flex items-start" style={{ color: '#475569', lineHeight: '1.7' }}>
                <CheckCircle className="flex-shrink-0 mt-0.5 mr-3" size={20} style={{ color: '#10B981' }} />
                Ethics statements and approvals (if applicable)
              </li>
            </ul>

            <div className="flex justify-center">
              <Link
                to="/submit"
                className="inline-flex items-center text-lg font-semibold transition-all hover:shadow-xl"
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(11, 28, 77, 0.2)'
                }}
              >
                Start Your Submission
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}