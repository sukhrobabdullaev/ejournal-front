import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  setMyActiveRole,
  initializeActiveRole,
  getAllSubmissions,
  getCurrentUser,
  getMySubmissions,
  getMyAssignments,
  getApprovedRolesFromUser,
  getRoleLabel,
  getStoredActiveRole,
  ACTIVE_ROLE_CHANGED_EVENT,
  ACTIVE_ROLE_STORAGE_KEY,
  ROLE_SELECTION_REQUIRED_KEY,
} from '../lib/queries-api';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Download,
  Share2,
  QrCode,
  Clock,
  Users,
  CheckCircle,
  Eye,
  Settings,
  Search,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const AUTHOR_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'revision_required', label: 'Revisions Required' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'published', label: 'Published' },
];

const REVIEWER_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'review_submitted', label: 'Review Submitted' },
  { value: 'completed', label: 'Completed' },
];

export function DashboardNew() {
  const navigate = useNavigate();
  const [activeRole, setActiveRoleState] = useState<string | null>(() => getStoredActiveRole());
  const [roleResolved, setRoleResolved] = useState(false);

  const {
    data: currentUser,
    isLoading: userLoading,
    isError: userError,
  } = useQuery({
    queryKey: ['me'],
    queryFn: () => getCurrentUser(),
    retry: false,
  });

  const approvedRoles = useMemo(
    () => getApprovedRolesFromUser(currentUser || null),
    [currentUser]
  );

  const { data: submissions = [] } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => getMySubmissions(),
    enabled: !!currentUser,
  });

  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [authorStatusFilter, setAuthorStatusFilter] = useState<string>('all');
  const [authorCurrentPage, setAuthorCurrentPage] = useState(1);
  const authorItemsPerPage = 5;

  const filteredAuthorSubmissions = useMemo(() => {
    const query = authorSearchTerm.trim().toLowerCase();

    const matchesStatus = (status: string) => {
      if (authorStatusFilter === 'all') {
        return true;
      }
      if (authorStatusFilter === 'revision_required') {
        return status === 'revision_required' || status === 'resubmitted';
      }
      if (authorStatusFilter === 'rejected') {
        return status === 'rejected' || status === 'desk_rejected';
      }
      if (authorStatusFilter === 'under_review') {
        return status === 'under_review' || status === 'decision_pending';
      }
      return status === authorStatusFilter;
    };

    return [...submissions]
      .filter((submission) => {
        const title = (submission.title || '').toLowerCase();
        const abstract = (submission.abstract || '').toLowerCase();
        const searchMatches = !query || title.includes(query) || abstract.includes(query);
        return searchMatches && matchesStatus(submission.status);
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [submissions, authorSearchTerm, authorStatusFilter]);

  // Author pagination
  const authorTotalPages = Math.max(1, Math.ceil(filteredAuthorSubmissions.length / authorItemsPerPage));
  const authorSafePage = Math.min(authorCurrentPage, authorTotalPages);
  const currentAuthorSubmissions = filteredAuthorSubmissions.slice(
    (authorSafePage - 1) * authorItemsPerPage,
    authorSafePage * authorItemsPerPage
  );

  useEffect(() => {
    setAuthorCurrentPage(1);
  }, [authorSearchTerm, authorStatusFilter]);

  // Initialize active role based on approved roles and login-time selection requirement.
  useEffect(() => {
    if (!currentUser) {
      setRoleResolved(true);
      return;
    }

    let isMounted = true;
    const forceSelectionForMultipleRoles =
      sessionStorage.getItem(ROLE_SELECTION_REQUIRED_KEY) === '1';

    initializeActiveRole(currentUser, { forceSelectionForMultipleRoles }).then((role) => {
      if (!isMounted) {
        return;
      }
      setActiveRoleState(role);
      setRoleResolved(true);
      if (role) {
        sessionStorage.removeItem(ROLE_SELECTION_REQUIRED_KEY);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    const handleRoleChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ role?: string | null }>;
      setActiveRoleState(customEvent.detail?.role ?? getStoredActiveRole());
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

  // Redirect if unauthenticated
  useEffect(() => {
    if (!userLoading && (userError || !currentUser)) {
      navigate('/login');
    }
  }, [userLoading, userError, currentUser, navigate]);

  const handleRoleSwitch = async (newRole: string) => {
    if (!currentUser || !approvedRoles.includes(newRole)) {
      return;
    }
    const success = await setMyActiveRole(newRole, currentUser);
    if (success) {
      setActiveRoleState(newRole);
      sessionStorage.removeItem(ROLE_SELECTION_REQUIRED_KEY);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'screening':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'under_review':
      case 'decision_pending':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'revision_required':
      case 'resubmitted':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'accepted':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'desk_rejected':
      case 'rejected':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'published':
        return 'bg-violet-50 text-violet-600 border-violet-200';
      case 'withdrawn':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleShareCertificate = async (
    url: string,
    options?: { title?: string; text?: string }
  ) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: options?.title || 'Certificate',
          text: options?.text || 'Certificate',
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      alert('Certificate link copied to clipboard.');
    } catch (error) {
      console.error('Failed to share certificate:', error);
    }
  };

  if (userLoading || !roleResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: '#0B1C4D', borderTopColor: 'transparent' }}
          ></div>
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const profile = currentUser;
  const mustChooseRole = approvedRoles.length > 1 && !activeRole;

  if (mustChooseRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F5F9FF] to-[#EEF4FD] px-4 py-16">
        <div
          className="w-full max-w-3xl rounded-md border bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-12"
          style={{ borderColor: '#CBD5E1' }}
        >
          <div className="mb-8 border-b pb-6" style={{ borderColor: '#E2E8F0' }}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Role Selection
            </p>
            <h1 className="mb-3 text-3xl font-bold text-[#0B1C4D]">
              Tizimga kirish uchun o&apos;zingizga tegishli rolni tanlang
            </h1>
            <p className="text-sm text-slate-600">
              Hurmatli {profile.full_name}, tizim davom etishi uchun faol rolni tasdiqlang.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {approvedRoles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className="rounded-md border bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:shadow-md"
                style={{ borderColor: '#CBD5E1' }}
              >
                <div className="mb-2 text-lg font-semibold text-[#0B1C4D]">{getRoleLabel(role)}</div>
                <p className="text-sm text-slate-600">
                  Dashboard ushbu rolda ochiladi va header avtomatik sinxronlanadi.
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activeRole && approvedRoles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div
          className="w-full max-w-2xl rounded-md border bg-white p-8"
          style={{ borderColor: '#CBD5E1' }}
        >
          <h2 className="mb-2 text-2xl font-bold text-[#0B1C4D]">Dashboard access unavailable</h2>
          <p className="text-sm text-slate-600">
            Sizning tasdiqlangan rolingiz topilmadi. Administrator bilan bog&apos;laning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFF] to-[#EEF4FF] pt-4 md:pt-5">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* REVIEWER DASHBOARD */}
        {activeRole === 'reviewer' && <ReviewerSection />}

        {/* EDITOR / ADMIN DASHBOARD */}
        {(activeRole === 'editor' || activeRole === 'admin') && (
          <EditorAdminSection
            role={activeRole as 'editor' | 'admin'}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        )}

        {/* Author dashboard */}
        {activeRole === 'author' && (
          <div>
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-[#0B1C4D]">Author Dashboard</h2>
              <p className="text-sm text-slate-600">Manage your manuscript submissions</p>
            </div>

            {/* New Submission Button */}
            <div className="mb-8">
              <Link
                to="/submit"
                className="inline-flex items-center rounded-xl px-6 py-3 font-medium text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(29,78,216,0.28)]"
                style={{ backgroundColor: '#0B1C4D' }}
              >
                <Plus size={20} className="mr-2" />
                New Submission
              </Link>
            </div>

            {/* Statistics Section */}
            {submissions.length > 0 && <AuthorStatistics submissions={submissions} />}

            {/* Submissions List */}
            <div className="rounded-xl border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]" style={{ borderColor: '#CBD5E1' }}>
              <h3 className="mb-4 text-xl font-semibold text-[#0B1C4D]">My Submissions</h3>
              <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#94A3B8' }}
                  />
                  <input
                    type="text"
                    value={authorSearchTerm}
                    onChange={(event) => setAuthorSearchTerm(event.target.value)}
                    placeholder="Search by article title or abstract"
                    className="w-full rounded-lg border bg-[#F8FBFF] py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-300 ease-in-out focus:border-[#93C5FD] focus:bg-white"
                    style={{ borderColor: '#C9DCF6' }}
                  />
                </div>
                <div className="relative">
                  <Filter
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#94A3B8' }}
                  />
                  <select
                    value={authorStatusFilter}
                    onChange={(event) => setAuthorStatusFilter(event.target.value)}
                    className="w-full rounded-lg border bg-[#F8FBFF] py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition-all duration-300 ease-in-out focus:border-[#93C5FD] focus:bg-white"
                    style={{ borderColor: '#C9DCF6' }}
                  >
                    {AUTHOR_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No submissions yet. Start by creating a new submission.
                </p>
              ) : filteredAuthorSubmissions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#C9DCF6] bg-[#F8FBFF] px-4 py-8 text-center">
                  <p className="text-sm text-slate-600">No submissions matched your search/filter.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentAuthorSubmissions.map((submission, index) => (
                      <div
                        key={submission.id}
                        className="saas-stagger-item rounded-lg border bg-white p-4 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
                        style={{ borderColor: '#CBD5E1', animationDelay: `${index * 70}ms` }}
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="mb-1 text-lg font-medium text-[#0B1C4D]">
                              {submission.title || 'Untitled Submission'}
                            </h4>
                            <p className="text-sm text-slate-600">
                              Submitted:{' '}
                              {submission.created_at
                                ? new Date(submission.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </p>
                          </div>
                          <span className={`inline-flex items-center rounded-lg border px-3 !py-0 text-sm font-medium !leading-none w-auto h-auto ${getStatusColor(submission.status)}`}>
                            {getStatusLabel(submission.status)}
                          </span>
                        </div>
                        {submission.abstract && (
                          <p className="mb-3 line-clamp-2 text-sm text-slate-700">
                            {submission.abstract}
                          </p>
                        )}
                        <Link
                          to={`/submission/${submission.id}`}
                          className="inline-flex items-center text-sm font-medium text-[#0B1C4D] transition-all duration-300 ease-in-out hover:text-[#12327A]"
                        >
                          <FileText size={16} className="mr-1" />
                          View Details
                        </Link>

                        {submission.certificates && submission.certificates.length > 0 && (
                          <div className="mt-4 rounded-xl border border-[#D8E4F6] bg-[#F8FBFF] p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
                              Reviewer Recognition Certificate
                            </p>
                            <div className="space-y-2">
                              {submission.certificates.map((certificate) => (
                                <div
                                  key={certificate.id}
                                  className="flex flex-col gap-2 rounded-xl border border-[#D8E4F6] bg-white p-3 transition-all duration-300 ease-in-out hover:shadow-[0_8px_18px_rgba(37,99,235,0.10)] md:flex-row md:items-center md:justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-[#0B1C4D]">
                                      Reviewer: {certificate.reviewer_name}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Issued:{' '}
                                      {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    to={`/certificate/${certificate.verification_code}`}
                                    className="rounded border border-[#C9DCF6] px-3 py-1.5 text-xs font-medium text-[#0B1C4D] transition-colors hover:bg-[#EFF6FF]"
                                  >
                                    View
                                  </Link>
                                  <a
                                    href={certificate.pdf_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center rounded border border-[#C9DCF6] px-3 py-1.5 text-xs font-medium text-[#0B1C4D] transition-colors hover:bg-[#EFF6FF]"
                                  >
                                    <Download size={13} className="mr-1" />
                                    Download
                                  </a>
                                  <button
                                    onClick={() =>
                                      handleShareCertificate(certificate.certificate_page_url, {
                                        title: 'Reviewer Recognition Certificate',
                                        text: 'Reviewer recognition certificate',
                                      })
                                    }
                                    className="inline-flex items-center rounded border border-[#C9DCF6] px-3 py-1.5 text-xs font-medium text-[#0B1C4D] transition-colors hover:bg-[#EFF6FF]"
                                  >
                                    <Share2 size={13} className="mr-1" />
                                    Share
                                  </button>
                                  <a
                                    href={certificate.qr_svg_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center rounded border border-[#C9DCF6] px-3 py-1.5 text-xs font-medium text-[#0B1C4D] transition-colors hover:bg-[#EFF6FF]"
                                  >
                                    <QrCode size={13} className="mr-1" />
                                    QR
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {submission.journal_certificates &&
                        submission.journal_certificates.length > 0 && (
                          <div className="mt-4 rounded-xl border border-[#D8E4F6] bg-[#F8FBFF] p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
                              Journal Publication Certificate
                            </p>
                            <div className="space-y-2">
                              {submission.journal_certificates.map((certificate) => (
                                <div
                                  key={certificate.id}
                                  className="flex flex-col gap-2 rounded-xl border border-[#D8E4F6] bg-white p-3 transition-all duration-300 ease-in-out hover:shadow-[0_8px_18px_rgba(37,99,235,0.10)] md:flex-row md:items-center md:justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-[#0B1C4D]">
                                      {certificate.issue_title}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Article: {certificate.submission_title}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Issued:{' '}
                                      {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                      to={`/journal-certificate/${certificate.verification_code}`}
                                      className="rounded border border-[#C9DCF6] px-3 py-1.5 text-xs font-medium text-[#0B1C4D] transition-colors hover:bg-[#EFF6FF]"
                                    >
                                      View
                                    </Link>
                                    <a
                                      href={certificate.pdf_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center rounded border border-[#C9DCF6] px-3 py-1.5 text-xs font-medium text-[#0B1C4D] transition-colors hover:bg-[#EFF6FF]"
                                    >
                                      <Download size={13} className="mr-1" />
                                      Download
                                    </a>
                                    <button
                                      onClick={() =>
                                        handleShareCertificate(certificate.certificate_page_url, {
                                          title: 'Journal Publication Certificate',
                                          text: `${certificate.issue_title} - ${certificate.submission_title}`,
                                        })
                                      }
                                      className="inline-flex items-center rounded border border-[#C9DCF6] px-3 py-1.5 text-xs font-medium text-[#0B1C4D] transition-colors hover:bg-[#EFF6FF]"
                                    >
                                      <Share2 size={13} className="mr-1" />
                                      Share
                                    </button>
                                    <a
                                      href={certificate.qr_svg_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center rounded border border-[#C9DCF6] px-3 py-1.5 text-xs font-medium text-[#0B1C4D] transition-colors hover:bg-[#EFF6FF]"
                                    >
                                      <QrCode size={13} className="mr-1" />
                                      QR
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                {authorTotalPages > 1 && (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    {Array.from({ length: authorTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setAuthorCurrentPage(page)}
                        aria-current={page === authorSafePage ? 'page' : undefined}
                        className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#EFF6FF]"
                        style={
                          page === authorSafePage
                            ? { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', color: '#FFFFFF' }
                            : { backgroundColor: '#FFFFFF', borderColor: '#C9DCF6', color: '#0B1C4D' }
                        }
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Role-specific sub-components ───────────────────────────────────────────
// These components own their own queries so the hooks are only registered when
// the user actually has the matching role, keeping the devtools clean.

function ReviewerSection() {
  const { data: reviewAssignments = [] } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => getMyAssignments(),
  });

  const [reviewerSearchTerm, setReviewerSearchTerm] = useState('');
  const [reviewerStatusFilter, setReviewerStatusFilter] = useState('all');

  const filteredReviewAssignments = useMemo(() => {
    const query = reviewerSearchTerm.trim().toLowerCase();

    const matchesStatus = (status: string) => {
      if (reviewerStatusFilter === 'all') {
        return true;
      }
      if (reviewerStatusFilter === 'pending_review') {
        return status === 'invited' || status === 'accepted';
      }
      if (reviewerStatusFilter === 'review_submitted') {
        return status === 'review_submitted';
      }
      if (reviewerStatusFilter === 'completed') {
        return status === 'review_submitted' || status === 'declined' || status === 'expired';
      }
      return status === reviewerStatusFilter;
    };

    return [...reviewAssignments]
      .filter((assignment) => {
        const title = (assignment.submission_title || '').toLowerCase();
        const abstract = (assignment.submission_abstract || '').toLowerCase();
        const searchMatches = !query || title.includes(query) || abstract.includes(query);
        return searchMatches && matchesStatus(assignment.status);
      })
      .sort((a, b) => new Date(b.invited_at || 0).getTime() - new Date(a.invited_at || 0).getTime());
  }, [reviewAssignments, reviewerSearchTerm, reviewerStatusFilter]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[#0B1C4D]">Reviewer Dashboard</h2>
        <p className="text-sm text-slate-600">Review manuscripts assigned to you</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-900">{reviewAssignments.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Pending Invites</p>
              <p className="text-3xl font-bold text-yellow-600">
                {reviewAssignments.filter((a) => a.status === 'invited').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {reviewAssignments.filter((a) => a.status === 'accepted').length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {reviewAssignments.filter((a) => a.status === 'review_submitted').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      {reviewAssignments.length > 0 && <ReviewerStatistics assignments={reviewAssignments} />}

      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-xl font-semibold text-[#0B1C4D]">My Review Assignments</h3>
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#94A3B8' }}
            />
            <input
              type="text"
              value={reviewerSearchTerm}
              onChange={(event) => setReviewerSearchTerm(event.target.value)}
              placeholder="Search by manuscript title or abstract"
              className="w-full rounded-lg border bg-[#F8FBFF] py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-300 ease-in-out focus:border-[#93C5FD] focus:bg-white"
              style={{ borderColor: '#C9DCF6' }}
            />
          </div>
          <div className="relative">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#94A3B8' }}
            />
            <select
              value={reviewerStatusFilter}
              onChange={(event) => setReviewerStatusFilter(event.target.value)}
              className="w-full rounded-lg border bg-[#F8FBFF] py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition-all duration-300 ease-in-out focus:border-[#93C5FD] focus:bg-white"
              style={{ borderColor: '#C9DCF6' }}
            >
              {REVIEWER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {reviewAssignments.length === 0 ? (
          <p className="text-sm text-slate-600">No review assignments yet.</p>
        ) : filteredReviewAssignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#C9DCF6] bg-[#F8FBFF] px-4 py-8 text-center">
            <p className="text-sm text-slate-600">No review assignments matched your search/filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviewAssignments.map((assignment, index) => (
              <div
                key={assignment.id}
                className="saas-stagger-item rounded-lg border border-[#D8E4F6] bg-white p-4 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="mb-1 text-lg font-medium text-gray-900">
                      {assignment.submission_title || 'Untitled Manuscript'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Invited:{' '}
                      {assignment.invited_at
                        ? new Date(assignment.invited_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                    {assignment.due_date && (
                      <p className="text-sm text-gray-600">
                        Due:{' '}
                        {new Date(assignment.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-lg border px-3 !py-0 text-sm font-medium !leading-none w-auto h-auto capitalize ${
                      assignment.status === 'invited'
                        ? 'border-amber-200 bg-amber-50 text-amber-600'
                        : assignment.status === 'accepted'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          : assignment.status === 'declined'
                            ? 'border-rose-200 bg-rose-50 text-rose-600'
                            : assignment.status === 'review_submitted'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                              : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    {assignment.status.replace('_', ' ')}
                  </span>
                </div>
                {assignment.submission_abstract && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-700">
                    {assignment.submission_abstract}
                  </p>
                )}
                <Link
                  to={`/review/assignments/${assignment.id}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 transition-all duration-300 ease-in-out hover:text-blue-700"
                >
                  View Assignment Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditorAdminSection({
  role,
  getStatusColor,
  getStatusLabel,
}: {
  role: 'editor' | 'admin';
  getStatusColor: (s: string) => string;
  getStatusLabel: (s: string) => string;
}) {
  const { data: allSubmissions = [] } = useQuery({
    queryKey: ['all-submissions'],
    queryFn: () => getAllSubmissions(),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredSubmissions = useMemo(() => {
    let list = [...allSubmissions];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          (s.title || '').toLowerCase().includes(lowerSearch) ||
          ((s as any).profiles?.full_name || '').toLowerCase().includes(lowerSearch) ||
          String(s.author || '').toLowerCase().includes(lowerSearch)
      );
    }
    if (filterStatus && filterStatus !== 'all') {
      list = list.filter((s) => s.status === filterStatus);
    }
    // Sort by created_at DESC
    list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    return list;
  }, [allSubmissions, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const currentSubmissions = filteredSubmissions.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );
  const formatCreatedAt = (value?: string) => {
    if (!value) {
      return 'N/A';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(allSubmissions.map((s) => s.status));
    return Array.from(statuses);
  }, [allSubmissions]);

  const submittedCount = allSubmissions.filter((s) => s.status === 'submitted').length;
  const screeningCount = allSubmissions.filter((s) => s.status === 'screening').length;
  const underReviewCount = allSubmissions.filter((s) => s.status === 'under_review').length;
  const acceptedCount = allSubmissions.filter((s) => s.status === 'accepted').length;
  const rejectedCount = allSubmissions.filter((s) => s.status === 'rejected').length;

  if (role === 'editor') {
    return (
      <div>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-[#0B1C4D]">Editor Dashboard</h2>
          <p className="text-sm text-slate-600">Manage submissions and editorial workflow</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">New Submissions</p>
                <p className="text-3xl font-bold text-blue-600">{submittedCount}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Screening</p>
                <p className="text-3xl font-bold text-purple-600">{screeningCount}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Under Review</p>
                <p className="text-3xl font-bold text-yellow-600">{underReviewCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{acceptedCount + rejectedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        {allSubmissions.length > 0 && <EditorStatistics submissions={allSubmissions} />}

        <div
          className="rounded-xl border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
          style={{ borderColor: '#D8E4F6' }}
        >
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-[#0B1C4D]">All Submissions</h3>
            <p className="mt-1 text-sm text-slate-600">
              Search, filter and review the newest submissions quickly.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by article title or author"
              className="w-full rounded-lg border bg-[#F8FBFF] px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-300 ease-in-out focus:border-[#93C5FD] focus:bg-white"
              style={{ borderColor: '#C9DCF6' }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border bg-[#F8FBFF] px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-300 ease-in-out focus:border-[#93C5FD] focus:bg-white"
              style={{ borderColor: '#C9DCF6' }}
            >
              <option value="all">All statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#C9DCF6] bg-[#F8FBFF] px-4 py-8 text-center">
              <p className="text-sm text-slate-600">No submissions matched your search/filter.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentSubmissions.map((submission, index) => (
                  <div
                    key={submission.id}
                    className="saas-stagger-item rounded-lg border bg-white p-4 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: '#D8E4F6', animationDelay: `${index * 80}ms` }}
                  >
                    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-lg font-semibold text-[#0B1C4D]">
                          {submission.title || 'Untitled Submission'}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">
                          Author: {(submission as any).profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-500">
                          Submitted: {formatCreatedAt(submission.created_at)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center shrink-0 rounded-lg border px-3 !py-0 text-sm font-medium !leading-none w-auto h-auto ${getStatusColor(submission.status)}`}>
                        {getStatusLabel(submission.status)}
                      </span>
                    </div>

                    {submission.abstract && (
                      <p className="mb-3 line-clamp-2 text-sm text-slate-700">{submission.abstract}</p>
                    )}

                    <Link
                      to={`/editor/submissions/${submission.id}`}
                      className="inline-flex items-center text-sm font-medium text-[#1D4ED8] transition-all duration-300 ease-in-out hover:text-[#1E3A8A]"
                    >
                      <Eye size={16} className="mr-1" />
                      View Submission Details
                    </Link>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      aria-current={page === safePage ? 'page' : undefined}
                      className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#EFF6FF]"
                      style={
                        page === safePage
                          ? { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', color: '#FFFFFF' }
                          : { backgroundColor: '#FFFFFF', borderColor: '#C9DCF6', color: '#0B1C4D' }
                      }
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[#0B1C4D]">Admin Dashboard</h2>
        <p className="text-sm text-slate-600">System administration and user management</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{allSubmissions.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Active Reviews</p>
              <p className="text-3xl font-bold text-blue-600">{underReviewCount}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600">
                {allSubmissions.filter((s) => s.status === 'published').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">System Status</p>
              <p className="text-lg font-bold text-green-600">Healthy</p>
            </div>
            <Settings className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(37,99,235,0.12)]">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Editorial Management</h3>
          <p className="mb-4 text-sm text-gray-600">
            Manage all submissions, assign editors, and oversee the editorial workflow.
          </p>
          <Link
            to="/editor"
            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_10px_22px_rgba(37,99,235,0.25)]"
          >
            <FileText size={16} className="mr-2" />
            Editorial Dashboard
          </Link>
        </div>
        <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(37,99,235,0.12)]">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">User Management</h3>
          <p className="mb-4 text-sm text-gray-600">
            Manage user roles, permissions, and review role requests.
          </p>
          <button
            className="inline-flex cursor-not-allowed items-center rounded-xl bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500"
            disabled
          >
            <Users size={16} className="mr-2" />
            Coming Soon
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      {allSubmissions.length > 0 && <AdminStatistics submissions={allSubmissions} />}

      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-xl font-semibold text-[#0B1C4D]">Recent Submissions</h3>
        {allSubmissions.length === 0 ? (
          <p className="text-sm text-gray-600">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {allSubmissions.slice(0, 5).map((submission, index) => (
              <div
                key={submission.id}
                className="saas-stagger-item rounded-lg border border-[#D8E4F6] bg-white p-4 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="mb-1 text-base font-medium text-gray-900">
                      {submission.title || 'Untitled Submission'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Author: {(submission as any).profiles?.full_name || 'Unknown'} | Submitted:{' '}
                      {submission.created_at
                        ? new Date(submission.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-lg border px-3 !py-0 text-sm font-medium !leading-none w-auto h-auto ${getStatusColor(submission.status)}`}>
                    {getStatusLabel(submission.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Statistics Components ───────────────────────────────────────────────────

// Author Statistics Component
function AuthorStatistics({ submissions }: { submissions: any[] }) {
  const COLORS = ['#0B1C4D', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    }));
  }, [submissions]);

  const monthlyData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    submissions.forEach((s) => {
      if (s.created_at) {
        const date = new Date(s.created_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });
    return Object.entries(monthCounts)
      .sort()
      .slice(-6)
      .map(([month, count]) => ({
        month,
        submissions: count,
      }));
  }, [submissions]);

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Status Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie dataKey="value" data={statusData} cx="50%" cy="50%" outerRadius={80} label>
              {statusData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] lg:col-span-2">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Submission Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="submissions" stroke="#1D4ED8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Reviewer Statistics Component
function ReviewerStatistics({ assignments }: { assignments: any[] }) {
  const COLORS = ['#0B1C4D', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    assignments.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    }));
  }, [assignments]);

  const monthlyData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    assignments.forEach((a) => {
      if (a.invited_at) {
        const date = new Date(a.invited_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });
    return Object.entries(monthCounts)
      .sort()
      .slice(-6)
      .map(([month, count]) => ({
        month,
        reviews: count,
      }));
  }, [assignments]);

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Assignment Status</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie dataKey="value" data={statusData} cx="50%" cy="50%" outerRadius={80} label>
              {statusData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] lg:col-span-2">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Review Invitations Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="reviews" stroke="#1D4ED8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Editor Statistics Component
function EditorStatistics({ submissions }: { submissions: any[] }) {
  const COLORS = ['#0B1C4D', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FA', '#DBEAFE'];

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [submissions]);

  const monthlyData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    submissions.forEach((s) => {
      if (s.created_at) {
        const date = new Date(s.created_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });
    return Object.entries(monthCounts)
      .sort()
      .slice(-6)
      .map(([month, count]) => ({
        month,
        submissions: count,
      }));
  }, [submissions]);

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Status Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1D4ED8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Workflow Status</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie dataKey="value" data={statusData} cx="50%" cy="50%" outerRadius={80} label>
              {statusData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Submission Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="submissions" stroke="#1D4ED8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Admin Statistics Component
function AdminStatistics({ submissions }: { submissions: any[] }) {
  const COLORS = ['#0B1C4D', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [submissions]);

  const monthlyData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    submissions.forEach((s) => {
      if (s.created_at) {
        const date = new Date(s.created_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });
    return Object.entries(monthCounts)
      .sort()
      .slice(-6)
      .map(([month, count]) => ({
        month,
        total: count,
      }));
  }, [submissions]);

  const systemHealth = useMemo(() => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [
      {
        period: 'Last 24h',
        count: submissions.filter((s) => new Date(s.created_at) > dayAgo).length,
      },
      {
        period: 'Last 7d',
        count: submissions.filter((s) => new Date(s.created_at) > weekAgo).length,
      },
      {
        period: 'Last 30d',
        count: submissions.filter((s) => new Date(s.created_at) > monthAgo).length,
      },
    ];
  }, [submissions]);

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Status Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1D4ED8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">System Activity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={systemHealth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#22C55E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#D8E4F6] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="mb-4 text-lg font-semibold text-[#0B1C4D]">Submission Growth</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#1D4ED8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}