import React from 'react';
import { Linkedin, Mail } from 'lucide-react';

// ============================================
// MOCK DATA
// ============================================

interface EditorialBoardMember {
  id: string;
  name: string;
  role: 'editor_in_chief' | 'managing_editor' | 'associate_editor' | 'editorial_board' | 'advisory_board';
  affiliation: string;
  expertise: string[];
  email: string;
  linkedin_url?: string;
}

const MOCK_MEMBERS: EditorialBoardMember[] = [
  // Editor-in-Chief
  {
    id: 'member-1',
    name: 'Dr. Alice Johnson',
    role: 'editor_in_chief',
    affiliation: 'Stanford University, USA',
    expertise: ['AI & Machine Learning', 'Computer Vision', 'Deep Learning'],
    email: 'alice.johnson@stanford.edu',
    linkedin_url: 'https://linkedin.com/in/alice-johnson',
  },

  // Managing Editor
  {
    id: 'member-2',
    name: 'Prof. Robert Chen',
    role: 'managing_editor',
    affiliation: 'MIT, USA',
    expertise: ['Software Engineering', 'System Design', 'Cloud Computing'],
    email: 'r.chen@mit.edu',
    linkedin_url: 'https://linkedin.com/in/robert-chen',
  },

  // Associate Editors
  {
    id: 'member-3',
    name: 'Dr. Priya Patel',
    role: 'associate_editor',
    affiliation: 'Indian Institute of Technology, India',
    expertise: ['Data Science', 'Big Data', 'Analytics', 'Statistics'],
    email: 'priya.patel@iit.ac.in',
    linkedin_url: 'https://linkedin.com/in/priya-patel',
  },
  {
    id: 'member-4',
    name: 'Prof. Marcus Mueller',
    role: 'associate_editor',
    affiliation: 'ETH Zurich, Switzerland',
    expertise: ['Cybersecurity', 'Cryptography', 'Network Security', 'Blockchain'],
    email: 'm.mueller@ethz.ch',
    linkedin_url: 'https://linkedin.com/in/marcus-mueller',
  },
  {
    id: 'member-5',
    name: 'Dr. Yuki Tanaka',
    role: 'associate_editor',
    affiliation: 'University of Tokyo, Japan',
    expertise: ['IoT', 'Embedded Systems', 'Hardware Design', '5G Technology'],
    email: 'y.tanaka@tokyo.ac.jp',
    linkedin_url: 'https://linkedin.com/in/yuki-tanaka',
  },

  // Editorial Board Members
  {
    id: 'member-6',
    name: 'Prof. Sarah Williams',
    role: 'editorial_board',
    affiliation: 'Oxford University, UK',
    expertise: ['Natural Language Processing', 'AI Ethics', 'Computational Linguistics'],
    email: 'sarah.williams@ox.ac.uk',
    linkedin_url: 'https://linkedin.com/in/sarah-williams',
  },
  {
    id: 'member-7',
    name: 'Dr. Luis Garcia',
    role: 'editorial_board',
    affiliation: 'University of São Paulo, Brazil',
    expertise: ['Computer Networks', 'Distributed Systems', 'IoT'],
    email: 'l.garcia@usp.br',
    linkedin_url: 'https://linkedin.com/in/luis-garcia',
  },
  {
    id: 'member-8',
    name: 'Prof. Fatima Al-Mansouri',
    role: 'editorial_board',
    affiliation: 'King Abdullah University, Saudi Arabia',
    expertise: ['Machine Learning', 'Pattern Recognition', 'Computer Vision'],
    email: 'f.almansouri@kaust.edu.sa',
    linkedin_url: 'https://linkedin.com/in/fatima-almansouri',
  },
  {
    id: 'member-9',
    name: 'Dr. James Patterson',
    role: 'editorial_board',
    affiliation: 'Carnegie Mellon University, USA',
    expertise: ['Software Testing', 'Quality Assurance', 'DevOps', 'Agile'],
    email: 'j.patterson@cmu.edu',
    linkedin_url: 'https://linkedin.com/in/james-patterson',
  },
  {
    id: 'member-10',
    name: 'Prof. Zhang Wei',
    role: 'editorial_board',
    affiliation: 'Tsinghua University, China',
    expertise: ['Quantum Computing', 'High-Performance Computing', 'Algorithms'],
    email: 'z.wei@tsinghua.edu.cn',
    linkedin_url: 'https://linkedin.com/in/zhang-wei',
  },
  {
    id: 'member-11',
    name: 'Dr. Ingrid Bergström',
    role: 'editorial_board',
    affiliation: 'Royal Institute of Technology, Sweden',
    expertise: ['Renewable Energy Tech', 'Green Computing', 'Sustainability'],
    email: 'ingrid.bergstrom@kth.se',
    linkedin_url: 'https://linkedin.com/in/ingrid-bergstrom',
  },

  // Advisory Board
  {
    id: 'member-12',
    name: 'Prof. Emeritus Raj Kapoor',
    role: 'advisory_board',
    affiliation: 'National Institute of Technology, India',
    expertise: ['Academic Leadership', 'Research Strategy', 'International Collaboration'],
    email: 'r.kapoor@nit.ac.in',
    linkedin_url: 'https://linkedin.com/in/raj-kapoor',
  },
  {
    id: 'member-13',
    name: 'Dr. Elena Rossi',
    role: 'advisory_board',
    affiliation: 'European Research Council, Belgium',
    expertise: ['Research Funding', 'Scientific Policy', 'Innovation'],
    email: 'e.rossi@erc.eu',
    linkedin_url: 'https://linkedin.com/in/elena-rossi',
  },
];

// ============================================
// CONSTANTS
// ============================================

const ROLE_LABELS: Record<string, string> = {
  editor_in_chief: 'Editor-in-Chief',
  managing_editor: 'Managing Editor',
  associate_editor: 'Associate Editors',
  editorial_board: 'Editorial Board Members',
  advisory_board: 'Advisory Board',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  editor_in_chief:
    'Sets the journal\'s strategic direction and makes final decisions on manuscript acceptance or rejection.',
  managing_editor:
    'Oversees daily operations, manuscript submissions, plagiarism checks, and distribution to editors.',
  associate_editor:
    'Manages specific research domains and assigns peer reviewers for submitted manuscripts.',
  editorial_board:
    'Global experts and Ph.D. scholars providing high-quality peer reviews of submitted papers.',
  advisory_board:
    'Distinguished scholars providing strategic guidance on journal development and international indexing.',
};

const ROLE_ORDER: (keyof typeof ROLE_LABELS)[] = [
  'editor_in_chief',
  'managing_editor',
  'associate_editor',
  'editorial_board',
  'advisory_board',
];

const ROLE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  editor_in_chief: {
    bg: '#FEF8F0',
    text: '#92400E',
    border: '#FED7AA',
  },
  managing_editor: {
    bg: '#F0FDF4',
    text: '#166534',
    border: '#86EFAC',
  },
  associate_editor: {
    bg: '#EFF6FF',
    text: '#0C4A6E',
    border: '#BAE6FD',
  },
  editorial_board: {
    bg: '#F5F3FF',
    text: '#5B21B6',
    border: '#E9D5FF',
  },
  advisory_board: {
    bg: '#FCE7F3',
    text: '#831843',
    border: '#FBCFE8',
  },
};

// ============================================
// COMPONENTS
// ============================================

interface MemberCardProps {
  member: EditorialBoardMember;
  roleKey: string;
}

function MemberCard({ member, roleKey }: MemberCardProps) {
  const colors =
    ROLE_COLORS[roleKey] || ROLE_COLORS.editorial_board;

  // Rasm yo'li - member.id bo'yicha
  const imageSrc = `/images/team/${member.id || 'default'}.png`;

  return (
    <article
      className="group overflow-hidden rounded-20px bg-white transition-all duration-300"
      style={{
        border: '1px solid #E8EEF5',
        boxShadow: '0 4px 16px rgba(30, 58, 138, 0.06)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = '0 12px 32px rgba(30, 58, 138, 0.15)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.06)';
      }}
    >
      {/* Rasm Container */}
      <div
        style={{
          width: '100%',
          height: '280px',
          backgroundColor: colors.bg,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <img
          src={imageSrc}
          alt={member.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLImageElement).style.transform =
              'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLImageElement).style.transform =
              'scale(1)';
          }}
          onError={(e) => {
            // Fallback: rasm topilmasa, placeholder ko'rsatish
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const placeholder = img.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />

        {/* Placeholder - Rasm Yo'q Bo'lsa */}
        <div
          style={{
            display: 'none',
            width: '100%',
            height: '100%',
            backgroundColor: colors.bg,
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '56px',
            color: colors.text,
            fontWeight: 'bold',
          }}
        >
          {member.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Content Container */}
      <div style={{ padding: '32px' }}>
        <h3
          className="mb-2 text-lg font-bold"
          style={{ color: '#0F2557' }}
        >
          {member.name}
        </h3>

        <p
          className="mb-4 text-sm font-semibold"
          style={{ color: colors.text }}
        >
          {member.affiliation || 'Global Expert'}
        </p>

        {/* Expertise Tags */}
        {member.expertise?.length ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {member.expertise.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {tag}
              </span>
            ))}
            {member.expertise.length > 3 && (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                +{member.expertise.length - 3} more
              </span>
            )}
          </div>
        ) : null}

        {/* Contact Links */}
        <div
          className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4"
        >
          {member.email ? (
            <a
              href={`mailto:${member.email}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#3B82F6' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  '#1E3A8A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  '#3B82F6';
              }}
              title={`Email: ${member.email}`}
            >
              <Mail size={16} />
              Email
            </a>
          ) : null}
          {member.linkedin_url ? (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#3B82F6' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  '#1E3A8A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  '#3B82F6';
              }}
              title="View LinkedIn profile"
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EditorialBoard() {
  // Mock data ni o'zini ko'llash
  const members = MOCK_MEMBERS;

  // Role'lar bo'yicha guruhlash
  const grouped: Record<string, EditorialBoardMember[]> = members.reduce(
    (acc, member) => {
      const roleKey = member.role;
      if (!acc[roleKey]) acc[roleKey] = [];
      acc[roleKey].push(member);
      return acc;
    },
    {} as Record<string, EditorialBoardMember[]>
  );

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      {/* Hero Section */}
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
            Editorial Board
          </h1>
          <p
            className="max-w-2xl text-xl"
            style={{
              color: '#475569',
              lineHeight: '1.8',
              fontWeight: '400',
            }}
          >
            Meet the world-class experts who guide the journal's
            scientific integrity and publication excellence.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '100px', paddingBottom: '100px' }}
      >
        {/* Sections with Members */}
        {ROLE_ORDER.map((roleKey) => {
          const items = grouped[roleKey] || [];
          if (!items.length) return null;

          const colors =
            ROLE_COLORS[roleKey] || ROLE_COLORS.editorial_board;
          const isChief = roleKey === 'editor_in_chief';
          const isManager = roleKey === 'managing_editor';

          return (
            <section
              key={roleKey}
              style={{ marginBottom: '120px' }}
            >
              {/* Section Header */}
              <div
                style={{
                  marginBottom: '48px',
                  padding: '32px',
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '16px',
                }}
              >
                <h2
                  className="mb-2 text-4xl font-bold"
                  style={{ color: '#0F2557' }}
                >
                  {ROLE_LABELS[roleKey]}
                </h2>
                <p
                  className="text-base"
                  style={{
                    color: colors.text,
                    lineHeight: '1.7',
                  }}
                >
                  {ROLE_DESCRIPTIONS[roleKey]}
                </p>
              </div>

              {/* Members Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isChief
                    ? '1fr'
                    : isManager
                    ? 'repeat(auto-fit, minmax(300px, 1fr))'
                    : 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '32px',
                }}
              >
                {items.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    roleKey={roleKey}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
