import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { logout, getMyAssignments, getCurrentUser } from '../lib/queries-api';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: getCurrentUser,
    retry: false,
  });

  const userRoles = currentUser?.roles || [];
  const isUserAuthenticated = !!currentUser;
  const canReview =
    userRoles.includes('reviewer') || userRoles.includes('editor') || userRoles.includes('admin');

  const { data: assignments = [] } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: getMyAssignments,
    enabled: canReview,
    retry: false,
  });

  const hasReviewAssignments = assignments.length > 0;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/articles' },
    { name: 'Aims & Scope', path: '/aims-scope' },
    { name: 'Guidelines', path: '/guidelines' },
    { name: 'Editorial Board', path: '/editorial-board' },
    { name: 'Policies', path: '/policies' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-white" style={{ borderColor: '#E2E8F0' }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex min-w-[140px] shrink-0 items-center">
            <span className="text-xl font-bold whitespace-nowrap" style={{ color: '#0B1C4D' }}>
              Ditech Asia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm transition-colors ${
                  isActive(link.path) ? 'border-b-2 pb-0.5 font-medium' : 'hover:opacity-80'
                }`}
                style={{
                  color: isActive(link.path) ? '#2563EB' : '#475569',
                  borderColor: isActive(link.path) ? '#2563EB' : 'transparent',
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {isUserAuthenticated ? (
              <>
                {(userRoles.includes('editor') || userRoles.includes('admin')) && (
                  <Link
                    to="/editor"
                    className="px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:opacity-80"
                    style={{ color: '#475569' }}
                  >
                    Editor
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:opacity-80"
                  style={{ color: '#475569' }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                  className="px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:opacity-80"
                  style={{ color: '#475569' }}
                >
                  Logout
                </button>
                <Link
                  to="/submit"
                  className="px-[18px] py-3 text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: '#0B1C4D',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#08163D')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B1C4D')}
                  onMouseDown={(e) => (e.currentTarget.style.backgroundColor = '#061131')}
                  onMouseUp={(e) => (e.currentTarget.style.backgroundColor = '#08163D')}
                >
                  Submit Manuscript
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:opacity-80"
                  style={{ color: '#475569' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:opacity-80"
                  style={{ color: '#475569' }}
                >
                  Register
                </Link>
                <Link
                  to="/login?next=/submit"
                  className="px-[18px] py-3 text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: '#0B1C4D',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#08163D')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B1C4D')}
                  onMouseDown={(e) => (e.currentTarget.style.backgroundColor = '#061131')}
                  onMouseUp={(e) => (e.currentTarget.style.backgroundColor = '#08163D')}
                >
                  Submit Manuscript
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded p-2 text-gray-700 hover:bg-gray-50 lg:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <nav className="space-y-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded px-3 py-2 text-sm ${
                  isActive(link.path)
                    ? 'bg-blue-50 font-medium text-[#1d4ed8]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#1d4ed8]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="space-y-2 pt-3">
              {isUserAuthenticated ? (
                <>
                  {(userRoles.includes('editor') || userRoles.includes('admin')) && (
                    <Link
                      to="/editor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Editor Dashboard
                    </Link>
                  )}
                  {hasReviewAssignments && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Reviewer Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              )}
              <Link
                to={isUserAuthenticated ? '/submit' : '/login?next=/submit'}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center text-sm font-semibold transition-all"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#0B1C4D',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#08163D')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B1C4D')}
              >
                Submit Manuscript
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
