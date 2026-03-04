import React from 'react';

export function AimsScope() {
  const coreAreas = [
    {
      title: 'Artificial Intelligence & Machine Learning',
      topics: [
        'Deep learning architectures',
        'Explainable AI',
        'Natural language processing',
        'Computer vision',
        'Reinforcement learning',
        'AI ethics and fairness',
      ],
    },
    {
      title: 'Data Science & Analytics',
      topics: [
        'Big data technologies',
        'Data mining and knowledge discovery',
        'Predictive analytics',
        'Business intelligence',
        'Data visualization',
        'Statistical modeling',
      ],
    },
    {
      title: 'Information Systems',
      topics: [
        'Enterprise systems',
        'Information retrieval',
        'Database systems',
        'Knowledge management',
        'Decision support systems',
        'Digital transformation',
      ],
    },
    {
      title: 'Software Engineering',
      topics: [
        'Software architecture and design',
        'Agile and DevOps practices',
        'Testing and quality assurance',
        'Software maintenance and evolution',
        'Requirements engineering',
        'Software project management',
      ],
    },
    {
      title: 'Human-Computer Interaction',
      topics: [
        'User experience (UX) design',
        'Usability evaluation',
        'Accessibility',
        'Interactive systems',
        'Mobile and wearable computing',
        'Virtual and augmented reality',
      ],
    },
    {
      title: 'Cybersecurity',
      topics: [
        'Network security',
        'Cryptography',
        'Security protocols',
        'Threat detection and prevention',
        'Privacy-preserving technologies',
        'Security in cloud and IoT',
      ],
    },
    {
      title: 'Blockchain & Distributed Systems',
      topics: [
        'Blockchain platforms and protocols',
        'Smart contracts',
        'Distributed consensus',
        'Cryptocurrency systems',
        'Decentralized applications',
        'Scalability solutions',
      ],
    },
    {
      title: 'Emerging Technologies',
      topics: [
        'Edge computing',
        'Internet of Things (IoT)',
        'Quantum computing',
        'Green computing',
        'Cloud-native architectures',
        'Educational technology',
      ],
    },
  ];

  return (
    <div style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero Header */}
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '80px', paddingBottom: '60px' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Aims & Scope
          </h1>
          <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Defining our mission, research focus, and publication standards
          </p>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        {/* Mission Statement */}
        <section 
          className="bg-white transition-all hover:shadow-xl mb-8"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Our Mission</h2>
          <p className="text-base mb-4" style={{ color: '#475569', lineHeight: '1.7' }}>
            Ditech Asia Journal is dedicated to advancing the 
            frontiers of computing research and practice. We provide a premier platform for 
            researchers, practitioners, and educators to share innovative ideas, methodologies, 
            and findings that shape the future of technology.
          </p>
          <p className="text-base" style={{ color: '#475569', lineHeight: '1.7' }}>
            Our journal embraces a modern, transparent, and efficient publishing model that 
            accelerates knowledge dissemination while maintaining the highest standards of 
            scientific rigor and peer review. Through open access publishing, we ensure 
            research reaches a global audience without barriers.
          </p>
        </section>

        {/* Core Research Areas */}
        <section className="mb-8">
          <div 
            className="bg-white transition-all hover:shadow-xl mb-8"
            style={{
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              borderLeft: '4px solid #2563EB'
            }}
          >
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Core Research Areas</h2>
            <p className="text-base mb-8" style={{ color: '#475569', lineHeight: '1.7' }}>
              Ditech Asia Journal publishes research across the following areas of computing and technology:
            </p>

            <div className="space-y-6">
              {coreAreas.map((area, index) => (
                <div
                  key={index}
                  className="bg-white transition-all"
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#0B1C4D' }}>{area.title}</h3>
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                    {area.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-start">
                        <span 
                          className="rounded-full mt-1.5 mr-3 flex-shrink-0" 
                          style={{ width: '6px', height: '6px', backgroundColor: '#2563EB' }}
                        ></span>
                        <span className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Publish */}
        <section 
          className="bg-white transition-all hover:shadow-xl mb-8"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>What We Publish</h2>
          <p className="text-base mb-6" style={{ color: '#475569', lineHeight: '1.7' }}>
            Ditech Asia Journal welcomes submissions that meet our quality standards and contribute 
            meaningfully to the field:
          </p>
          <ul className="space-y-3">
            {[
              'Original research articles presenting novel findings',
              'Comprehensive review articles and surveys',
              'Technical notes on significant developments',
              'Case studies with generalizable insights',
              'Empirical studies with rigorous methodology',
              'Theoretical contributions with practical implications',
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-3 mt-0.5" style={{ color: '#10B981' }}>✓</span>
                <span className="text-base" style={{ color: '#475569', lineHeight: '1.7' }}>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What We Don't Publish */}
        <section 
          className="bg-white transition-all hover:shadow-xl mb-8"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>What We Don't Publish</h2>
          <p className="text-base mb-6" style={{ color: '#475569', lineHeight: '1.7' }}>
            To maintain quality and focus, we do not accept the following:
          </p>
          <ul className="space-y-3">
            {[
              'Purely promotional or commercial content',
              'Papers without adequate literature review',
              'Incremental improvements without significant novelty',
              'Undergraduate or coursework projects',
              'Papers with insufficient experimental validation',
              'Content previously published elsewhere',
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-3 mt-0.5" style={{ color: '#DC2626' }}>✗</span>
                <span className="text-base" style={{ color: '#475569', lineHeight: '1.7' }}>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Quality Standards */}
        <section 
          className="bg-white transition-all hover:shadow-xl"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#0B1C4D' }}>Quality Standards</h2>
          
          <div className="space-y-6">
            <div 
              className="pl-6"
              style={{ borderLeft: '4px solid #2563EB' }}
            >
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#0B1C4D' }}>Novelty & Significance</h3>
              <p className="text-base" style={{ color: '#475569', lineHeight: '1.7' }}>
                Research must present original findings that advance knowledge in the field. 
                Incremental improvements must demonstrate clear significance and impact.
              </p>
            </div>

            <div 
              className="pl-6"
              style={{ borderLeft: '4px solid #2563EB' }}
            >
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#0B1C4D' }}>Rigor & Methodology</h3>
              <p className="text-base" style={{ color: '#475569', lineHeight: '1.7' }}>
                Studies must employ appropriate methodologies with clear descriptions that enable 
                reproducibility. Empirical work requires sufficient experimental validation.
              </p>
            </div>

            <div 
              className="pl-6"
              style={{ borderLeft: '4px solid #2563EB' }}
            >
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#0B1C4D' }}>Clarity & Presentation</h3>
              <p className="text-base" style={{ color: '#475569', lineHeight: '1.7' }}>
                Manuscripts should be well-written, clearly structured, and accessible to the 
                intended audience. Proper contextualization within existing literature is essential.
              </p>
            </div>

            <div 
              className="pl-6"
              style={{ borderLeft: '4px solid #2563EB' }}
            >
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#0B1C4D' }}>Ethical Standards</h3>
              <p className="text-base" style={{ color: '#475569', lineHeight: '1.7' }}>
                All research must comply with ethical guidelines including research integrity, 
                proper attribution, data transparency, and human/animal subject protections where applicable.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}