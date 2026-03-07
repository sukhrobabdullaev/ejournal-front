# Dashboard Counts Fix

## Issue
The Editor Dashboard was showing 0 for all submission counts even though submissions were visible in the "All Submissions" list.

## Root Cause
The dashboard was only counting 4 statuses:
- `submitted` (New Submissions)
- `under_review` (Under Review)  
- `accepted` (Accepted)
- `rejected` (Rejected)

But submissions can have **`screening`** status, which wasn't being counted at all!

## Fix Applied

### 1. Added `screening` Count
```typescript
const screeningCount = allSubmissions.filter((s) => s.status === 'screening').length;
```

### 2. Updated Dashboard Cards
Changed from 4 cards to show:
- **New Submissions** (submitted)
- **Screening** (screening) ← NEW!
- **Under Review** (under_review)
- **Completed** (accepted + rejected combined)

### 3. Added Debug Logging
```typescript
console.log('[EditorDashboard] Status values:', allSubmissions.map(s => ({ id: s.id, status: s.status })));
```

This will help identify any other status values that might appear.

## Submission Status Flow

```
draft → submitted → screening → under_review → decision_pending → accepted/rejected → published
```

## What to Check

1. Open browser console
2. Look for logs showing:
   ```
   [EditorDashboard] Status values: [...]
   [EditorDashboard] Counts: { ... }
   ```
3. Verify the counts match the actual submission statuses

## Possible Status Values

Based on the codebase, submissions can have these statuses:
- `draft` - Work in progress
- `submitted` - Submitted by author
- `screening` - Initial editorial screening
- `under_review` - Sent to reviewers
- `decision_pending` - Awaiting editorial decision
- `revision_required` - Needs author revisions
- `resubmitted` - Author resubmitted after revisions
- `accepted` - Accepted for publication
- `rejected` - Rejected
- `desk_rejected` - Rejected without review
- `published` - Published

## Testing

After this fix:
- Refresh the dashboard
- Check the console logs
- Verify counts show up correctly
- The "Screening" card should now show submissions in screening status
