// API Queries - REST API Implementation (real REST API only)
import {
  apiClient,
  User,
  Journal,
  Submission,
  ReviewAssignment,
  JournalPublicationCertificate,
  ReviewerRecognitionCertificate,
  TopicArea,
  EditorialBoardMember,
  Article,
  IssueBuilderCandidate,
  MakeIssuePayload,
  PublishedIssueDetail,
  PublishedIssueSummary,
  TokenManager,
} from './api';

export const ACTIVE_ROLE_CHANGED_EVENT = 'ejournal:active-role-changed';
export const ROLE_SELECTION_REQUIRED_KEY = 'ejournal:role-selection-required';

// The active role is remembered per journal, since a user can hold different
// roles in different journals (e.g. editor of one, plain author of another).
export function activeRoleStorageKey(journalSlug: string): string {
  return `active_role:${journalSlug}`;
}

function emitActiveRoleChanged(journalSlug: string, role: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ACTIVE_ROLE_CHANGED_EVENT, {
      detail: { journalSlug, role },
    })
  );
}

export function getApprovedRolesFromUser(user: User | null, journalSlug: string | null): string[] {
  if (!user || !journalSlug) {
    return [];
  }

  const memberships = user.memberships.filter((m) => m.journal_slug === journalSlug);
  const approvedRoles: string[] = [];

  if (memberships.some((m) => m.role === 'editor' && m.status === 'approved')) {
    approvedRoles.push('editor');
  }
  if (memberships.some((m) => m.role === 'reviewer' && m.status === 'approved')) {
    approvedRoles.push('reviewer');
  }
  if (memberships.some((m) => m.role === 'author')) {
    approvedRoles.push('author');
  }

  return approvedRoles;
}

export function getRoleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function getStoredActiveRole(journalSlug: string): string | null {
  return localStorage.getItem(activeRoleStorageKey(journalSlug));
}

export function clearStoredActiveRole(journalSlug: string) {
  localStorage.removeItem(activeRoleStorageKey(journalSlug));
  emitActiveRoleChanged(journalSlug, null);
}

function persistActiveRole(journalSlug: string, role: string) {
  localStorage.setItem(activeRoleStorageKey(journalSlug), role);
  emitActiveRoleChanged(journalSlug, role);
}

// ==========================================
// AUTH QUERIES
// ==========================================

export async function signup(data: {
  email: string;
  password: string;
  full_name: string;
  affiliation: string;
  country: string;
  journal_slug: string;
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
    sessionStorage.setItem(ROLE_SELECTION_REQUIRED_KEY, '1');
  }

  return result;
}

export async function logout(): Promise<void> {
  TokenManager.clearTokens();
  sessionStorage.removeItem(ROLE_SELECTION_REQUIRED_KEY);
}

export async function verifyEmail(token: string): Promise<{ data: any; error: any }> {
  return await apiClient.post('/auth/verify-email', { token });
}

export async function resendVerificationEmail(email: string): Promise<{ data: any; error: any }> {
  return await apiClient.post('/auth/resend-verification', { email });
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
  google_scholar_url?: string;
}): Promise<{ data: User | null; error: any }> {
  return await apiClient.patch<User>('/me', updates);
}

export async function getMyRoles(journalSlug: string): Promise<string[]> {
  const user = await getCurrentUser();
  return getApprovedRolesFromUser(user, journalSlug);
}

export async function getMyApprovedRoles(journalSlug: string): Promise<string[]> {
  const user = await getCurrentUser();
  return getApprovedRolesFromUser(user, journalSlug);
}

export async function getMyActiveRole(journalSlug: string): Promise<string | null> {
  const roles = await getMyApprovedRoles(journalSlug);
  const storedRole = getStoredActiveRole(journalSlug);
  if (storedRole && roles.includes(storedRole)) {
    return storedRole;
  }
  return roles.length === 1 ? roles[0] : null;
}

export async function setMyActiveRole(
  journalSlug: string,
  role: string,
  user?: User | null
): Promise<boolean> {
  // Active role is managed client-side, stored in localStorage (per journal)
  const roles = user ? getApprovedRolesFromUser(user, journalSlug) : await getMyApprovedRoles(journalSlug);
  if (roles.includes(role)) {
    persistActiveRole(journalSlug, role);
    return true;
  }
  return false;
}

export async function initializeActiveRole(
  journalSlug: string,
  user?: User | null,
  options?: { forceSelectionForMultipleRoles?: boolean }
): Promise<string | null> {
  const roles = user ? getApprovedRolesFromUser(user, journalSlug) : await getMyApprovedRoles(journalSlug);
  if (roles.length === 0) {
    clearStoredActiveRole(journalSlug);
    return null;
  }

  const storedRole = getStoredActiveRole(journalSlug);
  if (storedRole && roles.includes(storedRole)) {
    if (options?.forceSelectionForMultipleRoles && roles.length > 1) {
      clearStoredActiveRole(journalSlug);
      return null;
    }
    return storedRole;
  }

  if (roles.length === 1) {
    persistActiveRole(journalSlug, roles[0]);
    return roles[0];
  }

  clearStoredActiveRole(journalSlug);
  return null;
}

// ==========================================
// CERTIFICATES
// ==========================================

export async function getMyCertificates(): Promise<ReviewerRecognitionCertificate[]> {
  const { data, error } = await apiClient.get<ReviewerRecognitionCertificate[]>('/certificates/my/');
  if (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
  return data || [];
}

export async function getPublicCertificateByCode(
  code: string
): Promise<ReviewerRecognitionCertificate | null> {
  const { data, error } = await apiClient.get<ReviewerRecognitionCertificate>(
    `/certificates/public/${code}/`
  );
  if (error) {
    console.error('Error fetching certificate by code:', error);
    return null;
  }
  return data;
}

export async function getPublicJournalCertificateByCode(
  code: string
): Promise<JournalPublicationCertificate | null> {
  const { data, error } = await apiClient.get<JournalPublicationCertificate>(
    `/certificates/journal/public/${code}/`
  );
  if (error) {
    console.error('Error fetching journal certificate by code:', error);
    return null;
  }
  return data;
}

// ==========================================
// TOPIC AREAS
// ==========================================

export async function getTopicAreas(): Promise<TopicArea[]> {
  const { data, error } = await apiClient.get<TopicArea[]>('/topic-areas/');
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
  const endpoint = role ? `/editorial-board/?role=${role}` : '/editorial-board/';
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
  const { data, error } = await apiClient.get<Submission[]>('/submissions/');
  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  return data || [];
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const { data, error } = await apiClient.get<Submission>(`/submissions/${id}/`);
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
  return await apiClient.patch<Submission>(`/submissions/${id}/`, updates);
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

// ==========================================
// REVIEWER - ASSIGNMENTS
// ==========================================

export async function getMyAssignments(): Promise<ReviewAssignment[]> {
  const { data, error } = await apiClient.get<ReviewAssignment[]>('/reviewer/assignments/');
  if (error) {
    console.error('Error fetching review assignments:', error);
    const detail =
      typeof error?.detail === 'string'
        ? error.detail
        : 'Failed to load reviewer assignments.';
    throw new Error(detail);
  }
  return data || [];
}

export async function getAssignmentById(id: string): Promise<ReviewAssignment | null> {
  const { data, error } = await apiClient.get<ReviewAssignment>(`/reviewer/assignments/${id}/`);
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

export async function declineByToken(token: string): Promise<{ data: any; error: any }> {
  return await apiClient.post('/reviewer/decline-by-token/', { token });
}

// ==========================================
// PUBLIC - ARTICLES
// ==========================================

export async function getPublishedArticles(): Promise<Article[]> {
  const { data, error } = await apiClient.get<Article[]>('/articles/');
  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  return data || [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await apiClient.get<Article>(`/articles/${slug}/`);
  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }
  return data;
}

export async function getPublishedIssues(): Promise<PublishedIssueSummary[]> {
  const { data, error } = await apiClient.get<PublishedIssueSummary[]>('/published/issues/');
  if (error) {
    console.error('Error fetching published issues:', error);
    return [];
  }
  return data || [];
}

export async function getPublishedIssueById(issueId: string): Promise<PublishedIssueDetail | null> {
  const { data, error } = await apiClient.get<PublishedIssueDetail>(`/published/issues/${issueId}/`);
  if (error) {
    console.error('Error fetching published issue detail:', error);
    return null;
  }
  return data;
}

// ==========================================
// EDITOR - SUBMISSIONS MANAGEMENT
// ==========================================

export async function getAllSubmissions(status?: string): Promise<Submission[]> {
  const endpoint = status ? `/editor/submissions/?status=${status}` : '/editor/submissions/';
  const { data, error } = await apiClient.get<Submission[]>(endpoint);
  if (error) {
    console.error('Error fetching editor submissions:', error);
    return [];
  }
  return data || [];
}

export async function getSubmissionByIdForEditor(id: string): Promise<Submission | null> {
  const { data, error } = await apiClient.get<Submission>(`/editor/submissions/${id}/`);
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

export async function generateSubmissionDoi(
  id: string
): Promise<{ data: { id: number; doi: string; doi_status: string } | null; error: any }> {
  return await apiClient.post<{ id: number; doi: string; doi_status: string }>(
    `/editor/submissions/${id}/generate-doi/`,
    {}
  );
}

export async function remindReviewer(assignmentId: string): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/editor/review-assignments/${assignmentId}/remind/`, {});
}

export async function getEditorIssues(): Promise<PublishedIssueDetail[]> {
  const { data, error } = await apiClient.get<PublishedIssueDetail[]>('/editor/issues/');
  if (error) {
    console.error('Error fetching editor issues:', error);
    return [];
  }
  return data || [];
}

export async function getAcceptedSubmissionsForIssue(): Promise<IssueBuilderCandidate[]> {
  const { data, error } = await apiClient.get<IssueBuilderCandidate[]>(
    '/editor/issues/accepted-submissions/'
  );
  if (!error) {
    return data || [];
  }

  console.error('Error fetching accepted submissions for issue:', error);

  // Backward-compat fallback for environments where /editor/issues/* endpoints are not deployed yet.
  const fallback = await apiClient.get<Submission[]>('/editor/submissions/');
  if (fallback.error) {
    console.error('Fallback error fetching editor submissions:', fallback.error);
    return [];
  }

  return (fallback.data || [])
    .filter((submission) => submission.status === 'accepted' || submission.status === 'published')
    .map((submission) => {
      const dynamicSubmission = submission as Submission & {
        author_name?: string;
        author_email?: string;
        author_full_name?: string;
      };
      const authorName =
        dynamicSubmission.author_name ||
        dynamicSubmission.author_full_name ||
        (typeof submission.author === 'number' ? `Author #${submission.author}` : 'Unknown');

      return {
        id: submission.id,
        status: submission.status,
        title: submission.title || 'Untitled',
        author_name: authorName,
        author_email: dynamicSubmission.author_email || '',
        created_at: submission.created_at || '',
        updated_at: submission.updated_at || '',
        manuscript_pdf_url: submission.manuscript_pdf || null,
        manuscript_page_count:
          submission.page_start && submission.page_end
            ? Math.max(1, submission.page_end - submission.page_start + 1)
            : null,
        is_already_assigned: Boolean(submission.issue?.id),
        issue: submission.issue?.id || null,
        issue_order: submission.issue_order || null,
        page_start: submission.page_start || null,
        page_end: submission.page_end || null,
      } as IssueBuilderCandidate;
    });
}

export async function makeJournalIssue(
  payload: MakeIssuePayload
): Promise<{ data: PublishedIssueDetail | null; error: any }> {
  return await apiClient.post<PublishedIssueDetail>('/editor/issues/', payload);
}

export async function updateJournalIssue(
  issueId: string,
  payload: MakeIssuePayload
): Promise<{ data: PublishedIssueDetail | null; error: any }> {
  return await apiClient.put<PublishedIssueDetail>(`/editor/issues/${issueId}/`, payload);
}

// ==========================================
// ADMIN - USER MANAGEMENT
// ==========================================

export async function approveReviewer(userId: number): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/admin/users/${userId}/approve-reviewer`, {});
}

export async function approveEditor(userId: number): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/admin/users/${userId}/approve-editor`, {});
}

export async function rejectReviewer(
  userId: number,
  reason: string
): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/admin/users/${userId}/reject-reviewer`, {
    reason,
  });
}

export async function rejectEditor(
  userId: number,
  reason: string
): Promise<{ data: any; error: any }> {
  return await apiClient.post(`/admin/users/${userId}/reject-editor`, {
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
  const { data, error } = await apiClient.get<any[]>('/editor/reviewers');
  if (error) {
    console.error('Error fetching reviewers:', error);
    return [];
  }
  return data || [];
};

export const getMyRole = async (journalSlug: string): Promise<string | null> => {
  const roles = await getMyApprovedRoles(journalSlug);
  const storedRole = getStoredActiveRole(journalSlug);

  if (storedRole && roles.includes(storedRole)) {
    return storedRole;
  }

  if (roles.includes('editor')) {
    return 'editor';
  }

  if (roles.includes('reviewer')) {
    return 'reviewer';
  }

  if (roles.includes('author')) {
    return 'author';
  }

  return null;
};

export const getMyRoleRequests = async (journalSlug: string): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const requests: Array<{
    id: string;
    requested_role: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
  }> = [];

  for (const membership of user.memberships) {
    if (membership.journal_slug !== journalSlug) continue;
    if (membership.role === 'reviewer' || membership.role === 'editor') {
      requests.push({
        id: membership.role,
        requested_role: membership.role,
        status: membership.status,
        created_at: user.date_joined,
      });
    }
  }

  return requests;
};

export const getSubmissionsByStatus = async (status: string): Promise<Submission[]> => {
  return await getAllSubmissions(status);
};

// ==========================================
// JOURNAL DIRECTORY (GLOBAL, NOT JOURNAL-SCOPED)
// ==========================================

export async function getJournals(): Promise<Journal[]> {
  const { data, error } = await apiClient.get<Journal[]>('/journals/');
  if (error) {
    console.error('Error fetching journals:', error);
    return [];
  }
  return data || [];
}

export async function getJournalBySlug(slug: string): Promise<Journal | null> {
  const { data, error } = await apiClient.get<Journal>(`/journals/${slug}/`);
  if (error) {
    console.error('Error fetching journal:', error);
    return null;
  }
  return data;
}
