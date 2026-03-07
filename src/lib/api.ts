// API Client for E-Journal REST API
// Base URL configuration
const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_BASE_URL) ||
  'https://api.uzfintex.uz/api';

console.log('[API Client] Base URL:', API_BASE_URL);

// Token management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'ejournal_access_token';
  private static REFRESH_TOKEN_KEY = 'ejournal_refresh_token';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
  }

  static setAccessToken(access: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

// API Client
export class APIClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Subscriber pattern for token refresh
  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setAccessToken(data.access);
        return data.access;
      }

      // Refresh token invalid
      TokenManager.clearTokens();
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      TokenManager.clearTokens();
      return null;
    }
  }

  // Main request method with automatic token refresh
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: any }> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    console.log(`[API Request] ${options.method || 'GET'} ${url}`);

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Add Content-Type if not multipart/form-data
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      let response = await fetch(url, { ...options, headers });

      console.log(`[API Response] ${response.status} ${response.statusText}`);

      // Handle 401 - try to refresh token
      if (response.status === 401 && accessToken) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;

          if (newToken) {
            this.onTokenRefreshed(newToken);
            // Retry original request with new token
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, { ...options, headers });
          } else {
            // Redirect to login
            window.location.href = '/login';
            return { data: null, error: { detail: 'Session expired' } };
          }
        } else {
          // Wait for token refresh
          const newToken = await new Promise<string>((resolve) => {
            this.subscribeTokenRefresh(resolve);
          });
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        }
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        console.error(`[API Error] ${response.status}:`, data);
        return { data: null, error: data || { detail: 'Request failed' } };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('[API Request Error]:', error);
      console.error('[API Request URL]:', url);
      console.error('[API Request Method]:', options.method || 'GET');

      // Return a user-friendly error
      return {
        data: null,
        error: {
          detail: `Network error: ${error.message || 'Unable to connect to server'}. Please check if the API is running and reachable.`,
          originalError: error.message,
        },
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: any): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Singleton instance
export const apiClient = new APIClient();
export { TokenManager };

// Type definitions based on API spec
export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'screening'
  | 'desk_rejected'
  | 'under_review'
  | 'revision_required'
  | 'resubmitted'
  | 'decision_pending'
  | 'accepted'
  | 'rejected'
  | 'published'
  | 'withdrawn';

export type AssignmentStatus = 'invited' | 'accepted' | 'declined' | 'review_submitted' | 'expired';

export type Recommendation = 'accept' | 'minor_revision' | 'major_revision' | 'reject';

export type EditorialDecision = 'accept' | 'reject' | 'revision_required';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | null;

export interface User {
  id: number;
  email: string;
  full_name: string;
  affiliation: string;
  country: string;
  orcid_id: string;
  is_email_verified: boolean;
  roles: string[];
  reviewer_status: ApprovalStatus;
  editor_status: ApprovalStatus;
  date_joined: string;
}

export interface TopicArea {
  id: number;
  name: string;
  slug: string;
}

export interface SupplementaryFile {
  id: number;
  file: string;
  name: string;
  created_at: string;
}

export interface Submission {
  id: number;
  status: SubmissionStatus;
  title: string;
  abstract: string;
  keywords: string[];
  topic_area?: TopicArea;
  topic_area_id: number;
  originality_confirmation: boolean;
  plagiarism_agreement: boolean;
  ethics_compliance: boolean;
  copyright_agreement: boolean;
  manuscript_pdf: string;
  supplementary_files: SupplementaryFile[];
  created_at: string;
  updated_at: string;
  author?: number;
  desk_reject_reason?: string;
  editorial_decision?: string;
  decision_letter?: string;
  review_assignments?: ReviewAssignment[];
}

export interface Review {
  summary: string;
  strengths: string;
  weaknesses: string;
  confidential_to_editor: string;
  recommendation: Recommendation;
  submitted_at: string;
}

export interface ReviewAssignment {
  id: number;
  submission: number;
  submission_title: string;
  submission_abstract: string;
  submission_version?: { id: number; version_number: number };
  manuscript_url: string;
  status: AssignmentStatus;
  due_date: string;
  invited_at: string;
  responded_at: string | null;
  reviewer?: number;
  reviewer_email: string;
  review?: Review | null;
}

export interface ArticleAuthor {
  full_name: string;
  affiliation?: string;
  orcid?: string;
  is_corresponding?: boolean;
  author_order?: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  keywords: string[];
  topic_tags?: string[];
  authors?: ArticleAuthor[];
  published_at?: string;
  received_at?: string;
  accepted_at?: string;
  doi?: string;
  pdf_public_url?: string;
  status?: string;
}

export interface EditorialBoardMember {
  id: number;
  name: string;
  affiliation: string;
  expertise: string[];
  email: string;
  linkedin_url: string;
  profile_image_url: string;
  role: string;
}

export interface Reviewer {
  id: number;
  email: string;
  full_name: string;
  affiliation: string;
  country: string;
  is_approved_reviewer: boolean;
}
