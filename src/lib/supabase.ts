import { createClient } from '@supabase/supabase-js@2.39.0';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// Type definitions
export interface Journal {
  id: string;
  slug: string;
  name: string;
  short_name?: string;
  tagline?: string;
  description?: string;
  scope?: string;
  issn_print?: string;
  issn_online?: string;
  doi_prefix?: string;
  publisher?: string;
  created_at?: string;
  is_active?: boolean;
}

export interface Article {
  id: string;
  slug: string;
  journal_id: string;
  title: string;
  abstract: string;
  keywords: string[];
  topic_tags?: string[];
  authors?: string[];
  published_at?: string;
  received_at?: string;
  accepted_at?: string;
  doi?: string;
  pdf_public_url?: string;
  status?: string;
}

export interface Author {
  full_name: string;
  affiliation?: string;
  orcid?: string;
  is_corresponding?: boolean;
  author_order?: number;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  affiliation?: string;
  orcid?: string;
  country?: string;
  created_at?: string;
  active_role?: string;
}

export interface Submission {
  id: string;
  author_user_id: string;
  journal_id: string;
  title: string;
  abstract?: string;
  keywords?: string[];
  topic?: string;
  topic_area?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'revision_required' | 'accepted' | 'rejected' | 'published';
  step?: number;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_type: 'manuscript_pdf' | 'supplementary';
  storage_path: string;
  original_filename: string;
  file_size?: number;
  uploaded_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'author' | 'reviewer' | 'editor' | 'admin';
  created_at: string;
}

export interface ReviewAssignment {
  id: string;
  submission_id: string;
  reviewer_id: string;
  assigned_by?: string;
  status: 'invited' | 'accepted' | 'declined' | 'completed';
  invite_token: string;
  invited_at: string;
  accepted_at?: string;
  declined_at?: string;
  completed_at?: string;
  decision?: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  comments?: string;
  created_at: string;
  updated_at: string;
}