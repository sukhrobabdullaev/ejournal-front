import React from 'react';

export function AimsScope() {
  const coreAreas = [
    { title: 'AI & Machine Learning', topics: ['Deep learning', 'Explainable AI', 'NLP', 'Computer vision', 'Reinforcement learning', 'AI ethics'] },
    { title: 'Data Science & Analytics', topics: ['Big data', 'Data mining', 'Predictive analytics', 'Business intelligence', 'Visualization', 'Statistical modeling'] },
    { title: 'Information Systems', topics: ['Enterprise systems', 'Retrieval', 'Database systems', 'Knowledge management', 'Digital transformation'] },
    { title: 'Software Engineering', topics: ['Architecture', 'Agile & DevOps', 'Testing & QA', 'Maintenance', 'Requirements engineering'] },
    { title: 'Human-Computer Interaction', topics: ['UX design', 'Usability', 'Accessibility', 'Wearable computing', 'VR/AR Systems'] },
    { title: 'Cybersecurity', topics: ['Network security', 'Cryptography', 'Protocols', 'Threat detection', 'Cloud & IoT Security'] },
    { title: 'Blockchain Systems', topics: ['Protocols', 'Smart contracts', 'Consensus', 'DApps', 'Scalability'] },
    { title: 'Emerging Technologies', topics: ['Edge computing', 'IoT', 'Quantum computing', 'Green computing', 'Cloud-native'] },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] font-sans text-slate-800 selection:bg-blue-200 selection:text-blue-900 pb-20">
      
      {/* --- 1. HERO HEADER --- */}
      <header className="bg-white border-b border-blue-100 py-16 lg:py-20 shadow-sm relative overflow-hidden">
        {/* Orqa fon effekti (Matnga xalaqit bermaydi) */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          
          {/* Sarlavha Qutisi */}
          <div className="inline-block border border-blue-200 bg-white p-2 rounded-2xl shadow-sm mb-8">
            <div className="bg-blue-50/50 px-8 py-4 rounded-xl flex items-center gap-4">
               <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
               <h1 className="text-3xl font-extrabold tracking-tight text-blue-950 sm:text-5xl uppercase">
                 Aims & <span className="text-blue-600">Scope</span>
               </h1>
            </div>
          </div>
          
          <div className="max-w-3xl pl-4 border-l-4 border-blue-400">
            <p className="text-lg leading-relaxed text-slate-600 font-medium">
              "Ditech Asia Journal is a peer-reviewed, open-access platform dedicated to the 
              dissemination of high-quality research in computer science and information technology."
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-16 lg:space-y-24">
        
        {/* --- 2. OUR MISSION --- */}
        <section className="bg-white border border-blue-100 rounded-[2rem] p-8 lg:p-12 shadow-[0_8px_30px_rgb(59,130,246,0.06)]">
          {/* Sarlavha Qutisi (Endi kontent bilan bir qatorda turadi, xavfsiz) */}
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-white border-2 border-blue-500 rounded-xl shadow-sm">
             <h2 className="text-lg font-bold text-blue-900 uppercase tracking-widest">Our Mission</h2>
          </div>

          <div className="space-y-10">
            <p className="text-lg text-slate-600 leading-relaxed max-w-4xl">
              We aim to bridge the gap between theoretical research and practical application. 
              Our mission is to foster a global community of innovators by providing a 
              transparent, rigorous, and rapid publication environment.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-slate-50 border border-blue-100 transition-all hover:bg-white hover:border-blue-300 hover:shadow-lg">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">01</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">Global Reach</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Open access ensures your research is discoverable by millions worldwide without financial barriers.</p>
                </div>
              </div>
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-slate-50 border border-blue-100 transition-all hover:bg-white hover:border-blue-300 hover:shadow-lg">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">02</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">Scientific Rigor</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Double-blind peer review process maintained by international experts in respective fields.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. CORE RESEARCH AREAS --- */}
        <section className="bg-white border border-blue-100 rounded-[2rem] p-8 lg:p-12 shadow-[0_8px_30px_rgb(59,130,246,0.06)]">
          {/* Sarlavha Qutisi */}
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-12 bg-white border-2 border-blue-500 rounded-xl shadow-sm">
             <h2 className="text-lg font-bold text-blue-900 uppercase tracking-widest">Core Research Areas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreAreas.map((area, index) => (
              <div key={index} className="bg-slate-50 border border-blue-100 p-6 rounded-2xl transition-all duration-300 hover:bg-white hover:border-blue-400 hover:shadow-xl group">
                <h3 className="text-base font-bold text-slate-800 mb-5 group-hover:text-blue-600 transition-colors">
                  {area.title}
                </h3>
                <ul className="space-y-3">
                  {area.topics.map((topic, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-500 group-hover:text-slate-700">
                      <span className="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-blue-300 group-hover:bg-blue-600 shrink-0 transition-colors"></span>
                      <span className="leading-relaxed">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* --- 4. GUIDELINES (ACCEPTANCE / NON-SCOPE) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Acceptance Box */}
          <section className="bg-white border border-blue-100 rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(59,130,246,0.06)] flex flex-col">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-8 bg-emerald-50 border border-emerald-200 rounded-xl self-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-sm font-bold">✓</span>
              <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Acceptance Criteria</h2>
            </div>
            
            <ul className="space-y-4 flex-grow">
              {['Original research with significant novelty', 'Comprehensive surveys with critical analysis', 'Methodologically sound empirical studies', 'Theoretically grounded practical applications'].map((text, i) => (
                <li key={i} className="flex items-start p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                   <span className="font-mono text-emerald-600 font-bold mr-4 mt-0.5">0{i+1}</span> 
                   <span className="text-slate-600 font-medium text-sm leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Non-Scope Box */}
          <section className="bg-white border border-blue-100 rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(59,130,246,0.06)] flex flex-col">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-8 bg-rose-50 border border-rose-200 rounded-xl self-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500 text-white text-sm font-bold">✕</span>
              <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider">Non-Scope Items</h2>
            </div>
            
            <ul className="space-y-4 flex-grow">
              {['Promotional or purely commercial manuscripts', 'Incremental work without substantial novelty', 'Undergraduate-level coursework projects', 'Incomplete experimental validations'].map((text, i) => (
                <li key={i} className="flex items-start p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-rose-200 hover:bg-rose-50/30 transition-colors">
                   <span className="font-mono text-rose-500 font-bold mr-4 mt-0.5">!</span> 
                   <span className="text-slate-600 font-medium text-sm leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* --- 5. EDITORIAL STANDARDS (DARK BLUE SECTION) --- */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0A162E] border border-blue-900 p-8 lg:p-12 shadow-2xl">
          {/* Glowing Background Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative z-10">
            {/* Sarlavha Qutisi */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-[#112240] border border-blue-500/30 rounded-xl">
               <h2 className="text-lg font-bold text-white uppercase tracking-widest">Editorial Standards</h2>
            </div>

            <p className="text-lg text-blue-200 mb-10 max-w-3xl font-medium leading-relaxed">
              Our commitment to scientific excellence and rigorous publishing ethics ensures the highest quality of academic output.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {[
                { title: 'Novelty & Significance', desc: 'Manuscripts must provide original contributions that significantly advance the current state of knowledge.', icon: 'M12 18L3 20L7 4L12 2L17 4L21 20L12 18Z' },
                { title: 'Reproducibility', desc: 'Detailed methodologies must be provided to allow other researchers to replicate and verify findings.', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
                { title: 'Clarity & Quality', desc: 'High standards of language, structure, and data presentation are required for effective dissemination.', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
                { title: 'Ethical Standards', desc: 'Strict adherence to COPE guidelines regarding plagiarism, authorship, and research integrity.', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.548 4.075 10.14 9.5 10.855 5.425-.715 9.5-5.307 9.5-10.855 0-1.32-.213-2.589-.602-3.776A11.959 11.959 0 0112 2.714z' }
              ].map((pillar, i) => (
                <div key={i} className="group flex flex-col rounded-2xl border border-blue-800/50 bg-[#112240]/50 p-6 lg:p-8 transition-all duration-300 hover:border-blue-400 hover:bg-[#112240]">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold rounded-lg border border-blue-500/30">
                      STANDARD 0{i+1}
                    </span>
                    <div className="text-blue-500 group-hover:text-blue-400 transition-colors">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={pillar.icon} />
                        </svg>
                    </div>
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-white group-hover:text-blue-100 transition-colors">
                    {pillar.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-blue-200/60 group-hover:text-blue-200/80">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-blue-100 py-8 text-center bg-white">
        <p className="text-sm font-medium text-slate-500">
          © 2026 Ditech Asia Journal. <span className="text-blue-600 font-bold ml-2">Professional Academic Publishing.</span>
        </p>
      </footer>
    </div>
  );
}