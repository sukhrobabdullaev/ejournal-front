import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '../lib/supabase';
import { getMyProfile, getMySubmissions, getMyAssignments, getMyRoles, getMyRoleRequests, getSubmissionFiles } from '../lib/queries';
import { Profile, Submission } from '../lib/supabase';
import { FileText, Plus, LogOut, Download } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviewAssignments, setReviewAssignments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      // Load profile and submissions
      const [profileData, submissionsData, reviewAssignmentsData, rolesData, roleRequestsData] = await Promise.all([
        getMyProfile(),
        getMySubmissions(),
        getMyAssignments(),
        getMyRoles(),
        getMyRoleRequests(),
      ]);

      if (!profileData) {
        setError('Profile not found');
        return;
      }

      setProfile(profileData);
      setSubmissions(submissionsData);
      setReviewAssignments(reviewAssignmentsData);
      setRoles(rolesData);
      setRoleRequests(roleRequestsData);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'under_review':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'published':
        return 'bg-purple-50 text-purple-700 border-purple-300';
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

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: '#64748B' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0B1C4D' }}>Error</h2>
          <p className="mb-6" style={{ color: '#64748B' }}>{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 font-medium rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                Welcome, {profile.full_name}
              </h1>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{profile.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        {/* Profile Card */}
        <div
          className="bg-white mb-8 transition-all hover:shadow-xl"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Profile Information</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center py-2">
              <span className="font-semibold" style={{ color: '#475569', minWidth: '120px' }}>Full Name:</span>
              <span style={{ color: '#0B1C4D' }}>{profile.full_name}</span>
            </div>
            <div className="flex items-center py-2">
              <span className="font-semibold" style={{ color: '#475569', minWidth: '120px' }}>Email:</span>
              <span style={{ color: '#0B1C4D' }}>{profile.email}</span>
            </div>
            {profile.affiliation && (
              <div className="flex items-center py-2">
                <span className="font-semibold" style={{ color: '#475569', minWidth: '120px' }}>Affiliation:</span>
                <span style={{ color: '#0B1C4D' }}>{profile.affiliation}</span>
              </div>
            )}
            {profile.orcid && (
              <div className="flex items-center py-2">
                <span className="font-semibold" style={{ color: '#475569', minWidth: '120px' }}>ORCID:</span>
                <span style={{ color: '#0B1C4D' }}>{profile.orcid}</span>
              </div>
            )}
            {profile.country && (
              <div className="flex items-center py-2">
                <span className="font-semibold" style={{ color: '#475569', minWidth: '120px' }}>Country:</span>
                <span style={{ color: '#0B1C4D' }}>{profile.country}</span>
              </div>
            )}
          </div>
        </div>

        {/* My Roles */}
        <div
          className="bg-white mb-8 transition-all hover:shadow-xl"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1C4D' }}>My Roles</h2>
          {roles.length === 0 ? (
            <p className="text-sm" style={{ color: '#64748B' }}>No roles assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {roles.map((role, index) => (
                <span
                  key={index}
                  className="px-4 py-2 text-sm font-medium capitalize rounded-full"
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1E3A8A',
                    border: '2px solid #93C5FD'
                  }}
                >
                  {role}
                </span>
              ))}
            </div>
          )}
          {roles.includes('editor') && (
            <div className="mt-6">
              <Link
                to="/editor"
                className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)'
                }}
              >
                Go to Editor Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Role Requests */}
        {roleRequests.length > 0 && (
          <div
            className="bg-white mb-8 transition-all hover:shadow-xl"
            style={{
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              borderLeft: '4px solid #F59E0B'
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Role Requests</h2>
            <div className="space-y-4">
              {roleRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 rounded-lg"
                  style={{
                    border: '2px solid #E2E8F0',
                    backgroundColor: '#F8FAFC'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold capitalize" style={{ color: '#0B1C4D' }}>
                        {request.requested_role} Role
                      </h3>
                      <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                        Requested on {new Date(request.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: request.status === 'pending' ? '#FEF3C7' : request.status === 'approved' ? '#DCFCE7' : '#FEE2E2',
                        color: request.status === 'pending' ? '#78350F' : request.status === 'approved' ? '#14532D' : '#7F1D1D',
                        border: `2px solid ${request.status === 'pending' ? '#FDE047' : request.status === 'approved' ? '#86EFAC' : '#FCA5A5'}`
                      }}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  {request.motivation && (
                    <p className="text-sm mt-3" style={{ color: '#475569', lineHeight: '1.7' }}>
                      <span className="font-semibold">Motivation:</span> {request.motivation}
                    </p>
                  )}
                  {request.reviewed_by_user_id && request.reviewed_at && (
                    <p className="text-xs mt-2" style={{ color: '#64748B' }}>
                      Reviewed on {new Date(request.reviewed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  {request.status === 'rejected' && request.rejection_reason && (
                    <p className="text-sm mt-3" style={{ color: '#991B1B', lineHeight: '1.7' }}>
                      <span className="font-semibold">Reason:</span> {request.rejection_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-8">
          <Link
            to="/submit"
            className="inline-flex items-center px-8 py-4 font-semibold rounded-lg transition-all text-base"
            style={{
              background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)'
            }}
          >
            <Plus size={20} className="mr-2" />
            New Submission
          </Link>
        </div>

        {/* Review Assignments Notification */}
        {reviewAssignments.length > 0 && (
          <div
            className="mb-8 transition-all hover:shadow-xl"
            style={{
              backgroundColor: '#DCFCE7',
              border: '2px solid #86EFAC',
              borderRadius: '16px',
              padding: '32px'
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#14532D' }}>
                  You have review assignments
                </h3>
                <p className="text-sm mb-6" style={{ color: '#166534', lineHeight: '1.7' }}>
                  You have been invited to review {reviewAssignments.length} manuscript{reviewAssignments.length > 1 ? 's' : ''}.
                  {reviewAssignments.filter(a => a.status === 'invited').length > 0 && (
                    <span className="font-semibold">
                      {' '}{reviewAssignments.filter(a => a.status === 'invited').length} pending response.
                    </span>
                  )}
                </p>
                <Link
                  to="/review/dashboard"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg transition-all"
                  style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Go to Reviewer Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <div
          className="bg-white transition-all hover:shadow-xl"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1C4D' }}>My Submissions</h2>

          {submissions.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl"
              style={{
                backgroundColor: '#F8FAFC',
                border: '2px dashed #CBD5E1'
              }}
            >
              <FileText size={48} className="mx-auto mb-4" style={{ color: '#94A3B8' }} />
              <p className="mb-4" style={{ color: '#64748B' }}>No submissions yet</p>
              <Link
                to="/submit"
                className="inline-flex items-center font-medium hover:underline"
                style={{ color: '#2563EB' }}
              >
                Create your first submission
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-5 rounded-lg transition-all hover:shadow-lg"
                  style={{
                    border: '2px solid #E2E8F0',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-3" style={{ color: '#0B1C4D' }}>
                        {submission.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span style={{ color: '#64748B' }}>
                          Last updated: {new Date(submission.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span
                          className="px-3 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: submission.status === 'draft' ? '#F1F5F9' :
                              submission.status === 'submitted' ? '#EFF6FF' :
                                submission.status === 'under_review' ? '#FEF3C7' :
                                  submission.status === 'accepted' ? '#DCFCE7' :
                                    submission.status === 'rejected' ? '#FEE2E2' :
                                      submission.status === 'published' ? '#F3E8FF' : '#F1F5F9',
                            color: submission.status === 'draft' ? '#475569' :
                              submission.status === 'submitted' ? '#1E3A8A' :
                                submission.status === 'under_review' ? '#78350F' :
                                  submission.status === 'accepted' ? '#14532D' :
                                    submission.status === 'rejected' ? '#7F1D1D' :
                                      submission.status === 'published' ? '#581C87' : '#475569',
                            border: `2px solid ${submission.status === 'draft' ? '#CBD5E1' :
                              submission.status === 'submitted' ? '#93C5FD' :
                                submission.status === 'under_review' ? '#FDE047' :
                                  submission.status === 'accepted' ? '#86EFAC' :
                                    submission.status === 'rejected' ? '#FCA5A5' :
                                      submission.status === 'published' ? '#C084FC' : '#CBD5E1'
                              }`
                          }}
                        >
                          {getStatusLabel(submission.status)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {submission.status === 'draft' ? (
                        <Link
                          to={`/submit?id=${submission.id}`}
                          className="font-medium hover:underline text-sm"
                          style={{ color: '#2563EB' }}
                        >
                          Continue
                        </Link>
                      ) : (
                        <Link
                          to={`/submissions/${submission.id}`}
                          className="font-medium hover:underline text-sm"
                          style={{ color: '#2563EB' }}
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}