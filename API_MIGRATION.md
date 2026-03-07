# API Reorganization - React Query Hooks

## Overview
The API layer has been completely reorganized using React Query hooks pattern for better organization, type safety, and developer experience.

## New Structure

```
src/api/
├── endpoints.ts              # Centralized API endpoints registry
└── hooks/
    ├── index.ts              # Main export file
    ├── useAuth.ts            # Authentication hooks
    ├── useSubmissions.ts     # Submission hooks (author)
    ├── useReviewer.ts        # Reviewer hooks
    ├── useEditor.ts          # Editor hooks
    └── usePublic.ts          # Public API hooks
```

## Benefits

### ✅ **Centralized Endpoints**
All API endpoints in one place - easy to find and update.

```typescript
// src/api/endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    // ...
  },
  submissions: {
    list: '/submissions/',
    detail: (id: string) => `/submissions/${id}`,
    // ...
  },
  // ...
};
```

### ✅ **Type-Safe Hooks**
Full TypeScript support with proper types.

### ✅ **Automatic Cache Management**
React Query handles caching, refetching, and invalidation.

### ✅ **Better Organization**
Hooks grouped by feature/domain.

### ✅ **Less Boilerplate**
No need to manually manage loading/error states.

### ✅ **Optimistic Updates**
Built-in support for optimistic UI updates.

## Migration Guide

### Before (Old API)
```typescript
// Old way - using queries-api.ts
import { login, getCurrentUser, getMySubmissions } from '../lib/queries-api';

function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, []);
  
  const handleLogin = async (email, password) => {
    setLoading(true);
    const { data, error } = await login(email, password);
    // Handle response...
    setLoading(false);
  };
}
```

### After (New Hooks)
```typescript
// New way - using React Query hooks
import { useCurrentUser, useLogin } from '../api/hooks';

function MyComponent() {
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  
  const handleLogin = (email, password) => {
    loginMutation.mutate({ email, password }, {
      onSuccess: () => {
        // Navigate or show success
      },
      onError: (error) => {
        // Handle error
      },
    });
  };
}
```

## Available Hooks

### 🔐 Authentication (`useAuth.ts`)

```typescript
import {
  useCurrentUser,      // Get current logged-in user
  useLogin,            // Login mutation
  useLogout,           // Logout mutation
  useSignup,           // Signup mutation
  useVerifyEmail,      // Email verification mutation
  useResendVerification, // Resend verification email
  useMyRole,           // Get user's primary role
  useUpdateProfile,    // Update user profile
} from '../api/hooks';

// Example usage
const { data: user, isLoading } = useCurrentUser();
const loginMutation = useLogin();
const logoutMutation = useLogout();
```

### 📄 Submissions (`useSubmissions.ts`)

```typescript
import {
  useSubmissions,           // Get all user's submissions
  useSubmission,            // Get single submission
  useCreateSubmission,      // Create new submission
  useUpdateSubmission,      // Update submission
  useUploadSubmissionFile,  // Upload file to submission
  useSubmitSubmission,      // Submit for review
  useResubmitSubmission,    // Resubmit after revisions
  useDeleteSubmission,      // Delete submission
} from '../api/hooks';

// Example usage
const { data: submissions, isLoading } = useSubmissions();
const createMutation = useCreateSubmission();
const uploadMutation = useUploadSubmissionFile();
```

### 👨‍🔬 Reviewer (`useReviewer.ts`)

```typescript
import {
  useReviewAssignments,     // Get all review assignments
  useReviewAssignment,      // Get single assignment
  useAcceptReview,          // Accept review invitation
  useDeclineReview,         // Decline review invitation
  useSubmitReview,          // Submit review
  useAcceptByToken,         // Accept via email token
  useDeclineByToken,        // Decline via email token
} from '../api/hooks';

// Example usage
const { data: assignments } = useReviewAssignments();
const acceptMutation = useAcceptReview();
```

### 📝 Editor (`useEditor.ts`)

```typescript
import {
  useEditorSubmissions,      // Get all submissions (editor view)
  useEditorSubmission,       // Get single submission (editor view)
  useStartScreening,         // Move to screening
  useDeskReject,             // Desk reject submission
  useSendToReview,           // Send to review
  useInviteReviewer,         // Invite reviewer
  useMoveToDecision,         // Move to decision
  useMakeEditorialDecision,  // Make editorial decision
  usePublishSubmission,      // Publish submission
  useRemindReviewer,         // Send reminder to reviewer
} from '../api/hooks';

// Example usage
const { data: submissions } = useEditorSubmissions();
const inviteMutation = useInviteReviewer();
```

### 🌐 Public API (`usePublic.ts`)

```typescript
import {
  useArticles,          // Get published articles
  useArticle,           // Get single article
  useTopicAreas,        // Get topic areas
  useEditorialBoard,    // Get editorial board members
} from '../api/hooks';

// Example usage
const { data: articles } = useArticles();
const { data: topicAreas } = useTopicAreas();
```

## Query Keys

Each hook file exports `QUERY_KEYS` for advanced usage:

```typescript
import { QUERY_KEYS as AUTH_KEYS } from '../api/hooks/useAuth';

// Manually invalidate cache
queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser });

// Prefetch data
queryClient.prefetchQuery({
  queryKey: AUTH_KEYS.currentUser,
  queryFn: fetchUser,
});
```

## Common Patterns

### 1. **Query Hook (GET data)**

```typescript
function MyComponent() {
  const { data, isLoading, error } = useSubmissions();
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return <div>{data?.map(...)}</div>;
}
```

### 2. **Mutation Hook (POST/PUT/DELETE)**

```typescript
function MyComponent() {
  const mutation = useCreateSubmission();
  
  const handleCreate = () => {
    mutation.mutate(
      { title: 'My Paper' },
      {
        onSuccess: (data) => {
          console.log('Created:', data);
        },
        onError: (error) => {
          console.error('Failed:', error);
        },
      }
    );
  };
  
  return (
    <button 
      onClick={handleCreate}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Creating...' : 'Create'}
    </button>
  );
}
```

### 3. **Dependent Queries**

```typescript
function SubmissionDetail({ id }: { id: string }) {
  const { data: submission } = useSubmission(id);
  const { data: topicAreas } = useTopicAreas();
  
  // Both queries run in parallel
  // topicAreas can be used to display dropdown
}
```

### 4. **Optimistic Updates**

```typescript
function UpdateSubmission({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const mutation = useUpdateSubmission();
  
  const handleUpdate = (updates: Partial<Submission>) => {
    mutation.mutate(
      { id, updates },
      {
        onMutate: async (variables) => {
          // Optimistically update UI
          await queryClient.cancelQueries({ queryKey: ['submissions', id] });
          const previousData = queryClient.getQueryData(['submissions', id]);
          queryClient.setQueryData(['submissions', id], (old: any) => ({
            ...old,
            ...updates,
          }));
          return { previousData };
        },
        onError: (err, variables, context) => {
          // Rollback on error
          queryClient.setQueryData(['submissions', id], context?.previousData);
        },
      }
    );
  };
}
```

## Migration Checklist

### For Existing Components

- [ ] Replace `import { ... } from '../lib/queries-api'` 
- [ ] With `import { ... } from '../api/hooks'`
- [ ] Remove manual useState for loading/error
- [ ] Remove useEffect for data fetching
- [ ] Use query hooks for GET requests
- [ ] Use mutation hooks for POST/PUT/DELETE
- [ ] Update error handling to use mutation.error
- [ ] Update loading states to use mutation.isPending

### Example Migration

**Before:**
```typescript
const [submissions, setSubmissions] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    const data = await getMySubmissions();
    setSubmissions(data);
    setLoading(false);
  };
  fetch();
}, []);
```

**After:**
```typescript
const { data: submissions = [], isLoading: loading } = useSubmissions();
```

## Old API (`queries-api.ts`)

The old `queries-api.ts` file can be **kept for backward compatibility** during migration, or **removed once all components are updated**.

### Recommendation
1. Keep both during migration period
2. Update components one by one
3. Remove `queries-api.ts` when all components migrated
4. The new hooks use the same `apiClient` under the hood

## Performance Benefits

### 1. **Automatic Caching**
- Data fetched once, reused across components
- No duplicate API calls

### 2. **Background Refetching**
- Stale data automatically refetched
- Configurable stale time

### 3. **Request Deduplication**
- Multiple components requesting same data = 1 API call

### 4. **Automatic Retries**
- Failed requests automatically retried
- Configurable retry logic

## Advanced Usage

### Custom Query Options

```typescript
const { data } = useSubmissions({
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 30000,    // Refetch every 30s
  enabled: isLoggedIn,       // Conditional fetching
});
```

### Manual Refetch

```typescript
const { data, refetch } = useSubmissions();

<button onClick={() => refetch()}>Refresh</button>
```

### Pagination

```typescript
const [page, setPage] = useState(1);
const { data } = useSubmissions({ page });
```

## Testing

Hooks are easier to test with React Query Testing Library:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useSubmissions } from '../api/hooks';

test('fetches submissions', async () => {
  const { result } = renderHook(() => useSubmissions());
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(5);
});
```

## File Size Comparison

| File | Lines | Description |
|------|-------|-------------|
| `queries-api.ts` (old) | 477 | All APIs in one file |
| `endpoints.ts` | 54 | Endpoints registry |
| `useAuth.ts` | 145 | Auth hooks |
| `useSubmissions.ts` | 131 | Submission hooks |
| `useReviewer.ts` | 107 | Reviewer hooks |
| `useEditor.ts` | 168 | Editor hooks |
| `usePublic.ts` | 75 | Public hooks |
| **Total** | **680** | Better organized |

## Summary

### What Changed
✅ Centralized endpoint definitions  
✅ Hooks organized by feature  
✅ Automatic cache management  
✅ Better TypeScript support  
✅ Less boilerplate code  
✅ Easier testing  

### What Stayed the Same
✅ Same backend API  
✅ Same authentication flow  
✅ Same data types  
✅ Same UI behavior  

### Next Steps
1. Start migrating components one by one
2. Test thoroughly after each migration
3. Remove old `queries-api.ts` when done
4. Update documentation

## Questions?

The new hook-based API is more maintainable, performant, and follows React best practices. All hooks are fully typed and include JSDoc comments for better IDE support.
