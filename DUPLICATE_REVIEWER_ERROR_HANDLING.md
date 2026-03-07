# Duplicate Reviewer Invitation Error Handling

## Overview

Enhanced the reviewer invitation system to gracefully handle cases where a reviewer has already been invited to a submission, preventing duplicate invitations and providing clear feedback to editors.

## The Problem

**Backend Error:**
```json
{
  "detail": "Reviewer already invited for this submission/version."
}
```

**Previous Behavior:**
- Generic error message: "Failed to invite reviewer(s)"
- No distinction between different types of failures
- Unclear whether some invitations succeeded
- Poor user experience when trying to re-invite

## The Solution

Implemented intelligent error handling that:
1. Detects "already invited" errors specifically
2. Distinguishes partial success from complete failure
3. Provides clear, actionable feedback
4. Handles mixed error scenarios

## Error Handling Logic

### Scenario 1: All Reviewers Already Invited
**Input:** Select 3 reviewers, all already invited
**Output:** ❌ Error message
```
"All selected reviewers have already been invited to this submission."
```

### Scenario 2: Some Already Invited, Some New
**Input:** Select 3 reviewers, 1 already invited, 2 new
**Output:** ✅ Partial success message
```
"2 reviewers invited successfully. 1 reviewer was already invited."
```

### Scenario 3: Multiple Already Invited
**Input:** Select 5 reviewers, 2 already invited, 3 new
**Output:** ✅ Partial success message
```
"3 reviewers invited successfully. 2 reviewers were already invited."
```

### Scenario 4: All Successfully Invited
**Input:** Select 3 reviewers, all new
**Output:** ✅ Success message
```
"3 reviewers invited successfully. Invitation emails have been sent."
```

### Scenario 5: Mixed Errors (Already Invited + Other Errors)
**Input:** Some already invited, some failed for other reasons
**Output:** ⚠️ Generic error with count
```
"2 reviewers invited, but 1 failed. Please check the reviewers."
```

## Technical Implementation

### Promise.allSettled Pattern

```typescript
const results = await Promise.allSettled(
  reviewerIds.map((reviewerId) =>
    inviteReviewer(submissionId, {
      reviewer_user_id: reviewerId,
      due_date: dueDate,
    })
  )
);
```

**Why `allSettled` instead of `all`?**
- ✅ Continues even if some promises reject
- ✅ Allows partial success
- ✅ Provides detailed results for each invitation
- ✅ Better error reporting

### Result Analysis

```typescript
const successes = results.filter((r) => r.status === 'fulfilled');
const failures = results.filter((r) => r.status === 'rejected');

// Check error types
const alreadyInvitedErrors = failureReasons.filter((reason) => 
  reason?.detail?.includes('already invited') || 
  reason?.message?.includes('already invited')
);
```

### Smart Message Generation

```typescript
if (alreadyInvitedErrors.length === failures) {
  // All failures are "already invited" - friendly message
  if (failures === reviewerIds.length) {
    setError('All selected reviewers have already been invited.');
  } else {
    setSuccess(
      `${successes} reviewers invited. ${failures} already invited.`
    );
  }
} else {
  // Mixed errors - generic message
  setError(`${successes} invited, but ${failures} failed.`);
}
```

## Code Changes

### `/src/pages/EditorDashboard.tsx`

**Updated Mutation Function:**
- Changed return type to include detailed results
- Added success/failure counting
- Collected failure reasons for analysis

**Enhanced Success Handler:**
- Analyzes failure reasons
- Detects "already invited" errors specifically
- Generates appropriate message based on scenario
- Handles singular/plural grammar correctly

**Message Grammar:**
- "1 reviewer was already invited" (singular)
- "2 reviewers were already invited" (plural)
- "Invitation email has been sent" (singular)
- "Invitation emails have been sent" (plural)

## User Benefits

### 1. Clear Communication
- **Before:** "Failed to invite reviewer(s)" ❌
- **After:** "2 reviewers invited successfully. 1 reviewer was already invited." ✅

### 2. Partial Success Acknowledgment
- Users see what succeeded, even if something failed
- Reduces need to retry everything
- Saves time re-inviting successfully added reviewers

### 3. Actionable Feedback
- Users understand exactly what happened
- Know which reviewers were already invited
- Can make informed decisions about next steps

### 4. Better UX
- No cryptic error messages
- Prevents confusion
- Professional handling of edge cases

## Edge Cases Handled

### 1. Single Reviewer Already Invited
```
Input: 1 reviewer (already invited)
Output: "All selected reviewers have already been invited to this submission."
```

### 2. All Failed for Different Reasons
```
Input: 3 reviewers, all fail (network, permission, etc.)
Output: "Failed to invite 3 reviewers."
```

### 3. Partial Success with Mixed Errors
```
Input: 5 reviewers
- 2 succeed
- 2 already invited
- 1 fails for other reason

Output: "2 reviewers invited, but 3 failed. Please check the reviewers."
```

### 4. Zero Selected (Validation)
```
Handled by: if (selectedReviewerIds.length === 0) return;
```

## Testing Scenarios

**Test 1: Re-invite Same Reviewer**
1. Invite Reviewer A to Submission X ✅
2. Try to invite Reviewer A again to Submission X
3. Expected: "All selected reviewers have already been invited to this submission."

**Test 2: Mix of New and Existing**
1. Invite Reviewers A, B to Submission X ✅
2. Try to invite Reviewers A, B, C to Submission X
3. Expected: "1 reviewer invited successfully. 2 reviewers were already invited."

**Test 3: All New Reviewers**
1. Invite Reviewers A, B, C to Submission X (first time)
2. Expected: "3 reviewers invited successfully. Invitation emails have been sent."

**Test 4: Network Error During Invitation**
1. Disconnect network
2. Try to invite reviewers
3. Expected: "Failed to invite 3 reviewers." (or network-specific error)

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| Error Detection | ❌ Generic | ✅ Specific |
| Partial Success | ❌ Hidden | ✅ Acknowledged |
| User Understanding | ❌ Confused | ✅ Informed |
| Retry Experience | ❌ Frustrating | ✅ Smooth |
| Message Clarity | ❌ Technical | ✅ User-friendly |

## Future Enhancements

Possible improvements:
1. Show reviewer names in error messages
2. Highlight already-invited reviewers in the selection modal
3. Pre-filter already-invited reviewers from the list
4. Add a "Show existing invitations" button
5. Provide option to re-send invitation to already invited reviewers

## Error Message Templates

### Success Messages
- ✅ "1 reviewer invited successfully. Invitation email has been sent."
- ✅ "N reviewers invited successfully. Invitation emails have been sent."
- ✅ "N reviewers invited successfully. M reviewer(s) were already invited."

### Error Messages
- ❌ "All selected reviewers have already been invited to this submission."
- ⚠️ "N reviewers invited, but M failed. Please check the reviewers."
- ❌ "Failed to invite N reviewer(s)."

### Grammar Rules
| Count | Verb | Noun |
|-------|------|------|
| 1 | was | reviewer |
| 2+ | were | reviewers |
| 1 | has | email |
| 2+ | have | emails |
