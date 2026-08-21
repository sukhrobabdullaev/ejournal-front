import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, ChevronDown, Download, LayoutDashboard, LogOut, ExternalLink, Copy, CheckCircle, Fingerprint, GraduationCap, LogIn, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  logout,
  getCurrentUser,
  getPublishedIssues,
  getMySubmissions,
  updateMyProfile,
  getApprovedRolesFromUser,
  getRoleLabel,
  initializeActiveRole,
  setMyActiveRole,
  getStoredActiveRole,
  activeRoleStorageKey,
  ACTIVE_ROLE_CHANGED_EVENT,
} from '../lib/queries-api';
import { useJournal } from '../contexts/JournalContext';

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

/* ── Scholar saved badge animation ── */
@keyframes savedBadgePop {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Shimmer sweep on dashboard button ── */
@keyframes shimmerSweep {
  0%   { left: -120%; }
  100% { left:  120%; }
}

/* ── Backdrop shown behind the open profile panel ── */
.glass-panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  animation: glassBackdropIn 0.18s ease both;
}

@keyframes glassBackdropIn {
  from { opacity: 0; }
  to   { opacity: 1; }
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
  padding: 28px 22px 22px;
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

/* ── Guest auth actions ── */
.glass-auth-group {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.glass-auth-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 15px;
  border-radius: 999px;
  border: 1px solid rgba(191, 208, 243, 0.95);
  background: rgba(248, 251, 255, 0.98);
  color: #1d3a8f;
  font-family: 'Montserrat', 'Inter', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-decoration: none;
  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.10),
    0 2px 6px rgba(37, 99, 235, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.glass-auth-btn:hover {
  transform: translateY(-1.5px);
  border-color: rgba(147, 197, 253, 0.95);
  background: rgba(238, 243, 255, 0.98);
  box-shadow:
    0 12px 26px rgba(15, 23, 42, 0.14),
    0 4px 10px rgba(37, 99, 235, 0.12);
}

.glass-auth-btn-primary {
  border-color: rgba(129, 180, 255, 0.95);
  background: linear-gradient(112deg, #1e55e8 0%, #3f54dc 45%, #5a67ea 100%);
  color: #ffffff;
  box-shadow:
    0 12px 28px rgba(59, 130, 246, 0.30),
    0 3px 9px rgba(79, 70, 229, 0.22);
}

.glass-auth-btn-primary:hover {
  border-color: rgba(147, 197, 253, 1);
  background: linear-gradient(112deg, #1d4ed8 0%, #3749c8 45%, #4f5be0 100%);
  box-shadow:
    0 16px 34px rgba(59, 130, 246, 0.36),
    0 5px 12px rgba(79, 70, 229, 0.24);
}

.glass-auth-icon-wrap {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(191, 208, 243, 0.92);
  background: rgba(240, 245, 255, 0.98);
  color: #1d4ed8;
  flex-shrink: 0;
}

.glass-auth-btn-primary .glass-auth-icon-wrap {
  border-color: rgba(147, 197, 253, 0.95);
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.glass-auth-mobile {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.glass-auth-mobile .glass-auth-btn {
  width: 100%;
  justify-content: center;
  height: 44px;
}

.glass-saved-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid #86efac;
  background: #dcfce7;
  color: #166534;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  animation: savedBadgePop 0.2s ease-out;
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
  const cleaned = orcid.replace(/[^0-9]/g, '');
  if (cleaned.length !== 16) return orcid;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
}

function isValidOrcid(orcid?: string | null): boolean {
  if (!orcid) return false;
  return /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(orcid);
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
  const { journal, journalSlug } = useJournal();

  const withJournal = (path: string) => (journalSlug ? `/j/${journalSlug}${path}` : '/');

  const [mobileMenuOpen,        setMobileMenuOpen]        = useState(false);
  const [showProfileDropdown,   setShowProfileDropdown]   = useState(false);
  const [activeRole,            setActiveRoleState]       = useState<string | null>(
    journalSlug ? getStoredActiveRole(journalSlug) : null
  );

  const profileMenuRef   = useRef<HTMLDivElement | null>(null);
  const orcidSavedBadgeTimerRef = useRef<number | null>(null);

  // Inject CSS once
  useEffect(() => { injectGlassStyles(); }, []);

  const { data: currentUser, isLoading: isUserLoading, refetch: refetchCurrentUser } = useQuery({
    queryKey: ['me'],
    queryFn:  getCurrentUser,
    retry:    false,
  });
  const { data: publishedIssues = [] } = useQuery({
    queryKey: ['published-issues', journalSlug],
    queryFn:  getPublishedIssues,
    enabled:  !!journalSlug,
  });

  const isUserAuthenticated = !!currentUser;
  const approvedRoles       = useMemo(
    () => getApprovedRolesFromUser(currentUser || null, journalSlug),
    [currentUser, journalSlug]
  );
  const dashboardPath       = withJournal(activeRole === 'editor' ? '/editor' : '/dashboard');
  const journalMemberships  = useMemo(
    () => (currentUser?.memberships || []).filter((m) => m.journal_slug === journalSlug),
    [currentUser, journalSlug]
  );
  const isAuthorUser        = journalMemberships.some((m) => m.role === 'author');
  const isReviewerUser      = journalMemberships.some((m) => m.role === 'reviewer');
  const showAcademicCard    = isAuthorUser || isReviewerUser;
  const requiresAcademicIds = isAuthorUser;

  const { data: mySubmissions = [] } = useQuery({
    queryKey: ['my-submissions', 'profile-menu'],
    queryFn: getMySubmissions,
    enabled: isUserAuthenticated && isAuthorUser,
  });

  const displayName = currentUser?.full_name || 'User';
  const displayRole = activeRole ? getRoleLabel(activeRole) : 'No Active Role';
  const savedOrcidId = normalizeOrcid(currentUser?.orcid_id);
  const hasValidOrcid = isValidOrcid(savedOrcidId);
  const [orcidInput, setOrcidInput] = useState('');
  const [isSavingOrcid, setIsSavingOrcid] = useState(false);
  const [orcidFeedback, setOrcidFeedback] = useState<string | null>(null);
  const [showOrcidSavedBadge, setShowOrcidSavedBadge] = useState(false);
  const [scholarUrlInput, setScholarUrlInput] = useState('');
  const [isSavingScholar, setIsSavingScholar] = useState(false);
  const [scholarFeedback, setScholarFeedback] = useState<string | null>(null);
  const [showScholarSavedBadge, setShowScholarSavedBadge] = useState(false);
  const savedScholarUrl = (currentUser?.google_scholar_url || '').trim();
  const scholarUrlTrimmed = scholarUrlInput.trim();
  const hasValidScholar = isValidGoogleScholarUrl(scholarUrlTrimmed);
  const hasSavedValidScholar = isValidGoogleScholarUrl(savedScholarUrl);
  const hasScholarChanges = scholarUrlTrimmed !== savedScholarUrl;
  const isSaveScholarDisabled =
    isSavingScholar ||
    !hasScholarChanges ||
    (!!scholarUrlTrimmed && !hasValidScholar);
  const hasMissingRequiredAcademicId = requiresAcademicIds && !hasValidOrcid;
  const publishedAuthorSubmissions = mySubmissions.filter((submission) => submission.status === 'published');
  const publishedWithDoiCount = publishedAuthorSubmissions.filter((submission) => Boolean(submission.doi)).length;
  const hasHealthyDoiCoverage =
    !isAuthorUser ||
    publishedAuthorSubmissions.length === 0 ||
    publishedWithDoiCount === publishedAuthorSubmissions.length;

  const [isVerifyingOrcid, setIsVerifyingOrcid] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [showAcademicDetails, setShowAcademicDetails] = useState(false);

  useEffect(() => {
    setOrcidInput(normalizeOrcid(currentUser?.orcid_id) || '');
  }, [currentUser?.orcid_id]);

  useEffect(() => {
    setScholarUrlInput(currentUser?.google_scholar_url || '');
  }, [currentUser?.google_scholar_url]);

  useEffect(() => {
    if (showProfileDropdown) {
      setShowAcademicDetails(false);
    }
  }, [showProfileDropdown]);

  useEffect(() => {
    return () => {
      if (orcidSavedBadgeTimerRef.current) {
        window.clearTimeout(orcidSavedBadgeTimerRef.current);
      }
    };
  }, []);

  const initials = useMemo(() => {
    const parts = (displayName || 'User').split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [displayName]);

  // Initialize active role
  useEffect(() => {
    if (!currentUser || !journalSlug) { setActiveRoleState(null); return; }
    let isMounted = true;
    initializeActiveRole(journalSlug, currentUser).then((role) => {
      if (isMounted) setActiveRoleState(role);
    });
    return () => { isMounted = false; };
  }, [currentUser, journalSlug]);

  // Listen for role changes across tabs
  useEffect(() => {
    if (!journalSlug) return;
    const handleRoleChanged = (event: Event) => {
      const e = event as CustomEvent<{ journalSlug?: string; role?: string | null }>;
      if (e.detail?.journalSlug && e.detail.journalSlug !== journalSlug) return;
      setActiveRoleState(e.detail?.role ?? getStoredActiveRole(journalSlug));
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === activeRoleStorageKey(journalSlug)) setActiveRoleState(e.newValue);
    };
    window.addEventListener(ACTIVE_ROLE_CHANGED_EVENT, handleRoleChanged as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(ACTIVE_ROLE_CHANGED_EVENT, handleRoleChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [journalSlug]);

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
    if (!currentUser || !journalSlug || !approvedRoles.includes(role)) return;
    const switched = await setMyActiveRole(journalSlug, role, currentUser);
    if (switched) {
      setActiveRoleState(role);
      setShowProfileDropdown(false);
      setMobileMenuOpen(false);
      navigate(withJournal(role === 'editor' ? '/editor' : '/dashboard'));
    }
  };

  const navLinks = [
    { name: 'Home',           path: withJournal('')                },
    { name: 'Aims & Scope',   path: withJournal('/aims-scope')     },
    { name: 'Guidelines',     path: withJournal('/guidelines')     },
    { name: 'Editorial Board',path: withJournal('/editorial-board')},
    { name: 'Policies',       path: withJournal('/policies')       },
    { name: 'About',          path: withJournal('/about')          },
    { name: 'Contact',        path: withJournal('/contact')        },
  ];

  const isActive          = (path: string) => location.pathname === path;
  const isPublishedActive = location.pathname.startsWith(withJournal('/published'));
  const latestIssues      = publishedIssues.slice(0, 6);

  const orderedRoles = useMemo(
    () =>
      ['editor', 'reviewer', 'author', 'admin']
        .filter((r) => approvedRoles.includes(r))
        .concat(approvedRoles.filter((r) => !['editor', 'reviewer', 'author', 'admin'].includes(r))),
    [approvedRoles]
  );

  const handleCopyOrcid = async () => {
    if (!savedOrcidId) return;
    try {
      await navigator.clipboard.writeText(savedOrcidId);
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

  const handleSaveOrcid = async () => {
    const trimmed = orcidInput.trim();
    const normalized = normalizeOrcid(trimmed);
    if (trimmed && !isValidOrcid(normalized)) {
      setShowOrcidSavedBadge(false);
      setOrcidFeedback('Please provide ORCID in 0000-0000-0000-0000 format.');
      return;
    }

    setIsSavingOrcid(true);
    setShowOrcidSavedBadge(false);
    setOrcidFeedback(null);
    try {
      const { error } = await updateMyProfile({ orcid_id: normalized });
      if (error) {
        setShowOrcidSavedBadge(false);
        setOrcidFeedback(error?.orcid_id?.[0] || error?.detail || 'Failed to save ORCID iD.');
        return;
      }
      setOrcidFeedback('ORCID iD updated.');
      setShowOrcidSavedBadge(true);
      if (orcidSavedBadgeTimerRef.current) {
        window.clearTimeout(orcidSavedBadgeTimerRef.current);
      }
      orcidSavedBadgeTimerRef.current = window.setTimeout(() => {
        setShowOrcidSavedBadge(false);
        orcidSavedBadgeTimerRef.current = null;
      }, 1800);
      await refetchCurrentUser();
    } finally {
      setIsSavingOrcid(false);
    }
  };

  const handleClearOrcidInput = () => {
    setOrcidInput('');
    setShowOrcidSavedBadge(false);
    setOrcidFeedback(null);
  };

  const handleSaveScholar = async () => {
    const trimmed = scholarUrlTrimmed;
    if (trimmed && !isValidGoogleScholarUrl(trimmed)) {
      setShowScholarSavedBadge(false);
      setScholarFeedback('Please provide a valid Google Scholar citations URL.');
      return;
    }

    setIsSavingScholar(true);
    setShowScholarSavedBadge(false);
    setScholarFeedback(null);
    try {
      const { error } = await updateMyProfile({ google_scholar_url: trimmed });
      if (error) {
        setShowScholarSavedBadge(false);
        setScholarFeedback(error?.google_scholar_url?.[0] || error?.detail || 'Failed to save Google Scholar URL.');
        return;
      }
      setScholarFeedback('Google Scholar URL updated.');
      setShowScholarSavedBadge(true);
      window.setTimeout(() => setShowScholarSavedBadge(false), 1800);
      await refetchCurrentUser();
    } finally {
      setIsSavingScholar(false);
    }
  };

  const handleClearScholarInput = () => {
    setScholarUrlInput('');
    setShowScholarSavedBadge(false);
    setScholarFeedback(null);
  };

  const SettingsCard = () => {
    const doiStatusText = !isAuthorUser
      ? 'Optional'
      : publishedAuthorSubmissions.length === 0
        ? 'No published yet'
        : `${publishedWithDoiCount}/${publishedAuthorSubmissions.length} linked`;
    const orcidDraft = orcidInput.trim();
    const normalizedOrcidDraft = normalizeOrcid(orcidDraft);
    const isValidOrcidDraft = isValidOrcid(normalizedOrcidDraft);
    const hasOrcidChanges = normalizedOrcidDraft !== savedOrcidId;
    const isSaveOrcidDisabled =
      isSavingOrcid ||
      !hasOrcidChanges ||
      (!!orcidDraft && !isValidOrcidDraft);

    return (
      <section className="mt-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-[#F8FBFF] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 pr-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Settings</p>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">Academic identity</p>
          </div>
          <span
            className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:ml-auto ${
              requiresAcademicIds
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {requiresAcademicIds ? 'Author: required' : 'Reviewer: optional'}
          </span>
        </div>

        {hasMissingRequiredAcademicId && (
          <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-[11px] font-medium leading-4 text-rose-700">
            ORCID is required for authors. Save it here to continue.
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[230px] text-[11px] leading-5 text-slate-500">
            {requiresAcademicIds ? 'ORCID, Scholar, and DOI in one place.' : 'Optional for reviewers.'}
          </p>
          <button
            type="button"
            onClick={() => setShowAcademicDetails((prev) => !prev)}
            className="inline-flex self-start mt-1 sm:mt-0 h-7 items-center rounded-full border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            {showAcademicDetails ? 'Collapse' : 'Open'}
          </button>
        </div>

        {showAcademicDetails && (
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.02em] text-slate-900">ORCID iD</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">Enter in the format 0000-0000-0000-0000.</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    hasValidOrcid
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {hasValidOrcid ? <CheckCircle size={12} /> : <Fingerprint size={12} />}
                  {hasValidOrcid ? 'Linked' : 'Missing'}
                </span>
              </div>
              <div className="mt-3 grid gap-3">
                <input
                  value={orcidInput}
                  onChange={(event) => {
                    setOrcidInput(event.target.value);
                    setShowOrcidSavedBadge(false);
                    if (orcidFeedback) setOrcidFeedback(null);
                  }}
                  placeholder="0000-0000-0000-0000"
                  className="h-9 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#93C5FD] focus:bg-white"
                />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleSaveOrcid}
                    disabled={isSaveOrcidDisabled}
                    className="inline-flex h-9 w-full items-center justify-center rounded-xl px-3 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ backgroundColor: isSaveOrcidDisabled ? '#9FC0FF' : '#4285F4' }}
                  >
                    {isSavingOrcid ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearOrcidInput}
                    disabled={isSavingOrcid || orcidInput.length === 0}
                    className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear
                  </button>
                  <a
                    href="https://orcid.org/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    Connect ORCID
                  </a>
                </div>
              </div>
              {showOrcidSavedBadge && (
                <div className="mt-2">
                  <span className="glass-saved-badge">
                    <CheckCircle size={12} />
                    Saved
                  </span>
                </div>
              )}
              {orcidFeedback && (
                <p
                  className={`mt-2 text-[11px] font-medium ${
                    orcidFeedback.includes('updated') ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {orcidFeedback}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.02em] text-slate-900">Google Scholar</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">Save your Citations profile URL.</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    hasSavedValidScholar
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  <GraduationCap size={12} />
                  {hasSavedValidScholar ? 'Saved' : 'Missing'}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                <input
                  value={scholarUrlInput}
                  onChange={(event) => {
                    setScholarUrlInput(event.target.value);
                    setShowScholarSavedBadge(false);
                    if (scholarFeedback) setScholarFeedback(null);
                  }}
                  placeholder="https://scholar.google.com/citations?user=XYZ"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#93C5FD] focus:bg-white"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href="https://scholar.google.com/citations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-full items-center justify-center rounded-full border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
                  >
                    Open Scholar
                  </a>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleSaveScholar}
                      disabled={isSaveScholarDisabled}
                      className="inline-flex h-9 w-full items-center justify-center rounded-xl px-3 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      style={{ backgroundColor: isSaveScholarDisabled ? '#9FC0FF' : '#1D4ED8' }}
                    >
                      {isSavingScholar ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearScholarInput}
                      disabled={isSavingScholar || scholarUrlInput.length === 0}
                      className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {!scholarUrlTrimmed ? (
                    <p className="text-[11px] leading-5 text-slate-500">Enter your Scholar URL.</p>
                  ) : hasValidScholar ? (
                    <p className="text-[11px] font-medium text-emerald-700">Scholar format is valid.</p>
                  ) : (
                    <p className="text-[11px] font-medium text-amber-700">Enter a valid Scholar citations URL.</p>
                  )}
                </div>
                {showScholarSavedBadge && (
                  <div>
                    <span className="glass-saved-badge">
                      <CheckCircle size={12} />
                      Saved
                    </span>
                  </div>
                )}
                {scholarFeedback && (
                  <p
                    className={`text-[11px] font-medium ${
                      scholarFeedback.includes('updated') ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {scholarFeedback}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#FCFDFF] px-4 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.02em] text-slate-900">DOI</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">Automatically assigned to published articles.</p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    hasHealthyDoiCoverage
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {doiStatusText}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                DOI is managed through the editor workflow. Only the status is shown here.
              </p>
            </div>
          </div>
        )}
      </section>
    );
  };

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

        {isUserAuthenticated && showAcademicCard && (
          <>
            <div className="glass-divider" />
            {SettingsCard()}
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
            window.location.href = withJournal('');
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
            to={withJournal('')}
            className="flex min-w-[140px] shrink-0 items-center gap-2 transition-all duration-300 ease-in-out hover:opacity-85"
          >
            {journal?.logo ? (
              <img src={journal.logo} alt={journal.name} className="h-9 w-9 rounded object-cover" />
            ) : null}
            <span
              className="whitespace-nowrap text-xl font-bold text-[#0F1F5A]"
              style={{ fontFamily: 'Montserrat, Inter, Segoe UI, sans-serif' }}
            >
              {journal?.name || 'Journal Platform'}
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">

            <Link
              to={withJournal('/published')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm transition-all duration-300 ease-in-out ${
                isPublishedActive
                  ? 'border-[#93C5FD] bg-[#DBEAFE] font-semibold text-[#0F1F5A] shadow-[0_8px_18px_rgba(29,78,216,0.15)]'
                  : 'border-[#BFDBFE] bg-[#EAF3FF] text-[#1E3A8A] hover:-translate-y-0.5 hover:border-[#93C5FD] hover:bg-[#DBEAFE] hover:shadow-[0_10px_22px_rgba(29,78,216,0.13)]'
              }`}
            >
              Published
              {publishedIssues.length > 0 && (
                <span className="rounded-full bg-gradient-to-r from-[#DBEAFE] to-[#BFDBFE] px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8] shadow-[0_3px_8px_rgba(37,99,235,0.18)]">
                  {publishedIssues.length}
                </span>
              )}
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.name}
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

                {showProfileDropdown && (
                  <>
                    <div
                      className="glass-panel-backdrop"
                      aria-hidden="true"
                      onClick={() => setShowProfileDropdown(false)}
                    />
                    {ProfilePanel()}
                  </>
                )}
              </div>

            ) : (
              /* ── Guest buttons ── */
              <div className="glass-auth-group">
                <Link
                  to={withJournal('/login')}
                  className="glass-auth-btn"
                >
                  <span className="glass-auth-icon-wrap" aria-hidden="true">
                    <LogIn size={13} />
                  </span>
                  Login
                </Link>
                <Link
                  to={withJournal('/register')}
                  className="glass-auth-btn glass-auth-btn-primary"
                >
                  <span className="glass-auth-icon-wrap" aria-hidden="true">
                    <UserPlus size={13} />
                  </span>
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
              to={withJournal('/published')}
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
                      to={withJournal(`/published/${issue.id}`)}
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
                key={link.name}
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
                className="mt-4 space-y-2 rounded-xl border bg-[#F8FBFF] p-4"
                style={{ borderColor: '#D8E4F6' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                  {displayRole}
                </p>
                <p className="text-sm font-semibold text-[#0B1C4D]">{displayName}</p>
                <p className="text-xs text-slate-600">{currentUser?.email}</p>

                {activeRole === 'author' && SettingsCard()}

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
                      window.location.href = withJournal('');
                    }}
                    className="block w-full rounded-xl border px-4 py-2 text-center text-sm font-medium text-slate-700 transition-all duration-300 ease-in-out hover:bg-[#F3F8FF]"
                    style={{ borderColor: '#D8E4F6' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="glass-auth-mobile">
                  <Link
                    to={withJournal('/login')}
                    onClick={() => setMobileMenuOpen(false)}
                    className="glass-auth-btn"
                  >
                    <span className="glass-auth-icon-wrap" aria-hidden="true">
                      <LogIn size={13} />
                    </span>
                    Login
                  </Link>
                  <Link
                    to={withJournal('/register')}
                    onClick={() => setMobileMenuOpen(false)}
                    className="glass-auth-btn glass-auth-btn-primary"
                  >
                    <span className="glass-auth-icon-wrap" aria-hidden="true">
                      <UserPlus size={13} />
                    </span>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}