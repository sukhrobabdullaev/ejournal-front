import React from 'react';
import { Rocket, Target, TrendingUp, Award, Users, Zap } from 'lucide-react';
import { Link } from 'react-router';

export function About() {
  const milestones = [
    { year: '2026', event: 'Journal launch and first issue', status: 'current' },
    { year: '2026 Q3', event: 'DOI prefix registration', status: 'planned' },
    { year: '2026 Q4', event: 'DOAJ indexing application', status: 'planned' },
    { year: '2027', event: 'Google Scholar indexing', status: 'planned' },
    { year: '2027', event: 'Launch author/reviewer dashboards', status: 'planned' },
    { year: '2028', event: 'Scopus indexing application', status: 'planned' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Quality First',
      description: 'Rigorous peer review and high editorial standards ensure every publication contributes meaningfully to the field.',
    },
    {
      icon: Zap,
      title: 'Speed & Efficiency',
      description: 'Modern workflows and dedicated editorial team deliver fast decisions without compromising thoroughness.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by researchers, for researchers. We listen to our community and continuously improve.',
    },
    {
      icon: Award,
      title: 'Open & Transparent',
      description: 'Open access publishing, transparent review process, and clear policies make research accessible to all.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero Header */}
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '80px', paddingBottom: '60px' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            About Ditech Asia Journal
          </h1>
          <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Reimagining academic publishing for the modern era of computing research
          </p>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        {/* Our Story */}
        <section 
          className="bg-white transition-all hover:shadow-xl mb-8"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Our Story</h2>
          <div className="space-y-4 text-base" style={{ color: '#475569', lineHeight: '1.7' }}>
            <p>
              Ditech Asia Journal was founded in 2026 with a clear vision: 
              to create a modern, efficient, and researcher-friendly publishing platform that 
              serves the rapidly evolving field of computing and technology.
            </p>
            <p>
              Frustrated by slow review times, opaque processes, and access barriers that 
              characterize traditional academic publishing, we set out to build something better. 
              Ditech Asia Journal combines the rigor and quality of established journals with the speed, 
              transparency, and accessibility that modern research demands.
            </p>
            <p>
              Our focus on Digital Innovation and Emerging Technologies represents our commitment to being the <em>next</em> generation of 
              academic journals—one that embraces technology not just as our subject matter, but 
              as the foundation of our operations. From submission to publication, every step is 
              optimized for efficiency while maintaining the highest standards of peer review.
            </p>
            <p>
              Today, we're proud to be building a community of leading researchers, practitioners, 
              and educators who share our vision for the future of scholarly communication.
            </p>
          </div>
        </section>

        {/* Vision */}
        <section 
          className="bg-white transition-all hover:shadow-xl mb-8"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <div className="flex items-start mb-6">
            <TrendingUp className="flex-shrink-0 mt-1 mr-4" size={32} style={{ color: '#2563EB' }} />
            <div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#0B1C4D' }}>Our Vision</h2>
              <p className="text-base mb-6" style={{ color: '#475569', lineHeight: '1.7' }}>
                We envision a future where academic publishing accelerates innovation rather than 
                slowing it down. A future where researchers can:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>Receive feedback on their work in days, not months</span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>Track their submission status in real-time with full transparency</span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>Share their findings with a global audience without paywalls</span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>Trust that review processes are fair, rigorous, and constructive</span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>Contribute to a community that values both excellence and efficiency</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white transition-all hover:shadow-xl"
                  style={{
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)'
                  }}
                >
                  <div 
                    className="rounded-lg flex items-center justify-center mb-4"
                    style={{ width: '48px', height: '48px', backgroundColor: '#EFF6FF' }}
                  >
                    <Icon style={{ color: '#2563EB' }} size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#0B1C4D' }}>{value.title}</h3>
                  <p style={{ color: '#475569', lineHeight: '1.7' }}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Roadmap */}
        <section 
          className="bg-white transition-all hover:shadow-xl mb-8"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Roadmap</h2>
          <p className="text-base mb-8" style={{ color: '#475569', lineHeight: '1.7' }}>
            We're committed to continuous improvement. Here's what we're working toward:
          </p>

          <div className="space-y-8">
            {/* Current Focus */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: '#0B1C4D' }}>
                <span className="rounded-full mr-3 animate-pulse" style={{ width: '12px', height: '12px', backgroundColor: '#10B981' }}></span>
                Current Focus (2026)
              </h3>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>MVP Launch:</strong> Establish core publishing infrastructure and onboard inaugural editorial board
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>First Issues:</strong> Publish first batch of peer-reviewed articles
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Community Building:</strong> Engage with computing research community and recruit reviewers
                  </span>
                </li>
              </ul>
            </div>

            {/* Near Term */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: '#0B1C4D' }}>
                <span className="rounded-full mr-3" style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B' }}></span>
                Near Term (6-12 months)
              </h3>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>DOI Automation:</strong> Integrate with CrossRef for automatic DOI assignment
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>DOAJ Indexing:</strong> Apply for inclusion in Directory of Open Access Journals
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Author Dashboard:</strong> Launch dashboard for tracking submissions and revisions
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Reviewer Portal:</strong> Build streamlined review interface with automated reminders
                  </span>
                </li>
              </ul>
            </div>

            {/* Medium Term */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: '#0B1C4D' }}>
                <span className="rounded-full mr-3" style={{ width: '12px', height: '12px', backgroundColor: '#2563EB' }}></span>
                Medium Term (1-2 years)
              </h3>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Scopus Application:</strong> Meet criteria and apply for Scopus indexing
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Analytics Dashboard:</strong> Provide authors with article metrics and citation tracking
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Mobile App:</strong> Launch companion app for on-the-go manuscript management
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>AI-Assisted Tools:</strong> Implement AI tools for plagiarism detection and manuscript formatting
                  </span>
                </li>
              </ul>
            </div>

            {/* Long Term */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: '#0B1C4D' }}>
                <span className="rounded-full mr-3" style={{ width: '12px', height: '12px', backgroundColor: '#9333EA' }}></span>
                Long Term Vision (2+ years)
              </h3>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Web of Science:</strong> Achieve Web of Science indexing for maximum visibility
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Conference Series:</strong> Launch annual Ditech Asia computing conference
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Specialized Tracks:</strong> Introduce focused tracks for emerging subfields
                  </span>
                </li>
                <li className="flex items-start">
                  <span 
                    className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                    style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                  ></span>
                  <span style={{ color: '#475569', lineHeight: '1.7' }}>
                    <strong>Global Reach:</strong> Establish editorial offices in multiple continents
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Milestones Timeline */}
        <section 
          className="bg-white transition-all hover:shadow-xl mb-8"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Key Milestones</h2>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center p-4 rounded-lg"
                style={{
                  backgroundColor: milestone.status === 'current' ? '#EFF6FF' : '#F8FAFC',
                  border: milestone.status === 'current' ? '2px solid #2563EB' : '1px solid #E2E8F0'
                }}
              >
                <div
                  className="rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: milestone.status === 'current' ? '#2563EB' : '#CBD5E1',
                    color: '#FFFFFF'
                  }}
                >
                  <span className="text-sm font-bold text-center">{milestone.year}</span>
                </div>
                <div className="flex-1">
                  <p
                    className="font-medium"
                    style={{
                      color: milestone.status === 'current' ? '#1E3A8A' : '#0B1C4D'
                    }}
                  >
                    {milestone.event}
                  </p>
                </div>
                {milestone.status === 'current' && (
                  <span 
                    className="px-3 py-1 text-xs font-medium rounded-full"
                    style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                  >
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section 
          className="rounded-xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.2)'
          }}
        >
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Join Our Journey</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Be part of the next generation of academic publishing. Submit your research, 
            join our editorial board, or become a reviewer.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/submit"
              className="px-6 py-3 font-medium rounded-lg transition-all hover:shadow-lg"
              style={{ backgroundColor: '#FFFFFF', color: '#0B1C4D' }}
            >
              Submit Your Research
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 font-medium rounded-lg transition-all"
              style={{ 
                backgroundColor: 'transparent', 
                color: '#FFFFFF',
                border: '2px solid #FFFFFF'
              }}
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}