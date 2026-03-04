import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, User } from 'lucide-react';
import { logout, isAuthenticated, getMyRoles, getMyAssignments } from '../lib/queries-api';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [hasReviewAssignments, setHasReviewAssignments] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchUserData = async () => {
      try {
        const authenticated = await isAuthenticated();
        
        if (!mounted) return;
        
        setIsUserAuthenticated(authenticated);
        
        if (!authenticated) {
          setUserRoles([]);
          setHasReviewAssignments(false);
          return;
        }

        const roles = await getMyRoles();
        const assignments = await getMyAssignments();
        
        if (!mounted) return;
        
        setUserRoles(roles || []);
        setHasReviewAssignments(assignments.length > 0);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (mounted) {
          setIsUserAuthenticated(false);
          setUserRoles([]);
          setHasReviewAssignments(false);
        }
      }
    };
    
    fetchUserData();

    return () => {
      mounted = false;
    };
  }, []);

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
    <header className="bg-white border-b" style={{ borderColor: '#E2E8F0' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between gap-6 h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center min-w-[140px] shrink-0">
            <span className="text-xl font-bold whitespace-nowrap" style={{ color: '#0B1C4D' }}>
              Ditech Asia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm transition-colors ${
                  isActive(link.path)
                    ? 'font-medium border-b-2 pb-0.5'
                    : 'hover:opacity-80'
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
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {isUserAuthenticated ? (
              <>
                {(userRoles.includes('editor') || userRoles.includes('admin')) && (
                  <Link
                    to="/editor"
                    className="px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap hover:opacity-80"
                    style={{ color: '#475569' }}
                  >
                    Editor
                  </Link>
                )}
                {hasReviewAssignments && (
                  <Link
                    to="/review/dashboard"
                    className="px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap hover:opacity-80"
                    style={{ color: '#475569' }}
                  >
                    Reviewer
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap hover:opacity-80"
                  style={{ color: '#475569' }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                  className="px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap hover:opacity-80"
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
                    borderRadius: '10px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#08163D'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0B1C4D'}
                  onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#061131'}
                  onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#08163D'}
                >
                  Submit Manuscript
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap hover:opacity-80"
                  style={{ color: '#475569' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap hover:opacity-80"
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
                    borderRadius: '10px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#08163D'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0B1C4D'}
                  onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#061131'}
                  onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#08163D'}
                >
                  Submit Manuscript
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-50 rounded"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-sm rounded ${
                  isActive(link.path)
                    ? 'text-[#1d4ed8] font-medium bg-blue-50'
                    : 'text-gray-700 hover:text-[#1d4ed8] hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              {isUserAuthenticated ? (
                <>
                  {(userRoles.includes('editor') || userRoles.includes('admin')) && (
                    <Link
                      to="/editor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium text-center rounded hover:bg-gray-50"
                    >
                      Editor Dashboard
                    </Link>
                  )}
                  {hasReviewAssignments && (
                    <Link
                      to="/review/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium text-center rounded hover:bg-gray-50"
                    >
                      Reviewer Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium text-center rounded hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium text-center rounded hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium text-center rounded hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium text-center rounded hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              )}
              <Link
                to={isUserAuthenticated ? "/submit" : "/login?next=/submit"}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-sm font-semibold text-center transition-all"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#0B1C4D',
                  color: '#FFFFFF',
                  borderRadius: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#08163D'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0B1C4D'}
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