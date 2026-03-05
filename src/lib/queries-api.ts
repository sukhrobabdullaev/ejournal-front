// API Queries - REST API Implementation (real REST API only)
import {
  apiClient,
  User,
  Submission,
  ReviewAssignment,
  TopicArea,
  EditorialBoardMember,
  TokenManager,
} from './api';

// ==========================================
// AUTH QUERIES
// ==========================================

export async function signup(data: {
  email: string;
  password: string;
  full_name: string;
  affiliation: string;
  country: string;
  roles: string[];
  why_to_be?: string;
}): Promise<{ data: any; error: any }> {
  return await apiClient.post('/auth/signup', data);
}

export async function login(
  email: string,
  password: string
): Promise<{ data: { access: string; refresh: string } | null; error: any }> {
  const result = await apiClient.post<{ access: string; refresh: string }>('/auth/login', {
    email,
    password,
  });

  if (result.data) {
    TokenManager.setTokens(result.data.access, result.data.refresh);
  }

  return result;
}

export async function logout(): Promise<void> {
  TokenManager.clearTokens();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await apiClient.get<User>('/me');
  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
  return data;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = TokenManager.getAccessToken();
  if (!token) return false;

  const user = await getCurrentUser();
  return user !== null;
}

// ==========================================
// USER PROFILE QUERIES
// ==========================================

export async function getMyProfile(): Promise<User | null> {
  return await getCurrentUser();
}

export async function updateMyProfile(updates: {
  full_name?: string;
  affiliation?: string;
  country?: string;
  orcid_id?: string;
}): Promise<{ data: User | null; error: any }> {
  return await apiClient.patch<User>('/me', updates);
}

export async function getMyRoles(): Promise<string[]> {
  const user = await getCurrentUser();
  return user?.roles || [];
}

export async function getMyActiveRole(): Promise<string | null> {
  const roles = await getMyRoles();
  return roles.length > 0 ? roles[0] : null;
}

export async function setMyActiveRole(role: string): Promise<boolean> {
  // Active role is managed client-side, stored in localStorage
  const roles = await getMyRoles();
  if (roles.includes(role)) {
    localStorage.setItem('active_role', role);
    return true;
  }
  return false;
}

export async function initializeActiveRole(): Promise<string | null> {
  const roles = await getMyRoles();
  if (roles.length === 0) return null;

  const storedRole = localStorage.getItem('active_role');
  if (storedRole && roles.includes(storedRole)) {
    return storedRole;
  }

  // Default to first role
  localStorage.setItem('active_role', roles[0]);
  return roles[0];
}

// ==========================================
// TOPIC AREAS
// ==========================================

export async function getTopicAreas(): Promise<TopicArea[]> {
  const { data, error } = await apiClient.get<TopicArea[]>('/topic-areas');
  if (error) {
    console.error('Error fetching topic areas:', error);
    return [];
  }
  return data || [];
}

// ==========================================
// EDITORIAL BOARD (PUBLIC)
// ==========================================

export async function getEditorialBoard(role?: string): Promise<EditorialBoardMember[]> {
  const endpoint = role ? `/editorial-board?role=${role}` : '/editorial-board';
  const { data, error } = await apiClient.get<EditorialBoardMember[]>(endpoint);
  if (error) {
    console.error('Error fetching editorial board:', error);
    return [];
  }
  return data || [];
}

// ==========================================
// AUTHOR - SUBMISSIONS
// ==========================================

export async function createSubmission(
  submissionData?: Partial<Submission>
): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>('/submissions/', submissionData || {});
}

export async function getMySubmissions(): Promise<Submission[]> {
  const { data, error } = await apiClient.get<Submission[]>('/submissions');
  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  return data || [];
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const { data, error } = await apiClient.get<Submission>(`/submissions/${id}`);
  if (error) {
    console.error('Error fetching submission:', error);
    return null;
  }
  return data;
}

export async function updateSubmission(
  id: string,
  updates: Partial<Submission>
): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/submissions/${id}/`, updates);
}

export async function uploadSubmissionFile(
  id: string,
  file: File,
  fileType: 'manuscript' | 'supplementary'
): Promise<{ data: { url: string; file_type: string } | null; error: any }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', fileType);
  return await apiClient.post(`/submissions/${id}/upload-file/`, formData);
}

export async function submitSubmission(
  id: string
): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/submissions/${id}/submit/`, {});
}

export async function resubmitSubmission(
  id: string
): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/submissions/${id}/resubmit/`, {});
}

export async function deleteSubmission(id: string): Promise<{ data: any; error: any }> {
  return await apiClient.delete(`/submissions/${id}`);
}

// ==========================================
// REVIEWER - ASSIGNMENTS
// ==========================================

export async function getMyAssignments(): Promise<ReviewAssignment[]> {
  const { data, error } = await apiClient.get<ReviewAssignment[]>('/reviewer/assignments');
  if (error) {
    console.error('Error fetching review assignments:', error);
    return [];
  }
  return data || [];
}

export async function getAssignmentById(id: string): Promise<ReviewAssignment | null> {
  const { data, error } = await apiClient.get<ReviewAssignment>(`/reviewer/assignments/${id}`);
  if (error) {
    console.error('Error fetching assignment:', error);
    return null;
  }
  return data;
}

export async function acceptReviewInvitation(
  id: string
): Promise<{ data: ReviewAssignment | null; error: any }> {
  return await apiClient.post<ReviewAssignment>(`/reviewer/assignments/${id}/accept/`, {});
}

export async function declineReviewInvitation(
  id: string
): Promise<{ data: ReviewAssignment | null; error: any }> {
  return await apiClient.post<ReviewAssignment>(`/reviewer/assignments/${id}/decline/`, {});
}

export async function submitReview(
  id: string,
  reviewData: {
    summary: string;
    strengths: string;
    weaknesses: string;
    confidential_to_editor: string;
    recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  }
): Promise<{ data: ReviewAssignment | null; error: any }> {
  return await apiClient.post<ReviewAssignment>(
    `/reviewer/assignments/${id}/submit-review/`,
    reviewData
  );
}

export async function getAssignmentByToken(token: string): Promise<ReviewAssignment | null> {
  const { data, error } = await apiClient.get<ReviewAssignment>(
    `/reviewer/accept-by-token/?token=${token}`
  );
  if (error) {
    console.error('Error fetching assignment by token:', error);
    return null;
  }
  return data;
}

export async function acceptByToken(token: string): Promise<{ data: any; error: any }> {
  return await apiClient.post('/reviewer/accept-by-token/', { token });
}

// ==========================================
// EDITOR - SUBMISSIONS MANAGEMENT
// ==========================================

export async function getAllSubmissions(status?: string): Promise<Submission[]> {
  const endpoint = status ? `/editor/submissions?status=${status}` : '/editor/submissions';
  const { data, error } = await apiClient.get<Submission[]>(endpoint);
  if (error) {
    console.error('Error fetching editor submissions:', error);
    return [];
  }
  return data || [];
}

export async function getSubmissionByIdForEditor(id: string): Promise<Submission | null> {
  const { data, error } = await apiClient.get<Submission>(`/editor/submissions/${id}`);
  if (error) {
    console.error('Error fetching submission for editor:', error);
    return null;
  }
  return data;
}

export async function startScreening(id: string): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/editor/submissions/${id}/start-screening/`, {});
}

export async function deskReject(
  id: string,
  reason: string
): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/editor/submissions/${id}/desk-reject/`, { reason });
}

export async function sendToReview(id: string): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/editor/submissions/${id}/send-to-review/`, {});
}

export async function inviteReviewer(
  submissionId: string,
  data: { reviewer_user_id?: number; reviewer_email?: string; due_date: string }
): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/editor/submissions/${submissionId}/invite-reviewer/`, data);
}

export async function moveToDecision(id: string): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/editor/submissions/${id}/move-to-decision/`, {});
}

export async function makeEditorialDecision(
  id: string,
  decision: 'accept' | 'reject' | 'revision_required',
  decisionLetter: string
): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/editor/submissions/${id}/decision/`, {
    decision,
    decision_letter: decisionLetter,
  });
}

export async function publishSubmission(
  id: string
): Promise<{ data: Submission | null; error: any }> {
  return await apiClient.post<Submission>(`/editor/submissions/${id}/publish/`, {});
}

export async function remindReviewer(assignmentId: string): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/editor/review-assignments/${assignmentId}/remind/`, {});
}

// ==========================================
// ADMIN - USER MANAGEMENT
// ==========================================

export async function approveReviewer(userId: number): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/admin/users/${userId}/approve-reviewer/`, {});
}

export async function approveEditor(userId: number): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/admin/users/${userId}/approve-editor/`, {});
}

export async function rejectReviewer(
  userId: number,
  reason: string
): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/admin/users/${userId}/reject-reviewer/`, {
    reason,
  });
}

export async function rejectEditor(
  userId: number,
  reason: string
): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/admin/users/${userId}/reject-editor/`, {
    reason,
  });
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export async function uploadFile(
  file: File
): Promise<{ data: { url: string } | null; error: any }> {
  const formData = new FormData();
  formData.append('file', file);
  return await apiClient.post<{ url: string }>('/upload-file', formData);
}

// Backward compatibility aliases
export const getSubmissionFiles = async (submissionId: string) => {
  const submission = await getSubmissionById(submissionId);
  return submission?.supplementary_files || [];
};

export const getReviewAssignments = async (submissionId: string) => {
  const submission = await getSubmissionByIdForEditor(submissionId);
  return submission?.review_assignments || [];
};

export const getAllReviewers = async (): Promise<any[]> => {
  // This endpoint doesn't exist in the API spec
  // Editors invite reviewers by email or user_id
  console.warn('getAllReviewers: This endpoint is not available in the REST API');
  return [];
};

export const getMyRole = async (): Promise<string | null> => {
  const roles = await getMyRoles();
  return roles.length > 0 ? roles[0] : null;
};

export const getMyRoleRequests = async (): Promise<any[]> => {
  // Role requests are handled differently in the new API
  // reviewer_status and editor_status indicate approval status
  const user = await getCurrentUser();
  if (!user) return [];

  const requests: Array<{
    id: string;
    requested_role: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
  }> = [];

  if (user.roles.includes('reviewer')) {
    requests.push({
      id: 'reviewer',
      requested_role: 'reviewer',
      status: user.reviewer_status || 'pending',
      created_at: user.date_joined,
    });
  }

  if (user.roles.includes('editor')) {
    requests.push({
      id: 'editor',
      requested_role: 'editor',
      status: user.editor_status || 'pending',
      created_at: user.date_joined,
    });
  }

  return requests;
};

export const getSubmissionsByStatus = async (status: string): Promise<Submission[]> => {
  return await getAllSubmissions(status);
};
