import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, ChevronDown, Download, LayoutDashboard, LogOut, ExternalLink, Copy, CheckCircle, Fingerprint, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  logout,
  getCurrentUser,
  getPublishedIssues,
  updateMyProfile,
  getApprovedRolesFromUser,
  getRoleLabel,
  initializeActiveRole,
  setMyActiveRole,
  getStoredActiveRole,
  ACTIVE_ROLE_STORAGE_KEY,
  ACTIVE_ROLE_CHANGED_EVENT,
} from '../lib/queries-api';

/* ─────────────────────────────────────────────────────────────────────────────
   Injected once: premium glassmorphism + role-badge styles
───────────────────────────────────────────────────────────────────────────── */
const GLASS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

/* ── Fade-in animation ── */
@keyframes glassDropIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1);    }
}

/* ── Shimmer sweep on dashboard button ── */
@keyframes shimmerSweep {
  0%   { left: -120%; }
  100% { left:  120%; }
}

/* ── Panel wrapper ── */
.glass-panel-wrapper {
  position: absolute;
  right: 0;
  top: calc(100% + 14px);
  z-index: 60;
  width: 344px;
  border-radius: 18px;
  padding: 1.5px;
  background: linear-gradient(145deg, #d7e9ff 0%, #ecf5ff 50%, #d7e9ff 100%);
  box-shadow:
    0 24px 52px rgba(15, 23, 42, 0.22),
    0 8px 22px rgba(99, 102, 241, 0.14),
    0 2px 6px rgba(0, 0, 0, 0.07);
  animation: glassDropIn 0.22s cubic-bezier(0.34, 1.28, 0.64, 1) both;
  font-family: 'Montserrat', 'Inter', system-ui, sans-serif;
}

/* ── Inner frosted surface ── */
.glass-panel-inner {
  border-radius: 16.5px;
  background: rgba(245, 251, 255, 0.97);
  backdrop-filter: blur(22px) saturate(1.65);
  -webkit-backdrop-filter: blur(22px) saturate(1.65);
  border: 1px solid rgba(199, 224, 255, 0.95);
  padding: 24px 20px 20px;
  position: relative;
  overflow: hidden;
}

/* Ambient glow orb top-right */
.glass-panel-inner::before {
  content: '';
  position: absolute;
  top: -50px; right: -50px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(214, 234, 255, 0.42) 0%, transparent 68%);
  pointer-events: none;
}

/* Ambient glow orb bottom-left */
.glass-panel-inner::after {
  content: '';
  position: absolute;
  bottom: -40px; left: -30px;
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(186, 220, 255, 0.26) 0%, transparent 68%);
  pointer-events: none;
}

/* ── User name ── */
.glass-user-name {
  font-size: 30px;
  font-weight: 800;
  color: #1a2f80;
  letter-spacing: -0.6px;
  line-height: 1.08;
  margin-bottom: 5px;
}

/* ── User email ── */
.glass-user-email {
  font-size: 13.5px;
  font-weight: 500;
  color: #2563eb;
  letter-spacing: 0.01em;
}

/* ── Dividers ── */
.glass-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(180, 196, 220, 0.55) 28%,
    rgba(180, 196, 220, 0.55) 72%,
    transparent 100%
  );
  margin: 16px 0 14px;
}

/* ── "Roles" section title ── */
.glass-roles-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(90deg, #c89b3c 0%, #a07ae0 52%, #6860d4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  letter-spacing: -0.2px;
  line-height: 1;
}

/* ── Role badge base ── */
.glass-role-badge {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 13px 16px;
  border-radius: 13px;
  border: 1px solid transparent;
  cursor: pointer;
  background: none;
  text-align: left;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.22s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 9px;
  font-family: 'Montserrat', 'Inter', system-ui, sans-serif;
}

.glass-role-badge:last-child { margin-bottom: 0; }

/* Sheen overlay on hover */
.glass-role-badge::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0);
  transition: background 0.18s;
  border-radius: inherit;
}
.glass-role-badge:hover::after { background: rgba(255, 255, 255, 0.18); }

.glass-role-badge:hover { transform: scale(1.026) translateY(-1.5px); }
.glass-role-badge:active { transform: scale(0.975); }

/* ── Editor badge ── */
.glass-role-editor {
  background: linear-gradient(118deg, #c2fff3 0%, #b2ecff 100%);
  border-color: rgba(96, 216, 204, 0.62);
  box-shadow: 0 4px 14px rgba(16, 185, 155, 0.10);
}
.glass-role-editor:hover {
  box-shadow: 0 8px 22px rgba(20, 184, 166, 0.30);
}

/* ── Reviewer badge ── */
.glass-role-reviewer {
  background: linear-gradient(118deg, #fff7aa 0%, #ffd6aa 100%);
  border-color: rgba(240, 190, 90, 0.65);
  box-shadow: 0 4px 14px rgba(234, 140, 30, 0.10);
}
.glass-role-reviewer:hover {
  box-shadow: 0 8px 22px rgba(251, 146, 60, 0.30);
}

/* ── Author badge ── */
.glass-role-author {
  background: linear-gradient(118deg, #e8d5ff 0%, #c2d4ff 100%);
  border-color: rgba(146, 114, 236, 0.56);
  box-shadow: 0 4px 14px rgba(109, 40, 217, 0.10);
}
.glass-role-author:hover {
  box-shadow: 0 8px 22px rgba(109, 40, 217, 0.30);
}

/* ── Generic/admin badge ── */
.glass-role-default {
  background: linear-gradient(118deg, #e8f0ff 0%, #d8e8ff 100%);
  border-color: rgba(148, 175, 235, 0.55);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.08);
}
.glass-role-default:hover {
  box-shadow: 0 8px 22px rgba(59, 130, 246, 0.22);
}

/* ── Role dot ── */
.glass-role-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}
.glass-role-editor   .glass-role-dot { background: #0e6e64; }
.glass-role-reviewer .glass-role-dot { background: #a35500; }
.glass-role-author   .glass-role-dot { background: #5b21b6; }
.glass-role-default  .glass-role-dot { background: #1d4ed8; }

/* ── Role label text ── */
.glass-role-label {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1;
}
.glass-role-editor   .glass-role-label { color: #0b4f4a; }
.glass-role-reviewer .glass-role-label { color: #7a3500; }
.glass-role-author   .glass-role-label { color: #3b1a78; }
.glass-role-default  .glass-role-label { color: #1e3a8a; }

/* ── Role arrow ── */
.glass-role-arrow {
  margin-left: auto;
  font-size: 18px;
  line-height: 1;
  opacity: 0.45;
  transition: transform 0.18s, opacity 0.18s;
}
.glass-role-badge:hover .glass-role-arrow {
  transform: translateX(4px);
  opacity: 0.9;
}
.glass-role-editor   .glass-role-arrow { color: #0b4f4a; }
.glass-role-reviewer .glass-role-arrow { color: #7a3500; }
.glass-role-author   .glass-role-arrow { color: #3b1a78; }
.glass-role-default  .glass-role-arrow { color: #1e3a8a; }

/* ── Active role emphasis ── */
.glass-role-badge.is-active {
  box-shadow:
    0 0 0 2px rgba(37, 99, 235, 0.32),
    0 12px 26px rgba(59, 130, 246, 0.24);
  transform: translateY(-1px);
}

.glass-role-active-pill {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(147, 197, 253, 0.8);
  background: rgba(239, 246, 255, 0.92);
  color: #1e40af;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 3px 7px;
  text-transform: uppercase;
}

/* ── Dashboard button ── */
.glass-dashboard-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(112deg, #1e55e8 0%, #3f54dc 42%, #7c2fd2 100%);
  color: #fff;
  font-family: 'Montserrat', 'Inter', system-ui, sans-serif;
  font-size: 15.5px;
  font-weight: 700;
  letter-spacing: 0.025em;
  cursor: pointer;
  box-shadow:
    0 10px 28px rgba(59, 130, 246, 0.34),
    0 3px 9px rgba(79, 70, 229, 0.20);
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.22s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

/* Shimmer sweep */
.glass-dashboard-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -120%;
  width: 60%; height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.14),
    transparent
  );
  transform: skewX(-18deg);
}
.glass-dashboard-btn:hover::before {
  animation: shimmerSweep 0.55s ease forwards;
}

.glass-dashboard-btn:hover {
  transform: scale(1.025) translateY(-2px);
  box-shadow:
    0 18px 36px rgba(79, 70, 229, 0.42),
    0 6px 14px rgba(59, 130, 246, 0.26);
}
.glass-dashboard-btn:active { transform: scale(0.975); }

/* ── Logout button ── */
.glass-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid rgba(147, 197, 253, 0.65);
  background: rgba(255, 255, 255, 0.84);
  color: #1e3a8a;
  font-family: 'Montserrat', 'Inter', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.glass-logout-btn:hover {
  transform: translateY(-1px);
  background: rgba(239, 246, 255, 0.98);
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.2);
}

/* ── Trigger pill button (profile) ── */
.glass-trigger-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(199, 204, 213, 0.9);
  background: rgba(248, 251, 255, 0.97);
  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.11),
    0 2px 5px rgba(37, 99, 235, 0.06);
  cursor: pointer;
  font-family: 'Montserrat', 'Inter', system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #1d3a8f;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.glass-trigger-pill:hover {
  transform: translateY(-1.5px);
  box-shadow:
    0 12px 26px rgba(15, 23, 42, 0.15),
    0 3px 10px rgba(37, 99, 235, 0.10);
  background: rgba(238, 243, 255, 0.98);
}

/* ── Avatar circle ── */
.glass-avatar {
  width: 29px; height: 29px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f0fa 0%, #dce8f7 100%);
  border: 1px solid rgba(200, 218, 240, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(79, 70, 229, 0.14);
  flex-shrink: 0;
}
.glass-avatar-text {
  font-size: 11px;
  font-weight: 800;
  background: linear-gradient(135deg, #2563eb, #6d28d9);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  letter-spacing: 0.02em;
}

/* ── Dashboard icon grid ── */
.glass-dash-icon {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5px;
  width: 15px; height: 15px;
  flex-shrink: 0;
}
.glass-dash-icon span {
  display: block;
  background: rgba(255,255,255,0.90);
  border-radius: 2px;
}
`;

function injectGlassStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('glass-profile-styles')) return;
  const style = document.createElement('style');
  style.id = 'glass-profile-styles';
  style.textContent = GLASS_STYLES;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Role badge class helper
───────────────────────────────────────────────────────────────────────────── */
function getRoleBadgeClass(role: string): string {
  const map: Record<string, string> = {
    editor:   'glass-role-editor',
    reviewer: 'glass-role-reviewer',
    author:   'glass-role-author',
  };
  return map[role] ?? 'glass-role-default';
}

function normalizeOrcid(orcid?: string | null): string {
  if (!orcid) return '';
  const cleaned = orcid.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (cleaned.length !== 16) return orcid;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
}

function isValidOrcid(orcid?: string | null): boolean {
  if (!orcid) return false;
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(orcid);
}

function isValidGoogleScholarUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol.startsWith('http') && host.includes('scholar.google.') && parsed.pathname.includes('/citations');
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Header component
───────────────────────────────────────────────────────────────────────────── */
export function Header() {
  const location  = useLocation();
  const navigate  = useNavigate();

  const [mobileMenuOpen,        setMobileMenuOpen]        = useState(false);
  const [showProfileDropdown,   setShowProfileDropdown]   = useState(false);
  const [activeRole,            setActiveRoleState]       = useState<string | null>(getStoredActiveRole());

  const profileMenuRef   = useRef<HTMLDivElement | null>(null);

  // Inject CSS once
  useEffect(() => { injectGlassStyles(); }, []);

  const { data: currentUser, isLoading: isUserLoading, refetch: refetchCurrentUser } = useQuery({
    queryKey: ['me'],
    queryFn:  getCurrentUser,
    retry:    false,
  });
  const { data: publishedIssues = [] } = useQuery({
    queryKey: ['published-issues'],
    queryFn:  getPublishedIssues,
  });

  const isUserAuthenticated = !!currentUser;
  const approvedRoles       = useMemo(() => getApprovedRolesFromUser(currentUser || null), [currentUser]);
  const dashboardPath       = activeRole === 'editor' ? '/editor' : '/dashboard';

  const displayName = currentUser?.full_name || 'User';
  const displayRole = activeRole ? getRoleLabel(activeRole) : 'No Active Role';
  const orcidId = normalizeOrcid(currentUser?.orcid_id);
  const hasValidOrcid = isValidOrcid(orcidId);
  const [scholarUrlInput, setScholarUrlInput] = useState('');
  const [isSavingScholar, setIsSavingScholar] = useState(false);
  const [scholarFeedback, setScholarFeedback] = useState<string | null>(null);
  const hasValidScholar = isValidGoogleScholarUrl(scholarUrlInput.trim());

  const [isVerifyingOrcid, setIsVerifyingOrcid] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    setScholarUrlInput(currentUser?.google_scholar_url || '');
  }, [currentUser?.google_scholar_url]);

  const initials = useMemo(() => {
    const parts = (displayName || 'User').split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [displayName]);

  // Initialize active role
  useEffect(() => {
    if (!currentUser) { setActiveRoleState(null); return; }
    let isMounted = true;
    initializeActiveRole(currentUser).then((role) => {
      if (isMounted) setActiveRoleState(role);
    });
    return () => { isMounted = false; };
  }, [currentUser]);

  // Listen for role changes across tabs
  useEffect(() => {
    const handleRoleChanged = (event: Event) => {
      const e = event as CustomEvent<{ role?: string | null }>;
      setActiveRoleState(e.detail?.role ?? getStoredActiveRole());
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ACTIVE_ROLE_STORAGE_KEY) setActiveRoleState(e.newValue);
    };
    window.addEventListener(ACTIVE_ROLE_CHANGED_EVENT, handleRoleChanged as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(ACTIVE_ROLE_CHANGED_EVENT, handleRoleChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowProfileDropdown(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleRoleSwitch = async (role: string) => {
    if (!currentUser || !approvedRoles.includes(role)) return;
    const switched = await setMyActiveRole(role, currentUser);
    if (switched) {
      setActiveRoleState(role);
      setShowProfileDropdown(false);
      setMobileMenuOpen(false);
      navigate(role === 'editor' ? '/editor' : '/dashboard');
    }
  };

  const navLinks = [
    { name: 'Home',           path: '/'               },
    { name: 'Aims & Scope',   path: '/aims-scope'     },
    { name: 'Guidelines',     path: '/guidelines'     },
    { name: 'Editorial Board',path: '/editorial-board'},
    { name: 'Policies',       path: '/policies'       },
    { name: 'About',          path: '/about'          },
    { name: 'Contact',        path: '/contact'        },
  ];

  const isActive          = (path: string) => location.pathname === path;
  const isPublishedActive = location.pathname.startsWith('/published');
  const latestIssues      = publishedIssues.slice(0, 6);

  const orderedRoles = useMemo(
    () =>
      ['editor', 'reviewer', 'author', 'admin']
        .filter((r) => approvedRoles.includes(r))
        .concat(approvedRoles.filter((r) => !['editor', 'reviewer', 'author', 'admin'].includes(r))),
    [approvedRoles]
  );

  const handleCopyOrcid = async () => {
    if (!orcidId) return;
    try {
      await navigator.clipboard.writeText(orcidId);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      setCopyState('idle');
    }
  };

  const handleVerifyOrcid = async () => {
    setIsVerifyingOrcid(true);
    try {
      await refetchCurrentUser();
    } finally {
      setIsVerifyingOrcid(false);
    }
  };

  const handleSaveScholar = async () => {
    const trimmed = scholarUrlInput.trim();
    if (trimmed && !isValidGoogleScholarUrl(trimmed)) {
      setScholarFeedback('Please provide a valid Google Scholar citations URL.');
      return;
    }

    setIsSavingScholar(true);
    setScholarFeedback(null);
    try {
      const { error } = await updateMyProfile({ google_scholar_url: trimmed });
      if (error) {
        setScholarFeedback(error?.google_scholar_url?.[0] || error?.detail || 'Failed to save Google Scholar URL.');
        return;
      }
      setScholarFeedback('Google Scholar URL updated.');
      await refetchCurrentUser();
    } finally {
      setIsSavingScholar(false);
    }
  };

  const AcademicIdentityCard = () => (
    <section className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Academic Identifiers</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A6CE39] text-sm font-bold text-white shadow-sm">
            iD
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">ORCID iD</p>
            <p className="text-xs text-slate-500">Connecting Research and Researchers</p>
          </div>
        </div>

        {isUserLoading ? (
          <div className="mt-3 space-y-2.5 animate-pulse">
            <div className="h-11 rounded-lg border border-slate-200 bg-slate-100" />
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="h-9 rounded-lg bg-slate-100" />
              <div className="h-9 rounded-lg bg-slate-100" />
              <div className="h-9 rounded-lg bg-slate-100" />
            </div>
          </div>
        ) : hasValidOrcid ? (
          <>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className="text-lg font-bold tracking-wide text-slate-800"
                  style={{ fontFamily: 'JetBrains Mono, Roboto Mono, ui-monospace, SFMono-Regular, Menlo, monospace' }}
                >
                  {orcidId}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle size={12} />
                  Verified
                </span>
              </div>
            </div>

            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleVerifyOrcid}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#A6CE39] px-2.5 text-xs font-semibold text-[#5D7F14] transition-colors hover:bg-[#F4FAD9]"
              >
                {isVerifyingOrcid ? 'Verifying...' : 'Verify'}
              </button>

              <button
                type="button"
                onClick={handleCopyOrcid}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Copy size={13} />
                {copyState === 'copied' ? 'Copied' : 'Copy'}
              </button>

              <a
                href={`https://orcid.org/${orcidId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ExternalLink size={13} />
                View Profile
              </a>
            </div>
          </>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Fingerprint size={14} className="text-[#5D7F14]" />
              Academic ID not linked
            </div>
            <a
              href="https://orcid.org/register"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-[#A6CE39] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#96BD2D]"
            >
              + Connect your ORCID iD
            </a>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-[#CFE0FF] bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Google Scholar</p>
            <p className="text-xs text-slate-500">Add your citation profile to showcase impact</p>
          </div>
          <a
            href={hasValidScholar ? scholarUrlInput.trim() : 'https://scholar.google.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CBDDFE] text-[#4285F4] transition-colors hover:bg-[#EEF4FF]"
            aria-label="Open Scholar URL"
          >
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="mt-2.5">
          <input
            value={scholarUrlInput}
            onChange={(event) => {
              setScholarUrlInput(event.target.value);
              if (scholarFeedback) setScholarFeedback(null);
            }}
            placeholder="https://scholar.google.com/citations?user=XYZ"
            className="w-full rounded-lg border border-[#CFE0FF] bg-[#F8FBFF] px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-[#93C5FD] focus:bg-white"
          />
        </div>

        {hasValidScholar ? (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#9FC0FF] bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#4285F4]">
            <GraduationCap size={12} />
            Preview
          </div>
        ) : !scholarUrlInput.trim() ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#CBDDFE] bg-[#F8FBFF] px-3 py-2.5 text-xs text-slate-600">
            Connect your Google Scholar to showcase your research impact.
          </div>
        ) : (
          <p className="mt-2 text-xs font-medium text-amber-700">
            Please enter a valid Google Scholar citations URL.
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleSaveScholar}
            disabled={isSavingScholar || (!!scholarUrlInput.trim() && !hasValidScholar)}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4285F4] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#2f74e6] disabled:cursor-not-allowed disabled:bg-[#9FC0FF]"
          >
            {isSavingScholar ? 'Saving...' : 'Save Scholar URL'}
          </button>
          {hasValidScholar && (
            <a
              href={scholarUrlInput.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#CBDDFE] px-2.5 text-xs font-semibold text-[#4285F4] hover:bg-[#EEF4FF]"
            >
              <ExternalLink size={12} />
              Test URL
            </a>
          )}
        </div>

        {scholarFeedback && (
          <p className={`mt-2 text-xs font-medium ${scholarFeedback.includes('updated') ? 'text-emerald-700' : 'text-rose-700'}`}>
            {scholarFeedback}
          </p>
        )}
      </div>
    </section>
  );

  /* ── Glassmorphism profile panel ── */
  const ProfilePanel = () => (
    <div className="glass-panel-wrapper">
      <div className="glass-panel-inner">

        {/* ── User info ── */}
        <p className="glass-user-name">{displayName}</p>
        <p className="glass-user-email">{currentUser?.email}</p>
        <p className="mt-2 text-xs font-semibold tracking-wide text-[#1E3A8A]">
          Current Role: {displayRole}
        </p>

        {isUserAuthenticated && (
          <>
            <div className="glass-divider" />
            <AcademicIdentityCard />
            <div className="glass-divider" />
          </>
        )}

        {/* ── Roles ── */}
        <p className="glass-roles-title">Roles</p>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {orderedRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSwitch(role)}
              className={`glass-role-badge ${getRoleBadgeClass(role)} ${activeRole === role ? 'is-active' : ''}`}
            >
              <span className="glass-role-dot" />
              <span className="glass-role-label">{getRoleLabel(role)}</span>
              {activeRole === role ? (
                <span className="glass-role-active-pill">Active</span>
              ) : (
                <span className="glass-role-arrow">›</span>
              )}
            </button>
          ))}
        </div>

        <div className="glass-divider" />

        {/* ── Dashboard button ── */}
        <Link
          to={dashboardPath}
          className="glass-dashboard-btn"
          onClick={() => setShowProfileDropdown(false)}
        >
          {/* 2×2 grid icon */}
          <span className="glass-dash-icon" aria-hidden="true">
            <span /><span /><span /><span />
          </span>
          Dashboard
        </Link>

        <button
          type="button"
          className="glass-logout-btn"
          onClick={async () => {
            await logout();
            setShowProfileDropdown(false);
            window.location.href = '/';
          }}
        >
          <LogOut size={15} />
          Logout
        </button>

      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <header
      className="relative border-b bg-white/80 backdrop-blur-xl"
      style={{
        borderColor: '#C9D7F0',
        boxShadow:   '0 10px 30px rgba(15, 23, 42, 0.09)',
        fontFamily:  'Montserrat, Inter, Segoe UI, sans-serif',
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex min-w-[140px] shrink-0 items-center transition-all duration-300 ease-in-out hover:opacity-85"
          >
            <span
              className="whitespace-nowrap text-xl font-bold text-[#0F1F5A]"
              style={{ fontFamily: 'Montserrat, Inter, Segoe UI, sans-serif' }}
            >
              Ditech Asia
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">

            <Link
              to="/published"
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm transition-all duration-300 ease-in-out ${
                isPublishedActive
                  ? 'border-[#93C5FD] bg-[#DBEAFE] font-semibold text-[#0F1F5A] shadow-[0_8px_18px_rgba(29,78,216,0.15)]'
                  : 'border-[#BFDBFE] bg-[#EAF3FF] text-[#1E3A8A] hover:-translate-y-0.5 hover:border-[#93C5FD] hover:bg-[#DBEAFE] hover:shadow-[0_10px_22px_rgba(29,78,216,0.13)]'
              }`}
            >
              Published
              {publishedIssues.length > 0 && (
                <span className="rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_3px_8px_rgba(37,99,235,0.35)]">
                  {publishedIssues.length}
                </span>
              )}
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-xl px-3 py-2 text-sm transition-all duration-300 ease-in-out ${
                  isActive(link.path)
                    ? 'bg-[#E9F0FF] font-semibold text-[#0F1F5A] shadow-[0_4px_14px_rgba(29,78,216,0.15)]'
                    : 'text-slate-600 hover:-translate-y-0.5 hover:bg-[#EEF3FF] hover:text-[#0F1F5A] hover:shadow-[0_8px_18px_rgba(29,78,216,0.11)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ── Desktop right: auth area ── */}
          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            {isUserAuthenticated ? (

              /* ── Profile dropdown trigger + panel ── */
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  aria-label="Open profile menu"
                  onClick={() => setShowProfileDropdown((p) => !p)}
                  className="glass-trigger-pill"
                >
                  <span className="glass-avatar">
                    <span className="glass-avatar-text">{initials}</span>
                  </span>
                  <span>Profile</span>
                </button>

                {showProfileDropdown && <ProfilePanel />}
              </div>

            ) : (
              /* ── Guest buttons ── */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center gap-2.5 rounded-full border border-[#C8D8F1] bg-white px-3.5 text-sm font-semibold text-[#0F1F5A] shadow-[0_8px_18px_rgba(15,23,42,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#EEF3FF]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#BFD0F3] bg-[#F4F7FF]">
                    <span className="text-[12px] font-semibold text-[#1D3A8F]">{initials}</span>
                  </span>
                  <span>Profile</span>
                </Link>
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

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="rounded-xl p-2 text-slate-600 transition-all duration-300 ease-in-out hover:bg-[#F3F8FF] lg:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Mobile menu
      ══════════════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className="border-t bg-white shadow-[0_12px_26px_rgba(30,64,175,0.10)] lg:hidden"
          style={{ borderColor: '#D8E4F6' }}
        >
          <nav className="space-y-1 px-6 py-4">

            {/* Published link */}
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
                      {issue.title || `Issue ${issue.issue_number}`}
                    </Link>
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

            {/* Mobile auth section */}
            {isUserAuthenticated && (
              <div
                className="mt-4 space-y-2 rounded-xl border bg-[#F8FBFF] p-3"
                style={{ borderColor: '#D8E4F6' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                  {displayRole}
                </p>
                <p className="text-sm font-semibold text-[#0B1C4D]">{displayName}</p>
                <p className="text-xs text-slate-600">{currentUser?.email}</p>

                {activeRole === 'author' && <AcademicIdentityCard />}

                <div className="pt-2">
                  {orderedRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSwitch(role)}
                      className={`mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out ${
                        role === activeRole
                          ? 'bg-[#EAF3FF] font-semibold text-[#0B1C4D]'
                          : 'text-slate-700 hover:bg-white'
                      }`}
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
                    type="button"
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="block w-full rounded-xl border px-4 py-2 text-center text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:bg-[#F3F8FF]"
                    style={{ borderColor: '#D8E4F6' }}
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