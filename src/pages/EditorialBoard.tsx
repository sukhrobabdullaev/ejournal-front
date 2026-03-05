import React from 'react';
import { Mail, Linkedin } from 'lucide-react';

// Editorial Board Data (static content for MVP)
const editorialBoard = [
  {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    title: 'Editor-in-Chief',
    institution: 'Stanford University',
    department: 'Computer Science',
    expertise: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning'],
    email: 's.mitchell@nexa-jct.org',
    linkedin: 'https://linkedin.com/in/sarahmitchell',
  },
  {
    id: '2',
    name: 'Prof. David Chen',
    title: 'Managing Editor',
    institution: 'MIT',
    department: 'Electrical Engineering & Computer Science',
    expertise: ['Distributed Systems', 'Cloud Computing', 'Microservices'],
    email: 'd.chen@nexa-jct.org',
    linkedin: 'https://linkedin.com/in/davidchen',
  },
  {
    id: '3',
    name: 'Dr. Emily Johnson',
    title: 'Associate Editor',
    institution: 'Carnegie Mellon University',
    department: 'Human-Computer Interaction Institute',
    expertise: ['UX Design', 'Accessibility', 'Human-AI Interaction'],
    email: 'e.johnson@nexa-jct.org',
    linkedin: 'https://linkedin.com/in/emilyjohnson',
  },
  {
    id: '4',
    name: 'Prof. Michael Torres',
    title: 'Associate Editor',
    institution: 'UC Berkeley',
    department: 'Computer Science',
    expertise: ['Cybersecurity', 'Cryptography', 'Network Security'],
    email: 'm.torres@nexa-jct.org',
    linkedin: 'https://linkedin.com/in/michaeltorres',
  },
  {
    id: '5',
    name: 'Dr. Aisha Patel',
    title: 'Associate Editor',
    institution: 'Oxford University',
    department: 'Department of Computer Science',
    expertise: ['Data Science', 'Big Data Analytics', 'Visualization'],
    email: 'a.patel@nexa-jct.org',
    linkedin: 'https://linkedin.com/in/aishapatel',
  },
  {
    id: '6',
    name: "Prof. James O'Brien",
    title: 'Associate Editor',
    institution: 'ETH Zurich',
    department: 'Information Technology',
    expertise: ['Blockchain', 'Distributed Ledger', 'Smart Contracts'],
    email: 'j.obrien@nexa-jct.org',
    linkedin: 'https://linkedin.com/in/jamesobrien',
  },
  {
    id: '7',
    name: 'Dr. Lin Wang',
    title: 'Associate Editor',
    institution: 'Tsinghua University',
    department: 'Computer Science',
    expertise: ['Computer Vision', 'Pattern Recognition', 'Image Processing'],
    email: 'l.wang@nexa-jct.org',
    linkedin: 'https://linkedin.com/in/linwang',
  },
  {
    id: '8',
    name: 'Prof. Maria Garcia',
    title: 'Associate Editor',
    institution: 'Technical University of Munich',
    department: 'Informatics',
    expertise: ['Software Engineering', 'DevOps', 'Agile Methods'],
    email: 'm.garcia@nexa-jct.org',
    linkedin: 'https://linkedin.com/in/mariagarcia',
  },
];

export function EditorialBoard() {
  const editorInChief = editorialBoard.find((member) => member.title === 'Editor-in-Chief');
  const managingEditor = editorialBoard.find((member) => member.title === 'Managing Editor');
  const associateEditors = editorialBoard.filter((member) => member.title === 'Associate Editor');

  const profileImages = [
    'https://images.unsplash.com/photo-1758685734511-4f49ce9a382b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhY2FkZW1pYyUyMHJlc2VhcmNoZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzA3MDgxNjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1758685848602-09e52ef9c7d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzb3IlMjBzY2llbnRpc3QlMjBsYWIlMjBjb2F0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwNzA4MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1610387694365-19fafcc86d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwd29tYW58ZW58MXx8fHwxNzcwNjg4NzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1672285314698-67a456326e09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbnRpc3QlMjByZXNlYXJjaGVyJTIwcG9ydHJhaXQlMjBtYW58ZW58MXx8fHwxNzcwNzA4MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  ];

  const getImageForMember = (index: number) => {
    return profileImages[index % profileImages.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Editorial Board</h1>
          <p className="text-lg text-gray-600">
            Meet the distinguished scholars leading NEXA-JCT's editorial excellence
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Editor-in-Chief */}
        {editorInChief && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Editor-in-Chief</h2>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
              <div className="flex flex-col gap-6 md:flex-row">
                <img
                  src={getImageForMember(0)}
                  alt={editorInChief.name}
                  className="h-48 w-48 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="mb-1 text-2xl font-bold text-gray-900">{editorInChief.name}</h3>
                  <p className="mb-4 text-lg text-blue-600">{editorInChief.institution}</p>

                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-gray-600">Areas of Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {editorInChief.expertise.map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <a
                      href={`mailto:${editorInChief.email}`}
                      className="flex items-center text-gray-600 transition-colors hover:text-blue-600"
                    >
                      <Mail size={18} className="mr-2" />
                      <span className="text-sm">{editorInChief.email}</span>
                    </a>
                    <a
                      href={editorInChief.linkedin}
                      className="flex items-center text-gray-600 transition-colors hover:text-blue-600"
                    >
                      <Linkedin size={18} className="mr-2" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Managing Editor */}
        {managingEditor && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Managing Editor</h2>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
              <div className="flex flex-col gap-6 md:flex-row">
                <img
                  src={getImageForMember(1)}
                  alt={managingEditor.name}
                  className="h-48 w-48 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="mb-1 text-2xl font-bold text-gray-900">{managingEditor.name}</h3>
                  <p className="mb-4 text-lg text-blue-600">{managingEditor.institution}</p>

                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-gray-600">Areas of Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {managingEditor.expertise.map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <a
                      href={`mailto:${managingEditor.email}`}
                      className="flex items-center text-gray-600 transition-colors hover:text-blue-600"
                    >
                      <Mail size={18} className="mr-2" />
                      <span className="text-sm">{managingEditor.email}</span>
                    </a>
                    <a
                      href={managingEditor.linkedin}
                      className="flex items-center text-gray-600 transition-colors hover:text-blue-600"
                    >
                      <Linkedin size={18} className="mr-2" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Associate Editors */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Associate Editors</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {associateEditors.map((editor, index) => (
              <div
                key={editor.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <img
                  src={getImageForMember(index + 2)}
                  alt={editor.name}
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                />
                <h3 className="mb-1 text-lg font-bold text-gray-900">{editor.name}</h3>
                <p className="mb-3 text-sm text-blue-600">{editor.institution}</p>

                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium text-gray-600">Expertise:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {editor.expertise.map((area) => (
                      <span
                        key={area}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={editor.linkedin}
                  className="flex items-center text-sm text-gray-600 transition-colors hover:text-blue-600"
                >
                  <Linkedin size={16} className="mr-2" />
                  View Profile
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Join Our Board */}
        <section className="mt-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold text-[#ffffff]">Join Our Editorial Board</h2>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-blue-100">
            We're always looking for distinguished researchers to join our editorial team. If you're
            interested in shaping the future of computing research, we'd love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-lg bg-white px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-gray-100"
          >
            Express Interest
          </a>
        </section>
      </div>
    </div>
  );
}
