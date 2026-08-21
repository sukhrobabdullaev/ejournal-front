import { Link } from 'react-router';
import { useJournal } from '../contexts/JournalContext';

export function Footer() {
  const { journal, journalSlug } = useJournal();
  const withJournal = (path: string) => (journalSlug ? `/j/${journalSlug}${path}` : '/');
  const journalName = journal?.name || 'the journal';

  return (
    <footer className="mt-auto border-t bg-white" style={{ borderColor: '#E2E8F0' }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* About Section */}
          <div>
            <h3 className="mb-3 text-sm font-semibold" style={{ color: '#0B1C4D' }}>
              About {journalName}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
              {journal?.tagline ||
                `${journalName} publishes peer-reviewed research and is committed to advancing knowledge through rigorous, transparent scholarly communication.`}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold" style={{ color: '#0B1C4D' }}>
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to={withJournal('/policies')}
                  className="transition-colors hover:underline"
                  style={{ color: '#2563EB' }}
                >
                  Publication Ethics
                </Link>
              </li>
              <li>
                <Link
                  to={withJournal('/policies')}
                  className="transition-colors hover:underline"
                  style={{ color: '#2563EB' }}
                >
                  Peer Review Policy
                </Link>
              </li>
              <li>
                <Link
                  to={withJournal('/policies')}
                  className="transition-colors hover:underline"
                  style={{ color: '#2563EB' }}
                >
                  Open Access Policy
                </Link>
              </li>
              <li>
                <Link
                  to={withJournal('/contact')}
                  className="transition-colors hover:underline"
                  style={{ color: '#2563EB' }}
                >
                  Privacy Statement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6" style={{ borderColor: '#E2E8F0' }}>
          <div
            className="flex flex-col items-center justify-between text-sm md:flex-row"
            style={{ color: '#475569' }}
          >
            <p>&copy; 2026 {journalName}. All rights reserved.</p>
            <p className="mt-2 md:mt-0">ISSN: Pending</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
