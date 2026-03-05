import {
  supabase,
  Journal,
  Article,
  Author,
  Profile,
  Submission,
  SubmissionFile,
} from './supabase';

// QUERY 1: getActiveJournals
export async function getActiveJournals(): Promise<Journal[]> {
  const { data, error } = await supabase
    .from('journals')
    .select(
      'id, slug, name, short_name, tagline, description, scope, issn_print, issn_online, doi_prefix, publisher, created_at'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching active journals:', error);
    return [];
  }

  return data || [];
}

// QUERY 2: getJournalBySlug
export async function getJournalBySlug(slug: string): Promise<Journal | null> {
  try {
    const { data, error } = await supabase
      .from('journals')
      .select(
        'id, slug, name, short_name, tagline, description, scope, issn_print, issn_online, doi_prefix, publisher, created_at, is_active'
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching journal by slug:', error);
      return null;
    }

    return data;
  } catch (err: any) {
    console.error('Error fetching journal by slug:', err);
    return null;
  }
}

// QUERY 3: getPublishedArticlesByJournal
export async function getPublishedArticlesByJournal(
  journalId: string,
  limit?: number
): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(
      'id, slug, title, abstract, keywords, topic_tags, published_at, doi, pdf_public_url, received_at, accepted_at'
    )
    .eq('journal_id', journalId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching published articles:', error);
    return [];
  }

  return data || [];
}

// QUERY 4: getArticleBySlug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(
      'id, slug, journal_id, title, abstract, keywords, topic_tags, published_at, received_at, accepted_at, doi, pdf_public_url, status'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }

  return data;
}

// QUERY 5: getAuthorsByArticle
export async function getAuthorsByArticle(articleId: string): Promise<Author[]> {
  const { data, error } = await supabase
    .from('article_authors')
    .select(
      `
      author_order,
      is_corresponding,
      authors (
        full_name,
        affiliation,
        orcid
      )
    `
    )
    .eq('article_id', articleId)
    .order('author_order', { ascending: true });

  if (error) {
    console.error('Error fetching authors for article:', error);
    return [];
  }

  // Transform the data to flatten the structure
  return (data || []).map((item: any) => ({
    full_name: item.authors.full_name,
    affiliation: item.authors.affiliation,
    orcid: item.authors.orcid,
    is_corresponding: item.is_corresponding,
    author_order: item.author_order,
  }));
}

// QUERY 6: getMyProfile
export async function getMyProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Try to fetch with active_role column
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, affiliation, orcid, country, created_at, active_role')
    .eq('id', user.id)
    .limit(1)
    .single();

  // If column doesn't exist, fetch without it
  if (error && error.code === '42703') {
    const result = await supabase
      .from('profiles')
      .select('id, full_name, email, affiliation, orcid, country, created_at')
      .eq('id', user.id)
      .limit(1)
      .single();

    if (result.error) {
      console.error('Error fetching user profile:', result.error);
      return null;
    }

    return result.data;
  }

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

// QUERY 7: getMySubmissions
export async function getMySubmissions(): Promise<Submission[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('submissions')
    .select(
      'id, author_user_id, journal_id, title, abstract, keywords, topic_area, status, created_at, updated_at'
    )
    .eq('author_user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user submissions:', error);
    return [];
  }

  return data || [];
}

// QUERY 8: getJournalIdBySlug
export async function getJournalIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('journals')
    .select('id')
    .eq('slug', slug)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching journal ID by slug:', error);
    return null;
  }

  return data?.id || null;
}

// QUERY 9: getSubmissionById
export async function getSubmissionById(submissionId: string): Promise<Submission | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('submissions')
    .select(
      'id, author_user_id, journal_id, title, abstract, keywords, topic_area, status, step, submitted_at, created_at, updated_at'
    )
    .eq('id', submissionId)
    .eq('author_user_id', user.id)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching submission by ID:', error);
    return null;
  }

  return data;
}

// QUERY 10: getSubmissionFiles
export async function getSubmissionFiles(submissionId: string): Promise<SubmissionFile[]> {
  const { data, error } = await supabase
    .from('submission_files')
    .select('*')
    .eq('submission_id', submissionId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching submission files:', error);
    return [];
  }

  return data || [];
}

// QUERY 11: getMyRole
export async function getMyRole(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role || null;
}

// QUERY 12: getSubmissionsByStatus (for editors)
export async function getSubmissionsByStatus(status: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      id,
      author_user_id,
      journal_id,
      title,
      abstract,
      keywords,
      topic_area,
      status,
      submitted_at,
      created_at,
      updated_at,
      profiles!submissions_author_user_id_fkey (
        full_name,
        email,
        affiliation
      )
    `
    )
    .eq('status', status)
    .order('submitted_at', { ascending: false });

  // If the foreign key relationship doesn't exist, fetch submissions without profiles
  if (error && error.code === 'PGRST200') {
    const result = await supabase
      .from('submissions')
      .select(
        `
        id,
        author_user_id,
        journal_id,
        title,
        abstract,
        keywords,
        topic_area,
        status,
        submitted_at,
        created_at,
        updated_at
      `
      )
      .eq('status', status)
      .order('submitted_at', { ascending: false });

    if (result.error) {
      console.error('Error fetching submissions by status:', result.error);
      return [];
    }

    // Manually fetch profiles for each submission
    if (result.data && result.data.length > 0) {
      const userIds = [...new Set(result.data.map((s) => s.author_user_id).filter(Boolean))];

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, affiliation')
          .in('id', userIds);

        if (profilesData) {
          const profileMap = new Map(profilesData.map((p) => [p.id, p]));

          return result.data.map((submission) => ({
            ...submission,
            profiles: profileMap.get(submission.author_user_id) || null,
          }));
        }
      }
    }

    return result.data || [];
  }

  if (error) {
    console.error('Error fetching submissions by status:', error);
    return [];
  }

  return data || [];
}

// QUERY 13: getAllSubmissions (for editors - with optional status filter)
export async function getAllSubmissions(statusFilter?: string): Promise<any[]> {
  let query = supabase.from('submissions').select(`
      id,
      author_user_id,
      journal_id,
      title,
      abstract,
      keywords,
      topic_area,
      status,
      submitted_at,
      created_at,
      updated_at,
      profiles!submissions_author_user_id_fkey (
        full_name,
        email,
        affiliation
      )
    `);

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  query = query.order('submitted_at', { ascending: false });

  const { data, error } = await query;

  // If the foreign key relationship doesn't exist, fetch submissions without profiles
  if (error && error.code === 'PGRST200') {
    const simpleQuery = supabase.from('submissions').select(`
        id,
        author_user_id,
        journal_id,
        title,
        abstract,
        keywords,
        topic_area,
        status,
        submitted_at,
        created_at,
        updated_at
      `);

    if (statusFilter) {
      simpleQuery.eq('status', statusFilter);
    }

    simpleQuery.order('submitted_at', { ascending: false });

    const result = await simpleQuery;

    if (result.error) {
      console.error('Error fetching all submissions:', result.error);
      return [];
    }

    // Manually fetch profiles for each submission
    if (result.data && result.data.length > 0) {
      const userIds = [...new Set(result.data.map((s) => s.author_user_id).filter(Boolean))];

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, affiliation')
          .in('id', userIds);

        if (profilesData) {
          // Create a map of user_id to profile
          const profileMap = new Map(profilesData.map((p) => [p.id, p]));

          // Attach profiles to submissions
          return result.data.map((submission) => ({
            ...submission,
            profiles: profileMap.get(submission.author_user_id) || null,
          }));
        }
      }
    }

    return result.data || [];
  }

  if (error) {
    console.error('Error fetching all submissions:', error);
    return [];
  }

  return data || [];
}

// QUERY 14: getReviewAssignments
export async function getReviewAssignments(submissionId: string): Promise<any[]> {
  console.log('[getReviewAssignments] Fetching assignments for submission:', submissionId);

  // Use reviewer_user_id (the correct column name) and try to join with profiles
  const { data, error } = await supabase
    .from('review_assignments')
    .select(
      `
      *,
      profiles:reviewer_user_id (
        id,
        full_name,
        email,
        affiliation
      )
    `
    )
    .eq('submission_id', submissionId)
    .order('invited_at', { ascending: false });

  // If foreign key doesn't exist, fetch separately
  if (error && error.code === 'PGRST200') {
    console.log('[getReviewAssignments] Foreign key not found, fetching separately...');

    const { data: assignmentsData, error: assignError } = await supabase
      .from('review_assignments')
      .select('*')
      .eq('submission_id', submissionId)
      .order('invited_at', { ascending: false });

    if (assignError) {
      console.error('[getReviewAssignments] Error:', assignError);
      return [];
    }

    console.log('[getReviewAssignments] Raw assignments:', assignmentsData);

    // Manually fetch profiles
    if (assignmentsData && assignmentsData.length > 0) {
      const reviewerIds = [
        ...new Set(assignmentsData.map((r) => r.reviewer_user_id).filter(Boolean)),
      ];

      console.log('[getReviewAssignments] Reviewer IDs to fetch:', reviewerIds);

      if (reviewerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, affiliation')
          .in('id', reviewerIds);

        if (profilesData) {
          console.log('[getReviewAssignments] Profiles fetched:', profilesData);
          const profileMap = new Map(profilesData.map((p) => [p.id, p]));

          return assignmentsData.map((assignment) => ({
            ...assignment,
            profiles: profileMap.get(assignment.reviewer_user_id) || null,
            reviewer_profile: profileMap.get(assignment.reviewer_user_id) || null,
          }));
        }
      }
    }

    return assignmentsData || [];
  }

  if (error) {
    console.error('[getReviewAssignments] Error:', error);
    return [];
  }

  console.log('[getReviewAssignments] Fetched with join:', data);
  return data || [];
}

// QUERY 15: getSubmissionByIdForEditor (no user restriction)
export async function getSubmissionByIdForEditor(submissionId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      id,
      author_user_id,
      journal_id,
      title,
      abstract,
      keywords,
      topic_area,
      status,
      step,
      submitted_at,
      created_at,
      updated_at,
      profiles!submissions_author_user_id_fkey (
        full_name,
        email,
        affiliation,
        orcid
      )
    `
    )
    .eq('id', submissionId)
    .limit(1)
    .single();

  // If the foreign key relationship doesn't exist, fetch submission without profile
  if (error && error.code === 'PGRST200') {
    const result = await supabase
      .from('submissions')
      .select(
        `
        id,
        author_user_id,
        journal_id,
        title,
        abstract,
        keywords,
        topic_area,
        status,
        step,
        submitted_at,
        created_at,
        updated_at
      `
      )
      .eq('id', submissionId)
      .limit(1)
      .single();

    if (result.error) {
      console.error('Error fetching submission by ID for editor:', result.error);
      return null;
    }

    // Manually fetch the profile
    if (result.data && result.data.author_user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, affiliation, orcid')
        .eq('id', result.data.author_user_id)
        .limit(1)
        .single();

      return {
        ...result.data,
        profiles: profileData || null,
      };
    }

    return result.data;
  }

  if (error) {
    console.error('Error fetching submission by ID for editor:', error);
    return null;
  }

  return data;
}

// REVIEWER QUERIES

// Get all review assignments for the current user
export async function getMyAssignments(): Promise<any[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('review_assignments')
    .select(
      `
      id,
      submission_id,
      invited_email,
      status,
      response_due_at,
      review_due_at,
      invited_at,
      submissions (
        id,
        title,
        abstract,
        keywords,
        topic_area,
        submitted_at
      )
    `
    )
    .eq('reviewer_user_id', session.user.id)
    .order('invited_at', { ascending: false });

  if (error) {
    console.error('Error fetching my assignments:', error);
    return [];
  }

  return data || [];
}

// Get existing review for an assignment
export async function getExistingReview(assignmentId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('assignment_id', assignmentId)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching existing review:', error);
  }

  return data || null;
}

// ROLES AND PERMISSIONS QUERIES

// Get all roles for the current user
export async function getMyRoles(): Promise<string[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  // Try to fetch with 'role' column first
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id);

  // If no data or error, try with 'user_role' column (backwards compatibility)
  if (error || !data || data.length === 0) {
    const result = await supabase
      .from('user_roles')
      .select('user_role')
      .eq('user_id', session.user.id);

    if (!result.error && result.data) {
      return result.data.map((r: any) => r.user_role).filter(Boolean);
    }
  }

  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  return data?.map((r) => r.role).filter(Boolean) || [];
}

// Get all role requests for the current user
export async function getMyRoleRequests(): Promise<any[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('role_requests')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching role requests:', error);
    return [];
  }

  return data || [];
}

// PHASE 2: Additional queries for review system

// Get all reviewers (profiles with reviewer role)
export async function getAllReviewers(): Promise<any[]> {
  console.log('[getAllReviewers] Fetching reviewers...');

  // First, let's check what's actually in the user_roles table
  const { data: allRoles, error: allRolesError } = await supabase
    .from('user_roles')
    .select('*')
    .limit(10);

  console.log('[getAllReviewers] Sample user_roles data:', allRoles);
  console.log(
    '[getAllReviewers] Column names:',
    allRoles && allRoles.length > 0 ? Object.keys(allRoles[0]) : 'No data'
  );

  // Try with 'role' column first
  let { data, error } = await supabase
    .from('user_roles')
    .select(
      `
      user_id,
      profiles!user_roles_user_id_fkey (
        id,
        full_name,
        email,
        affiliation,
        orcid
      )
    `
    )
    .eq('role', 'reviewer');

  // If 'role' column doesn't exist, try 'user_role' column
  if (error && (error.code === '42703' || error.message?.includes('column'))) {
    console.log('[getAllReviewers] Trying with user_role column...');
    const result = await supabase
      .from('user_roles')
      .select(
        `
        user_id,
        profiles!user_roles_user_id_fkey (
          id,
          full_name,
          email,
          affiliation,
          orcid
        )
      `
      )
      .eq('user_role', 'reviewer');

    data = result.data;
    error = result.error;
  }

  // If the foreign key relationship doesn't exist, fetch user_roles and profiles separately
  if (error && error.code === 'PGRST200') {
    console.log('[getAllReviewers] Foreign key not found, fetching separately...');

    // Try with 'role' column
    let result = await supabase
      .from('user_roles')
      .select('user_id, role, user_role')
      .eq('role', 'reviewer');

    console.log('[getAllReviewers] Query with role column result:', {
      data: result.data,
      error: result.error,
    });

    // If 'role' doesn't work, try 'user_role'
    if (
      (result.error &&
        (result.error.code === '42703' || result.error.message?.includes('column'))) ||
      !result.data ||
      result.data.length === 0
    ) {
      console.log('[getAllReviewers] Trying user_role column...');
      result = await supabase
        .from('user_roles')
        .select('user_id, role, user_role')
        .eq('user_role', 'reviewer');

      console.log('[getAllReviewers] Query with user_role column result:', {
        data: result.data,
        error: result.error,
      });
    }

    if (result.error) {
      console.error('[getAllReviewers] Error fetching reviewers:', result.error);
      return [];
    }

    console.log('[getAllReviewers] User roles data:', result.data);

    // Manually fetch profiles for each reviewer
    if (result.data && result.data.length > 0) {
      const userIds = result.data.map((r) => r.user_id).filter(Boolean);
      console.log('[getAllReviewers] Found reviewer user IDs:', userIds);

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, affiliation, orcid')
          .in('id', userIds);

        if (profilesError) {
          console.error('[getAllReviewers] Error fetching profiles:', profilesError);
          return [];
        }

        console.log('[getAllReviewers] Found reviewer profiles:', profilesData);
        return profilesData || [];
      }
    }

    console.log('[getAllReviewers] No user_ids found or empty result');
    return [];
  }

  if (error) {
    console.error('[getAllReviewers] Error fetching reviewers:', error);
    return [];
  }

  const reviewers = (data || []).map((item: any) => item.profiles).filter(Boolean);
  console.log('[getAllReviewers] Successfully fetched reviewers:', reviewers);
  return reviewers;
}

// Get review assignment by invite token
export async function getAssignmentByToken(token: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('review_assignments')
    .select(
      `
      *,
      submissions (
        id,
        title,
        abstract,
        keywords,
        topic_area,
        submitted_at
      )
    `
    )
    .eq('invite_token', token)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching assignment by token:', error);
    return null;
  }

  return data;
}

// Get my reviewer assignments (for reviewer dashboard)
export async function getMyReviewAssignments(): Promise<any[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Try with reviewer_id first
  const { data, error } = await supabase
    .from('review_assignments')
    .select(
      `
      *,
      submissions (
        id,
        title,
        abstract,
        keywords,
        topic_area,
        submitted_at,
        status
      )
    `
    )
    .eq('reviewer_id', user.id)
    .order('invited_at', { ascending: false });

  // If column doesn't exist or table doesn't exist, return empty array
  if (error) {
    if (error.code === '42703' || error.code === '42P01') {
      console.warn(
        'review_assignments table or reviewer_id column does not exist. Please run /phase2-migration'
      );
      return [];
    }
    console.error('Error fetching my review assignments:', error);
    return [];
  }

  return data || [];
}

// ACTIVE ROLE MANAGEMENT

// Get active role for current user
export async function getMyActiveRole(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('active_role')
    .eq('id', user.id)
    .limit(1)
    .single();

  // If column doesn't exist (error 42703), return null (no active role set)
  if (error && error.code === '42703') {
    return null;
  }

  if (error) {
    console.error('Error fetching active role:', error);
    return null;
  }

  return data?.active_role || null;
}

// Set active role for current user
export async function setMyActiveRole(role: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { error } = await supabase.from('profiles').update({ active_role: role }).eq('id', user.id);

  // If column doesn't exist, silently fail (migration not run yet)
  if (error && error.code === '42703') {
    console.warn('active_role column does not exist. Please run /roles-migration');
    return false;
  }

  if (error) {
    console.error('Error setting active role:', error);
    return false;
  }

  return true;
}

// Initialize active role (set to first available role if not set or invalid)
export async function initializeActiveRole(): Promise<string | null> {
  const roles = await getMyRoles();

  if (!roles || roles.length === 0) {
    return null;
  }

  const activeRole = await getMyActiveRole();

  // If active role is not set or not in the list of roles, set it to the first role
  if (!activeRole || !roles.includes(activeRole)) {
    const firstRole = roles[0];
    await setMyActiveRole(firstRole);
    return firstRole;
  }

  return activeRole;
}
