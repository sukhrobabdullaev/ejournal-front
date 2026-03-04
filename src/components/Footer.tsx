import React from 'react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto" style={{ borderColor: '#E2E8F0' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#0B1C4D' }}>
              About Ditech Asia Journal
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
              Ditech Asia publishes peer-reviewed research on digital innovation and emerging 
              technologies including artificial intelligence, blockchain, cloud computing, 
              cybersecurity, and innovations shaping Asia's digital future. We are committed 
              to advancing knowledge through rigorous, transparent scholarly communication.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#0B1C4D' }}>
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/policies" 
                  className="hover:underline transition-colors"
                  style={{ color: '#2563EB' }}
                >
                  Publication Ethics
                </Link>
              </li>
              <li>
                <Link 
                  to="/policies" 
                  className="hover:underline transition-colors"
                  style={{ color: '#2563EB' }}
                >
                  Peer Review Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/policies" 
                  className="hover:underline transition-colors"
                  style={{ color: '#2563EB' }}
                >
                  Open Access Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="hover:underline transition-colors"
                  style={{ color: '#2563EB' }}
                >
                  Privacy Statement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm" style={{ color: '#475569' }}>
            <p>© 2025 Ditech Asia. All rights reserved.</p>
            <p className="mt-2 md:mt-0">ISSN: Pending</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
