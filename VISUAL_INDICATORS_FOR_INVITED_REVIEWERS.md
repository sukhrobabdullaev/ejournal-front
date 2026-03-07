# Visual Indicators for Already-Invited Reviewers

## Overview

Added visual indicators throughout the reviewer selection interface to warn editors when they select reviewers who have already been invited to the submission, preventing duplicate invitations before they happen.

## The Problem

**User Experience Issue:**
- Editors could select already-invited reviewers
- No visual warning until after clicking "Send Invitation"
- Error only appeared after API call failed
- Confusing UX - why can't I invite this reviewer again?

## The Solution

Added three layers of visual indicators:

### 1. Selected Reviewer Cards (Main Interface)
- **Yellow highlighting** for already-invited reviewers
- **Badge**: "Already Invited" label
- **Warning banner** at bottom showing count

### 2. Modal Reviewer List
- **Yellow tint** on already-invited reviewer rows
- **Badge**: "Already Invited" next to name
- **Yellow checkbox** border when selected

### 3. Summary Warning
- Warning message showing count of already-invited reviewers selected

## Visual Design

### Color System

**Already Invited (Warning):**
- Background: `bg-yellow-50` (light yellow)
- Border: `border-yellow-300` / `border-yellow-400`
- Text: `text-yellow-800` / `text-yellow-900`
- Badge: `bg-yellow-200 text-yellow-800`

**New Reviewer (Normal):**
- Background: `bg-blue-50` (light blue)
- Border: `border-blue-200` / `border-blue-500`
- Text: `text-blue-800` / `text-blue-900`
- Checkbox: `bg-blue-600 border-blue-600`

### Selected Reviewer Cards

```
┌─────────────────────────────────────────┐
│ Dr. Jane Doe [Already Invited]          │ ← Yellow card
│ jane@example.com                        │
│ University X, USA                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Dr. John Smith                          │ ← Blue card (new)
│ john@example.com                        │
│ University Y, UK                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠️ 1 reviewer already invited to this   │ ← Warning banner
│    submission                            │
└─────────────────────────────────────────┘
```

### Modal List

```
┌─────────────────────────────────────────┐
│ Select Reviewers        2 selected      │
├─────────────────────────────────────────┤
│ 🔍 Search...                            │
├─────────────────────────────────────────┤
│                                         │
│ ☑ Dr. Jane Doe [Already Invited]       │ ← Yellow tint
│   jane@example.com                      │
│   University X • USA                    │
│                                         │
│ ☑ Dr. John Smith                        │ ← Blue (selected)
│   john@example.com                      │
│   University Y • UK                     │
│                                         │
│ ☐ Dr. Alice Johnson                     │ ← Gray (not selected)
│   alice@example.com                     │
│   University Z • Canada                 │
└─────────────────────────────────────────┘
```

## Code Implementation

### 1. Pass Already-Invited Emails to Form

**SubmissionDetails.tsx:**
```typescript
<ReviewerInviteForm
  // ... other props
  alreadyInvitedEmails={
    submission.review_assignments?.map((a) => 
      a.reviewer_email?.toLowerCase()
    ) || []
  }
/>
```

### 2. Check Function

**ReviewerInviteForm.tsx:**
```typescript
const isReviewerAlreadyInvited = (reviewer: Reviewer) => {
  return alreadyInvitedEmails.includes(reviewer.email.toLowerCase());
};

const alreadyInvitedCount = selectedReviewerIds.filter((id) => {
  const reviewer = reviewers.find((r) => r.id === id);
  return reviewer && isReviewerAlreadyInvited(reviewer);
}).length;
```

### 3. Conditional Styling

**Selected Cards:**
```typescript
const alreadyInvited = isReviewerAlreadyInvited(reviewer);

className={`... ${
  alreadyInvited
    ? 'border-yellow-300 bg-yellow-50'
    : 'border-blue-200 bg-blue-50'
}`}
```

**Modal Items:**
```typescript
className={`... ${
  isSelected
    ? alreadyInvited
      ? 'border-yellow-400 bg-yellow-50'
      : 'border-blue-500 bg-blue-50'
    : alreadyInvited
      ? 'border-yellow-200 bg-yellow-50/30'
      : 'border-gray-200 hover:bg-gray-50'
}`}
```

## User Benefits

### Before (No Visual Indicators)
1. Select reviewers (including already invited ones)
2. Click "Send Invitation"
3. ❌ Error: "Reviewer already invited"
4. Confused - which reviewer?
5. Have to check review assignments manually
6. Try again...

### After (With Visual Indicators)
1. Click "Select reviewers..."
2. ⚠️ See yellow highlighting on already-invited reviewers
3. ✅ Understand which reviewers are already invited
4. 📝 Can choose to:
   - Deselect them, OR
   - Keep them selected (knowing they'll be skipped)
5. ✅ Clear warning banner shows count
6. No surprises!

## Features

### 1. Real-Time Validation
- ✅ Check happens before API call
- ✅ Visual feedback immediately
- ✅ No waiting for error response

### 2. Multiple Indicators
- ✅ Card-level highlighting
- ✅ Modal-level highlighting
- ✅ Badge labels
- ✅ Summary warning banner

### 3. Flexible UX
- ✅ Editors can still select already-invited reviewers
- ✅ System handles gracefully (partial success)
- ✅ Clear communication about what will happen

### 4. Case-Insensitive Matching
- ✅ Email comparison uses `.toLowerCase()`
- ✅ Handles: `John@Example.com` vs `john@example.com`

## Edge Cases Handled

### 1. No Review Assignments
```typescript
alreadyInvitedEmails={
  submission.review_assignments?.map(...) || []
}
```
Empty array if no assignments → no false positives

### 2. Multiple Already Invited
```
⚠️ 3 reviewers already invited to this submission
```
Plural grammar handled correctly

### 3. All Selected Are Already Invited
```
⚠️ 3 reviewers already invited to this submission
```
User sees clear warning before clicking send

### 4. Mixed Selection
```
1 new reviewer (blue card)
2 already invited (yellow cards)
⚠️ 2 reviewers already invited
```
Clear visual distinction

## Technical Details

### Email Matching Logic
```typescript
// Case-insensitive comparison
alreadyInvitedEmails.includes(reviewer.email.toLowerCase())
```

### Counting
```typescript
const alreadyInvitedCount = selectedReviewerIds.filter((id) => {
  const reviewer = reviewers.find((r) => r.id === id);
  return reviewer && isReviewerAlreadyInvited(reviewer);
}).length;
```

### Dynamic Badge
```typescript
{alreadyInvited && (
  <span className="ml-2 rounded bg-yellow-200 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800">
    Already Invited
  </span>
)}
```

## Combined with Backend Error Handling

This visual indicator system works together with the backend error handling:

1. **Frontend Prevention** (This feature):
   - Visual warnings before submission
   - User can adjust selection
   - Clear feedback

2. **Backend Handling** (Previous feature):
   - Graceful failure handling
   - Partial success messages
   - "N invited, M already invited" feedback

**Result:** Defense in depth - errors prevented when possible, handled gracefully when they occur.

## Testing Scenarios

**Test 1: Select Already-Invited Reviewer**
1. Invite Reviewer A to Submission X
2. Open invitation modal again
3. Expected: Reviewer A has yellow highlight and "Already Invited" badge

**Test 2: Mix of New and Invited**
1. Have Reviewers A, B already invited
2. Select Reviewers A, B, C
3. Expected:
   - A, B: Yellow cards with badges
   - C: Blue card (normal)
   - Banner: "⚠️ 2 reviewers already invited"

**Test 3: Case-Insensitive Email**
1. Reviewer invited with `John@Example.COM`
2. Reviewer list shows `john@example.com`
3. Expected: Still marked as "Already Invited"

**Test 4: No Review Assignments**
1. Fresh submission, no reviewers yet
2. Select reviewers
3. Expected: All reviewers appear normal (blue)

## Summary

| Feature | Status |
|---------|--------|
| Visual indicators in card view | ✅ Implemented |
| Visual indicators in modal | ✅ Implemented |
| "Already Invited" badges | ✅ Implemented |
| Warning banner with count | ✅ Implemented |
| Case-insensitive matching | ✅ Implemented |
| Plural grammar handling | ✅ Implemented |
| Works with backend errors | ✅ Compatible |

The reviewer selection interface now provides clear, immediate visual feedback about which reviewers have already been invited, significantly improving the user experience and reducing errors.
