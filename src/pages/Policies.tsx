import React, { useState } from 'react';
import { Shield, Users, Globe, FileSearch } from 'lucide-react';

export function Policies() {
  const [activeTab, setActiveTab] = useState<'ethics' | 'review' | 'access' | 'plagiarism'>('ethics');

  const tabs = [
    { id: 'ethics' as const, label: 'Publication Ethics', icon: Shield },
    { id: 'review' as const, label: 'Peer Review', icon: Users },
    { id: 'access' as const, label: 'Open Access', icon: Globe },
    { id: 'plagiarism' as const, label: 'Plagiarism', icon: FileSearch },
  ];

  return (
    <div style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero Header */}
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '80px', paddingBottom: '60px' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Policies
          </h1>
          <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Our commitment to ethical publishing, rigorous review, and open access
          </p>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        {/* Tabs */}
        <div 
          className="bg-white mb-8"
          style={{
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            overflow: 'hidden'
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center justify-center p-4 font-medium transition-all"
                  style={{
                    backgroundColor: activeTab === tab.id ? '#EFF6FF' : 'transparent',
                    color: activeTab === tab.id ? '#2563EB' : '#64748B',
                    borderBottom: activeTab === tab.id ? '3px solid #2563EB' : 'none'
                  }}
                >
                  <Icon size={24} className="mb-2" />
                  <span className="text-sm text-center">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '32px' }}>
            {/* Publication Ethics */}
            {activeTab === 'ethics' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: '#0B1C4D' }}>Publication Ethics Policy</h2>
                  <p className="text-base mb-6" style={{ color: '#475569', lineHeight: '1.7' }}>
                    Ditech Asia Journal is committed to upholding the highest standards of publication ethics 
                    and follows guidelines established by the Committee on Publication Ethics (COPE). 
                    All parties involved—authors, editors, reviewers, and publishers—share responsibility 
                    for maintaining these standards.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Author Responsibilities</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Originality & Plagiarism</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Authors must ensure their work is entirely original. Proper citation is required for all sources.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Data Authenticity</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Research data must be accurate and authentic. Fabrication or falsification is strictly prohibited.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Multiple Submission</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Manuscripts under review should not be submitted to other journals simultaneously.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Authorship</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>All listed authors must have made substantial contributions. All contributors should be acknowledged.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Conflicts of Interest</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Authors must disclose any financial or personal relationships that could influence their work.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Fundamental Errors</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>If significant errors are discovered post-publication, authors must notify the editor promptly.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Editor Responsibilities</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Fair Evaluation</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Manuscripts are evaluated solely on merit, regardless of author characteristics.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Confidentiality</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Editors must maintain confidentiality of all submitted manuscripts and reviewer identities.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Conflict Resolution</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Editors must address ethical concerns and misconduct allegations promptly and fairly.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Reviewer Responsibilities</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Expertise & Timeliness</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Reviewers should only accept manuscripts in their area of expertise and provide timely reviews.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Objectivity</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Reviews should be constructive, objective, and free from personal criticism.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span 
                        className="rounded-full mt-2 mr-4 flex-shrink-0" 
                        style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                      ></span>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Confidentiality</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>Reviewers must not share or use information from manuscripts under review.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Peer Review Policy */}
            {activeTab === 'review' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: '#0B1C4D' }}>Peer Review Policy</h2>
                  <p className="text-base mb-6" style={{ color: '#475569', lineHeight: '1.7' }}>
                    Ditech Asia Journal employs a rigorous double-blind peer review process to ensure 
                    the quality and validity of published research. Our review process balances 
                    thoroughness with efficiency to provide timely feedback to authors.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Double-Blind Review</h3>
                  <p className="mb-4" style={{ color: '#475569', lineHeight: '1.7' }}>
                    In our double-blind review process, both author and reviewer identities remain 
                    anonymous. This minimizes bias and ensures manuscripts are evaluated solely on merit.
                  </p>
                  <div 
                    style={{
                      backgroundColor: '#EFF6FF',
                      border: '2px solid #93C5FD',
                      borderRadius: '12px',
                      padding: '20px'
                    }}
                  >
                    <p className="text-sm" style={{ color: '#1E3A8A', lineHeight: '1.7' }}>
                      <strong>Note:</strong> Authors should ensure their manuscripts do not contain 
                      identifying information in the body of the text, including author names, 
                      affiliations, or acknowledgments during initial submission.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-6" style={{ color: '#0B1C4D' }}>Review Process Steps</h3>
                  <div className="space-y-5">
                    {[
                      { num: 1, title: 'Initial Screening (1-3 days)', desc: 'Editorial office checks formatting, completeness, and basic fit with journal scope.' },
                      { num: 2, title: 'Editorial Assessment (7-14 days)', desc: 'Editor-in-Chief or Associate Editor evaluates scientific quality and novelty.' },
                      { num: 3, title: 'Reviewer Assignment (3-5 days)', desc: '2-3 expert reviewers are identified and invited based on their expertise.' },
                      { num: 4, title: 'Peer Review (4-6 weeks)', desc: 'Reviewers provide detailed feedback on methodology, results, and contribution.' },
                      { num: 5, title: 'Editorial Decision (3-5 days)', desc: 'Editor synthesizes reviewer feedback and makes final decision.' },
                    ].map((step) => (
                      <div key={step.num} className="flex">
                        <div 
                          className="flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-4"
                          style={{ 
                            width: '44px', 
                            height: '44px', 
                            backgroundColor: '#2563EB', 
                            color: '#FFFFFF' 
                          }}
                        >
                          {step.num}
                        </div>
                        <div>
                          <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>{step.title}</p>
                          <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Decision Types</h3>
                  <ul className="space-y-3">
                    {[
                      { color: '#10B981', title: 'Accept', desc: 'Manuscript accepted for publication with minor editorial changes.' },
                      { color: '#F59E0B', title: 'Minor Revision', desc: 'Small changes required; typically does not require re-review.' },
                      { color: '#EF4444', title: 'Major Revision', desc: 'Significant improvements needed; manuscript sent back to reviewers after revision.' },
                      { color: '#DC2626', title: 'Reject', desc: 'Manuscript does not meet quality standards or journal scope.' },
                    ].map((decision, idx) => (
                      <li key={idx} className="flex items-start">
                        <span 
                          className="rounded-full mt-2 mr-4 flex-shrink-0" 
                          style={{ width: '8px', height: '8px', backgroundColor: decision.color }}
                        ></span>
                        <div>
                          <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>{decision.title}</p>
                          <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>{decision.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Review Criteria</h3>
                  <p className="mb-4" style={{ color: '#475569', lineHeight: '1.7' }}>Reviewers evaluate manuscripts based on:</p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {[
                      'Originality and novelty',
                      'Scientific rigor and methodology',
                      'Significance and impact',
                      'Clarity of presentation',
                      'Literature review adequacy',
                      'Data quality and analysis',
                    ].map((criteria, idx) => (
                      <li key={idx} className="flex items-start">
                        <span 
                          className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                          style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                        ></span>
                        <span className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Open Access Policy */}
            {activeTab === 'access' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: '#0B1C4D' }}>Open Access Policy</h2>
                  <p className="text-base mb-6" style={{ color: '#475569', lineHeight: '1.7' }}>
                    Ditech Asia Journal is committed to open access publishing, ensuring that research is freely 
                    available to read, download, and share worldwide. We believe that removing barriers 
                    to access accelerates scientific progress and maximizes research impact.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>License & Copyright</h3>
                  <div 
                    className="mb-4"
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '2px solid #86EFAC',
                      borderRadius: '12px',
                      padding: '24px'
                    }}
                  >
                    <p className="font-semibold mb-2" style={{ color: '#166534' }}>Creative Commons CC BY 4.0</p>
                    <p className="text-sm" style={{ color: '#14532D', lineHeight: '1.7' }}>
                      All articles published in Ditech Asia Journal are licensed under Creative Commons Attribution 4.0 
                      International License (CC BY 4.0). This allows users to copy, distribute, transmit, 
                      and adapt the work, provided appropriate credit is given.
                    </p>
                  </div>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Authors retain copyright of their work while granting Ditech Asia Journal a license to publish 
                    the article. This ensures authors maintain control while enabling widespread dissemination.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Reader Rights</h3>
                  <p className="mb-4" style={{ color: '#475569', lineHeight: '1.7' }}>Under our open access policy, readers are free to:</p>
                  <ul className="space-y-3">
                    {[
                      { title: 'Read', desc: 'Access full-text articles without subscription or payment barriers.' },
                      { title: 'Download', desc: 'Save and store articles for personal or educational use.' },
                      { title: 'Share', desc: 'Distribute articles to colleagues, students, and the public.' },
                      { title: 'Reuse', desc: 'Adapt and build upon the work for any purpose, including commercial, with proper attribution.' },
                    ].map((right, idx) => (
                      <li key={idx} className="flex items-start">
                        <span 
                          className="rounded-full mt-2 mr-4 flex-shrink-0" 
                          style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }}
                        ></span>
                        <div>
                          <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>{right.title}</p>
                          <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>{right.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Article Processing Charges</h3>
                  <div 
                    style={{
                      backgroundColor: '#EFF6FF',
                      border: '2px solid #93C5FD',
                      borderRadius: '12px',
                      padding: '24px'
                    }}
                  >
                    <p className="font-semibold mb-2" style={{ color: '#1E3A8A' }}>MVP Phase: No APCs</p>
                    <p className="text-sm mb-3" style={{ color: '#1E40AF', lineHeight: '1.7' }}>
                      During our initial launch phase, Ditech Asia Journal does not charge article processing charges (APCs). 
                      This allows us to build a strong foundation and community.
                    </p>
                    <p className="text-sm" style={{ color: '#1E40AF', lineHeight: '1.7' }}>
                      <strong>Future Sustainability:</strong> As the journal matures, we may introduce a transparent 
                      APC structure to support operations. Authors will be notified well in advance of any changes, 
                      and waivers will be available for authors from low-income countries.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Archiving & Preservation</h3>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    Ditech Asia Journal is committed to long-term preservation of published content. Articles are permanently 
                    archived and remain freely accessible. We plan to participate in preservation initiatives like 
                    CLOCKSS and Portico to ensure content remains available even if the journal ceases operation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Indexing Goals</h3>
                  <p className="mb-4" style={{ color: '#475569', lineHeight: '1.7' }}>
                    We are working toward indexing in major databases to increase visibility:
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Directory of Open Access Journals (DOAJ)',
                      'Google Scholar',
                      'Scopus (long-term goal)',
                      'Web of Science (long-term goal)',
                    ].map((index, idx) => (
                      <li key={idx} className="flex items-center">
                        <span 
                          className="rounded-full mr-3" 
                          style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                        ></span>
                        <span className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>{index}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Plagiarism Policy */}
            {activeTab === 'plagiarism' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: '#0B1C4D' }}>Plagiarism Policy</h2>
                  <p className="text-base mb-6" style={{ color: '#475569', lineHeight: '1.7' }}>
                    Ditech Asia Journal has zero tolerance for plagiarism in any form. All submissions undergo 
                    plagiarism screening to ensure originality and proper attribution. We use advanced 
                    detection tools and editorial expertise to maintain the integrity of our publications.
                  </p>
                </div>

                <div 
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '3px solid #FCA5A5',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#991B1B' }}>Zero Tolerance Policy</h3>
                  <p style={{ color: '#7F1D1D', lineHeight: '1.7' }}>
                    Manuscripts found to contain plagiarism will be immediately rejected. Authors who 
                    submit plagiarized work may be banned from future submissions and reported to their 
                    institutions. Published articles discovered to contain plagiarism will be retracted.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Types of Plagiarism</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Direct Plagiarism', desc: 'Copying text word-for-word from another source without quotation marks or citation.' },
                      { title: 'Paraphrasing Plagiarism', desc: 'Rewording someone else\'s ideas without proper attribution, even if the text is changed.' },
                      { title: 'Self-Plagiarism', desc: 'Reusing significant portions of one\'s own previously published work without proper citation.' },
                      { title: 'Mosaic Plagiarism', desc: 'Borrowing phrases or ideas from multiple sources and weaving them together without attribution.' },
                      { title: 'Data Plagiarism', desc: 'Using someone else\'s data, figures, or images without proper permission and citation.' },
                    ].map((type, idx) => (
                      <div key={idx}>
                        <p className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>{type.title}</p>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>{type.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Screening Process</h3>
                  <p className="mb-4" style={{ color: '#475569', lineHeight: '1.7' }}>
                    All submitted manuscripts are screened for plagiarism using industry-standard detection software. 
                    Manuscripts with significant similarity to existing work are flagged for editorial review.
                  </p>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>
                    While some overlap is acceptable for common terminology and standard methodology descriptions, 
                    manuscripts with substantial copying will be rejected or returned for revision.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>Author Guidance</h3>
                  <p className="mb-4" style={{ color: '#475569', lineHeight: '1.7' }}>To avoid plagiarism:</p>
                  <ul className="space-y-3">
                    {[
                      'Always cite sources properly using the required citation format',
                      'Use quotation marks for direct quotes and provide page numbers',
                      'Paraphrase substantially and cite the original source',
                      'Ensure all figures, tables, and data are original or properly attributed',
                      'Use plagiarism detection tools yourself before submission',
                      'When in doubt about attribution, err on the side of citation',
                    ].map((guidance, idx) => (
                      <li key={idx} className="flex items-start">
                        <span 
                          className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                          style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                        ></span>
                        <span className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>{guidance}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
