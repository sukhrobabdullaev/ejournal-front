import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, ChevronDown, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  logout,
  getCurrentUser,
  getPublishedIssues,
  getApprovedRolesFromUser,
  getRoleLabel,
  initializeActiveRole,
  setMyActiveRole,
  getStoredActiveRole,
  ACTIVE_ROLE_STORAGE_KEY,
  ACTIVE_ROLE_CHANGED_EVENT,
} from '../lib/queries-api';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPublishedDropdown, setShowPublishedDropdown] = useState(false);
  const [activeRole, setActiveRoleState] = useState<string | null>(getStoredActiveRole());

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const publishedMenuRef = useRef<HTMLDivElement | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: getCurrentUser,
    retry: false,
  });
  const { data: publishedIssues = [] } = useQuery({
    queryKey: ['published-issues'],
    queryFn: getPublishedIssues,
  });

  const isUserAuthenticated = !!currentUser;
  const approvedRoles = useMemo(() => getApprovedRolesFromUser(currentUser || null), [currentUser]);
  const dashboardPath = activeRole === 'editor' ? '/editor' : '/dashboard';

  const displayName = currentUser?.full_name || 'User';
  const displayRole = activeRole ? getRoleLabel(activeRole) : 'No Active Role';
  const initials = useMemo(() => {
    const parts = (displayName || 'User').split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [displayName]);

  useEffect(() => {
    if (!currentUser) {
      setActiveRoleState(null);
      return;
    }

    let isMounted = true;
    initializeActiveRole(currentUser).then((role) => {
      if (isMounted) {
        setActiveRoleState(role);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    const handleRoleChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ role?: string | null }>;
      const roleFromEvent = customEvent.detail?.role;
      setActiveRoleState(roleFromEvent ?? getStoredActiveRole());
    };

    const handleStorageChanged = (event: StorageEvent) => {
      if (event.key === ACTIVE_ROLE_STORAGE_KEY) {
        setActiveRoleState(event.newValue);
      }
    };

    window.addEventListener(ACTIVE_ROLE_CHANGED_EVENT, handleRoleChanged as EventListener);
    window.addEventListener('storage', handleStorageChanged);

    return () => {
      window.removeEventListener(ACTIVE_ROLE_CHANGED_EVENT, handleRoleChanged as EventListener);
      window.removeEventListener('storage', handleStorageChanged);
    };
  }, []);

  useEffect(() => {
    setShowProfileDropdown(false);
    setShowPublishedDropdown(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) {
      } else if (!profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }

      if (!publishedMenuRef.current) {
        return;
      }
      if (!publishedMenuRef.current.contains(event.target as Node)) {
        setShowPublishedDropdown(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleRoleSwitch = async (role: string) => {
    if (!currentUser || !approvedRoles.includes(role)) {
      return;
    }

    const switched = await setMyActiveRole(role, currentUser);
    if (switched) {
      setActiveRoleState(role);
      setShowProfileDropdown(false);
      setMobileMenuOpen(false);
      navigate('/dashboard');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Aims & Scope', path: '/aims-scope' },
    { name: 'Guidelines', path: '/guidelines' },
    { name: 'Editorial Board', path: '/editorial-board' },
    { name: 'Policies', path: '/policies' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isPublishedActive = location.pathname.startsWith('/published');
  const latestIssues = publishedIssues.slice(0, 6);

  return (
    <header
      className="border-b bg-white/95 backdrop-blur"
      style={{ borderColor: '#D8E4F6', boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link
            to="/"
            className="flex min-w-[140px] shrink-0 items-center transition-all duration-300 ease-in-out hover:opacity-85"
          >
            <span className="whitespace-nowrap text-xl font-bold text-[#0B1C4D]">Ditech Asia</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            <div ref={publishedMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowPublishedDropdown((prev) => !prev)}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition-all duration-300 ease-in-out ${
                  isPublishedActive
                    ? 'bg-[#EAF3FF] font-semibold text-[#0B1C4D] shadow-[0_4px_12px_rgba(37,99,235,0.12)]'
                    : 'text-slate-600 hover:-translate-y-0.5 hover:bg-[#F3F8FF] hover:text-[#0B1C4D] hover:shadow-[0_6px_16px_rgba(37,99,235,0.10)]'
                }`}
              >
                Published
                {publishedIssues.length > 0 && (
                  <span className="rounded-full bg-[#1D4ED8] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {publishedIssues.length}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    showPublishedDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showPublishedDropdown && (
                <div
                  className="saas-fade-menu absolute left-0 z-50 mt-2 w-80 rounded-2xl border bg-white p-2 shadow-[0_16px_36px_rgba(15,23,42,0.14)]"
                  style={{ borderColor: '#D8E4F6' }}
                >
                  <Link
                    to="/published"
                    className="mb-1 block rounded-lg px-3 py-2 text-sm font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF]"
                    onClick={() => setShowPublishedDropdown(false)}
                  >
                    View All Published Issues
                  </Link>
                  {latestIssues.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-500">No journals published yet.</p>
                  ) : (
                    latestIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="mb-1 rounded-lg px-3 py-2 text-sm hover:bg-[#F8FBFF]"
                      >
                        <Link
                          to={`/published/${issue.id}`}
                          className="block text-slate-700"
                          onClick={() => setShowPublishedDropdown(false)}
                        >
                          <span className="font-semibold text-[#0B1C4D]">
                            Vol {issue.volume}, Issue {issue.issue_number}
                          </span>
                          <span className="ml-1 text-xs text-slate-500">
                            ({issue.publication_date || issue.publication_year})
                          </span>
                        </Link>
                        {issue.full_issue_pdf_url && (
                          <a
                            href={issue.full_issue_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                            onClick={() => setShowPublishedDropdown(false)}
                          >
                            <Download size={12} />
                            Download Full PDF
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-xl px-3 py-2 text-sm transition-all duration-300 ease-in-out ${
                  isActive(link.path)
                    ? 'bg-[#EAF3FF] font-semibold text-[#0B1C4D] shadow-[0_4px_12px_rgba(37,99,235,0.12)]'
                    : 'text-slate-600 hover:-translate-y-0.5 hover:bg-[#F3F8FF] hover:text-[#0B1C4D] hover:shadow-[0_6px_16px_rgba(37,99,235,0.10)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {isUserAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#F3F8FF] hover:text-[#0B1C4D] hover:shadow-[0_6px_16px_rgba(37,99,235,0.10)]"
                >
                  Dashboard
                </Link>

                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#F3F8FF] hover:text-[#0B1C4D] hover:shadow-[0_6px_16px_rgba(37,99,235,0.10)]"
                >
                  Logout
                </button>

                <div ref={profileMenuRef} className="relative">
                  <button
                    onClick={() => setShowProfileDropdown((prev) => !prev)}
                    className="flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#F8FBFF] hover:shadow-[0_10px_24px_rgba(37,99,235,0.16)]"
                    style={{ borderColor: '#C9DCF6' }}
                    type="button"
                  >
                    <div className="text-right leading-tight">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#1D4ED8]">
                        {displayRole}
                      </p>
                      <p className="max-w-[140px] truncate text-sm font-semibold text-[#0B1C4D]">
                        {displayName}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#60A5FA] text-xs font-bold text-white shadow-[0_6px_14px_rgba(37,99,235,0.28)]">
                      {initials}
                    </div>
                    <ChevronDown
                      size={15}
                      className={`text-slate-500 transition-transform duration-300 ease-in-out ${
                        showProfileDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showProfileDropdown && (
                    <div
                      className="saas-fade-menu absolute right-0 z-50 mt-2 w-[310px] rounded-2xl border bg-white p-3 shadow-[0_16px_36px_rgba(15,23,42,0.14)] transition-all duration-300 ease-in-out"
                      style={{ borderColor: '#D8E4F6' }}
                    >
                      <div className="rounded-xl border bg-[#F8FBFF] p-3" style={{ borderColor: '#D8E4F6' }}>
                        <p className="text-sm font-semibold text-[#0B1C4D]">{displayName}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{currentUser?.email}</p>
                        <p className="mt-2 text-xs font-medium text-[#1D4ED8]">Active Role: {displayRole}</p>
                      </div>

                      <div className="mt-3">
                        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Switch Role
                        </p>
                        <div className="space-y-1">
                          {approvedRoles.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleSwitch(role)}
                              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out ${
                                role === activeRole
                                  ? 'border border-[#93C5FD] bg-[#EAF3FF] font-semibold text-[#0B1C4D]'
                                  : 'text-slate-700 hover:bg-[#F3F8FF] hover:text-[#0B1C4D]'
                              }`}
                              type="button"
                            >
                              {getRoleLabel(role)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#F3F8FF] hover:text-[#0B1C4D] hover:shadow-[0_6px_16px_rgba(37,99,235,0.10)]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#F3F8FF] hover:text-[#0B1C4D] hover:shadow-[0_6px_16px_rgba(37,99,235,0.10)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-xl p-2 text-slate-600 transition-all duration-300 ease-in-out hover:bg-[#F3F8FF] lg:hidden"
            type="button"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="border-t bg-white shadow-[0_12px_26px_rgba(30,64,175,0.10)] lg:hidden"
          style={{ borderColor: '#D8E4F6' }}
        >
          <nav className="space-y-1 px-6 py-4">
            <Link
              to="/published"
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-xl px-3 py-2 text-sm transition-all duration-300 ease-in-out ${
                isPublishedActive
                  ? 'bg-[#EAF3FF] font-medium text-[#0B1C4D]'
                  : 'text-slate-600 hover:bg-[#F3F8FF]'
              }`}
            >
              Published
            </Link>
            {latestIssues.length > 0 && (
              <div className="ml-2 space-y-1 border-l pl-3" style={{ borderColor: '#D8E4F6' }}>
                {latestIssues.slice(0, 3).map((issue) => (
                  <div key={issue.id} className="rounded-lg px-2 py-1.5 hover:bg-[#F8FBFF]">
                    <Link
                      to={`/published/${issue.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs text-slate-600"
                    >
                      Vol {issue.volume}, Issue {issue.issue_number} ({issue.publication_date || issue.publication_year})
                    </Link>
                    {issue.full_issue_pdf_url && (
                      <a
                        href={issue.full_issue_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D4ED8] hover:underline"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Download size={11} />
                        Download PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-xl px-3 py-2 text-sm transition-all duration-300 ease-in-out ${
                  isActive(link.path)
                    ? 'bg-[#EAF3FF] font-medium text-[#0B1C4D]'
                    : 'text-slate-600 hover:bg-[#F3F8FF]'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isUserAuthenticated && (
              <div className="mt-4 space-y-2 rounded-xl border bg-[#F8FBFF] p-3" style={{ borderColor: '#D8E4F6' }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                  {displayRole}
                </p>
                <p className="text-sm font-semibold text-[#0B1C4D]">{displayName}</p>
                <p className="text-xs text-slate-600">{currentUser?.email}</p>

                <div className="pt-2">
                  {approvedRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out ${
                        role === activeRole
                          ? 'bg-[#EAF3FF] font-semibold text-[#0B1C4D]'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                      type="button"
                    >
                      {getRoleLabel(role)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: '#E2E8F0' }}>
              {isUserAuthenticated ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full rounded-xl border px-4 py-2 text-center text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:bg-[#F3F8FF]"
                    style={{ borderColor: '#D8E4F6' }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="block w-full rounded-xl border px-4 py-2 text-center text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:bg-[#F3F8FF]"
                    style={{ borderColor: '#D8E4F6' }}
                    type="button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full rounded-xl border px-4 py-2 text-center text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:bg-[#F3F8FF]"
                    style={{ borderColor: '#D8E4F6' }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full rounded-xl border px-4 py-2 text-center text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:bg-[#F3F8FF]"
                    style={{ borderColor: '#D8E4F6' }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
