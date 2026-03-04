import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { logout } from '../lib/queries-api';
import {
  getMyProfile,
  getMySubmissions,
  getMyAssignments,
  getMyRoles,
  getMyActiveRole,
  setMyActiveRole,
  initializeActiveRole,
  getAllSubmissions,
} from '../lib/queries-api';
import type { User, Submission, ReviewAssignment } from '../lib/api';
import {
  FileText,
  Plus,
  LogOut,
  Download,
  ChevronDown,
  AlertCircle,
  Clock,
  Users,
  CheckCircle,
  Eye,
  UserPlus,
  Settings
} from 'lucide-react';

export function DashboardNew() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviewAssignments, setReviewAssignments] = useState<ReviewAssignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeRole === 'editor' || activeRole === 'admin') {
      loadEditorData();
    }
  }, [activeRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load roles first
      const rolesData = await getMyRoles();
      console.log('[Dashboard] Roles loaded:', rolesData);

      // If no roles, user not authenticated
      if (!rolesData || rolesData.length === 0) {
        navigate('/login');
        return;
      }

      setRoles(rolesData);

      // Initialize and get active role
      const initializedActiveRole = await initializeActiveRole();
      console.log('[Dashboard] Active role initialized:', initializedActiveRole);
      setActiveRoleState(initializedActiveRole);

      // Load profile and data
      const [profileData, submissionsData, reviewAssignmentsData] = await Promise.all([
        getMyProfile(),
        getMySubmissions(),
        getMyAssignments(),
      ]);

      if (!profileData) {
        setError('Profile not found');
        navigate('/login');
        return;
      }

      setProfile(profileData);
      setSubmissions(submissionsData);
      setReviewAssignments(reviewAssignmentsData);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
      // If unauthorized, redirect to login
      if (err.message?.includes('401') || err.message?.includes('expired')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadEditorData = async () => {
    try {
      const allSubs = await getAllSubmissions();
      setAllSubmissions(allSubs);
    } catch (err) {
      console.error('Error loading editor data:', err);
    }
  };

  const handleRoleSwitch = async (newRole: string) => {
    if (!roles.includes(newRole)) {
      alert('You do not have permission to switch to this role.');
      return;
    }

    setSwitchingRole(true);

    try {
      const success = await setMyActiveRole(newRole);

      if (success) {
        // Optimistic UI update
        setActiveRoleState(newRole);
        setShowRoleDropdown(false);
      } else {
        alert('Failed to switch role. The active_role column may not exist in the database.');
      }
    } catch (err) {
      console.error('Error switching role:', err);
      alert('An error occurred while switching roles.');
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-gray-700 border-gray-300';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'screening':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      case 'under_review':
      case 'decision_pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'revision_required':
      case 'resubmitted':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'desk_rejected':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'published':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRoleTitleCase = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && roles.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Roles Assigned</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const submittedCount = allSubmissions.filter(s => s.status === 'submitted').length;
  const underReviewCount = allSubmissions.filter(s => s.status === 'under_review').length;
  const acceptedCount = allSubmissions.filter(s => s.status === 'accepted').length;
  const rejectedCount = allSubmissions.filter(s => s.status === 'rejected').length;

  console.log(allSubmissions);
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {profile.full_name}
              </h1>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Role Switcher */}
              {roles.length > 0 && (
                <div className="relative">
                  <label className="block text-xs text-gray-600 mb-1">Active Role</label>
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm min-w-[140px] justify-between"
                    disabled={switchingRole}
                  >
                    <span className="capitalize">{activeRole ? getRoleTitleCase(activeRole) : 'Select Role'}</span>
                    <ChevronDown size={16} className={`transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-1 w-full bg-white border border-gray-300 shadow-lg z-50">
                      {roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleSwitch(role)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors capitalize ${role === activeRole ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                          disabled={switchingRole}
                        >
                          {getRoleTitleCase(role)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Logout Button */}
              <div>
                {roles.length > 0 && <div className="h-4"></div>}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Dev Info */}
          <div className="mt-4 text-xs text-gray-500 font-mono">
            Roles loaded: {roles.join(', ')} | Active role: {activeRole || 'none'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* REVIEWER DASHBOARD */}
        {activeRole === 'reviewer' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reviewer Dashboard</h2>
              <p className="text-sm text-gray-600">Review manuscripts assigned to you</p>
            </div>

            {/* Review Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Assignments</p>
                    <p className="text-3xl font-bold text-gray-900">{reviewAssignments.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Invites</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {reviewAssignments.filter(a => a.status === 'invited').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {reviewAssignments.filter(a => a.status === 'accepted').length}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">
                      {reviewAssignments.filter((a) => a.status === 'review_submitted').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Review Assignments List */}
            <div className="bg-white border border-gray-300 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My Review Assignments</h3>
              {reviewAssignments.length === 0 ? (
                <p className="text-sm text-gray-600">No review assignments yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviewAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border border-gray-300 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-1">
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
                          className={`px-3 py-1 text-xs border capitalize ${assignment.status === 'invited'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                            : assignment.status === 'accepted'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : assignment.status === 'declined'
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : assignment.status === 'review_submitted'
                                  ? 'bg-green-50 text-green-700 border-green-300'
                                  : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                        >
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </div>
                      {assignment.submission_abstract && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {assignment.submission_abstract}
                        </p>
                      )}
                      <Link
                        to={`/review/assignments/${assignment.id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Assignment Details →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EDITOR DASHBOARD */}
        {activeRole === 'editor' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Editor Dashboard</h2>
              <p className="text-sm text-gray-600">Manage submissions and editorial workflow</p>
            </div>

            {/* Editorial Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">New Submissions</p>
                    <p className="text-3xl font-bold text-blue-600">{submittedCount}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Under Review</p>
                    <p className="text-3xl font-bold text-yellow-600">{underReviewCount}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Accepted</p>
                    <p className="text-3xl font-bold text-green-600">{acceptedCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white border border-gray-300 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">All Submissions</h3>
              {allSubmissions.length === 0 ? (
                <p className="text-sm text-gray-600">No submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {allSubmissions.slice(0, 10).map((submission) => (
                    <div key={submission.id} className="border border-gray-300 p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-1">
                            {submission.title || 'Untitled Submission'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Author: {submission.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Submitted: {submission.created_at ? new Date(submission.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs border ${getStatusColor(submission.status)}`}>
                          {getStatusLabel(submission.status)}
                        </span>
                      </div>
                      {submission.abstract && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {submission.abstract}
                        </p>
                      )}
                      <Link
                        to={`/editor/submissions/${submission.id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye size={16} className="mr-1" />
                        View Submission Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/editor"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium"
                >
                  Go to Full Editor Dashboard →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {activeRole === 'admin' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
              <p className="text-sm text-gray-600">System administration and user management</p>
            </div>

            {/* Admin Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                    <p className="text-3xl font-bold text-gray-900">{allSubmissions.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Reviews</p>
                    <p className="text-3xl font-bold text-blue-600">{underReviewCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Published</p>
                    <p className="text-3xl font-bold text-green-600">
                      {allSubmissions.filter(s => s.status === 'published').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">System Status</p>
                    <p className="text-lg font-bold text-green-600">Healthy</p>
                  </div>
                  <Settings className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Editorial Management</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage all submissions, assign editors, and oversee the editorial workflow.
                </p>
                <Link
                  to="/editor"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                >
                  <FileText size={16} className="mr-2" />
                  Editorial Dashboard
                </Link>
              </div>

              <div className="bg-white border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage user roles, permissions, and review role requests.
                </p>
                <button
                  className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  <Users size={16} className="mr-2" />
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white border border-gray-300 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Submissions</h3>
              {allSubmissions.length === 0 ? (
                <p className="text-sm text-gray-600">No submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {allSubmissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="border border-gray-300 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900 mb-1">
                            {submission.title || 'Untitled Submission'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Author: {submission.profiles?.full_name || 'Unknown'} •
                            Submitted: {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs border ${getStatusColor(submission.status)}`}>
                          {getStatusLabel(submission.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Author/Other roles - show author submissions */}
        {activeRole && !['reviewer', 'editor', 'admin'].includes(activeRole) && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Author Dashboard</h2>
              <p className="text-sm text-gray-600">Manage your manuscript submissions</p>
            </div>

            {/* New Submission Button */}
            <div className="mb-8">
              <Link
                to="/submit"
                className="inline-flex items-center px-6 py-3 bg-blue-400 "
              >
                <Plus size={20} className="mr-2" />
                New Submission
              </Link>
            </div>

            {/* Submissions List */}
            <div className="bg-white border border-gray-300 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My Submissions</h3>
              {submissions.length === 0 ? (
                <p className="text-sm text-gray-600">No submissions yet. Start by creating a new submission.</p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-300 p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-1">
                            {submission.title || 'Untitled Submission'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Submitted: {submission.created_at ? new Date(submission.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs border ${getStatusColor(submission.status)}`}>
                          {getStatusLabel(submission.status)}
                        </span>
                      </div>
                      {submission.abstract && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {submission.abstract}
                        </p>
                      )}
                      <Link
                        to={`/submission/${submission.id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <FileText size={16} className="mr-1" />
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white border border-gray-300 p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Full Name:</span>
              <span className="ml-2 text-gray-900">{profile.full_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 text-gray-900">{profile.email}</span>
            </div>
            {profile.affiliation && (
              <div>
                <span className="text-gray-600">Affiliation:</span>
                <span className="ml-2 text-gray-900">{profile.affiliation}</span>
              </div>
            )}
            {profile.orcid && (
              <div>
                <span className="text-gray-600">ORCID:</span>
                <span className="ml-2 text-gray-900">{profile.orcid}</span>
              </div>
            )}
            {profile.country && (
              <div>
                <span className="text-gray-600">Country:</span>
                <span className="ml-2 text-gray-900">{profile.country}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}