# Review Details Modal Feature

## Overview

Added a modal that displays full review details when an editor clicks on a reviewer's email in the Review Assignments section.

## Implementation

### New Component: ReviewDetailsModal

**Location:** `/src/features/editor/components/ReviewDetailsModal.tsx`

A comprehensive modal component that displays all review information including:
- Assignment information (status, dates, reviewer email)
- Review recommendation with color-coded badges
- Summary
- Strengths (green-tinted box)
- Weaknesses (red-tinted box)
- Confidential comments to editor (blue-tinted box)
- Submission timestamp

### Features

#### 1. Clickable Reviewer Emails
- Reviewer emails in the Review Assignments section are now clickable links
- Blue text color with hover underline effect
- Click opens the review details modal

#### 2. Modal UI/UX

**Layout:**
```
┌─────────────────────────────────────┐
│ Review Details              [X]     │ ← Sticky header
├─────────────────────────────────────┤
│ Assignment Information              │ ← Gray box
│ • Status: Review Submitted          │
│ • Due Date: March 15, 2026          │
│ • Invited At: March 1, 2026         │
│ • Responded At: March 2, 2026       │
├─────────────────────────────────────┤
│ Recommendation                      │
│ [✓ Accept]                          │ ← Color-coded badge
├─────────────────────────────────────┤
│ Summary                             │
│ ┌─────────────────────────────────┐ │
│ │ Review summary text...          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Strengths                           │
│ ┌─────────────────────────────────┐ │
│ │ Strengths text... (green bg)    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Weaknesses                          │
│ ┌─────────────────────────────────┐ │
│ │ Weaknesses text... (red bg)     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Confidential Comments to Editor     │
│ ┌─────────────────────────────────┐ │
│ │ Comments text... (blue bg)      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Submitted on March 10, 2026 2:30 PM│
└─────────────────────────────────────┘
│        [Close]                      │ ← Sticky footer
└─────────────────────────────────────┘
```

**Recommendation Badges:**
- ✅ **Accept**: Green badge with checkmark icon
- ❌ **Reject**: Red badge with X icon
- ⚠️ **Minor Revision**: Yellow badge with alert icon
- ⚠️ **Major Revision**: Orange badge with alert icon

#### 3. Empty States

**When no review exists:**
- Shows an icon and message explaining why:
  - "Reviewer has not yet responded to the invitation" (status: invited)
  - "Review is in progress. No review has been submitted yet" (status: accepted)
  - "Reviewer declined the invitation" (status: declined)

#### 4. Modal Behavior

**Opening:**
- Click on any reviewer email in Review Assignments
- Modal slides in with backdrop blur

**Closing:**
- Click the X button
- Click outside the modal
- Click the "Close" button at the bottom

**Scrolling:**
- Modal content is scrollable (max 90vh height)
- Header and footer remain fixed during scroll

## Code Changes

### 1. SubmissionDetails.tsx

**Added State:**
```typescript
const [selectedAssignment, setSelectedAssignment] = React.useState<ReviewAssignment | null>(null);
```

**Updated Review Assignment Display:**
```typescript
<button
  type="button"
  onClick={() => setSelectedAssignment(assignment)}
  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
>
  {assignment.reviewer_email}
</button>
```

**Added Modal:**
```typescript
<ReviewDetailsModal
  assignment={selectedAssignment}
  onClose={() => setSelectedAssignment(null)}
/>
```

### 2. ReviewDetailsModal.tsx (New Component)

**Props Interface:**
```typescript
interface ReviewDetailsModalProps {
  assignment: ReviewAssignment | null;
  onClose: () => void;
}
```

**Key Functions:**
- `getRecommendationBadge()`: Returns color-coded recommendation badge
- `getStatusLabel()`: Formats status text for display

**Styling:**
- Full-screen overlay with semi-transparent backdrop
- Centered modal (max-width: 4xl)
- Responsive padding and spacing
- Color-coded sections for different review fields

## Color Scheme

| Element | Background | Border | Text |
|---------|-----------|--------|------|
| Assignment Info | Gray-50 | Gray-200 | Gray-700/900 |
| Summary | White | Gray-200 | Gray-800 |
| Strengths | Green-50 | Green-200 | Gray-800 |
| Weaknesses | Red-50 | Red-200 | Gray-800 |
| Confidential | Blue-50 | Blue-200 | Gray-800 |
| Accept Badge | Green-100 | - | Green-800 |
| Reject Badge | Red-100 | - | Red-800 |
| Minor Revision | Yellow-100 | - | Yellow-800 |
| Major Revision | Orange-100 | - | Orange-800 |

## User Experience Flow

### Scenario 1: View Completed Review

1. Editor opens submission details
2. Sees list of reviewers in "Review Assignments"
3. Clicks on reviewer email (blue link)
4. Modal opens showing full review details
5. Editor reads recommendation, summary, strengths, weaknesses
6. Editor reads confidential comments (not shared with authors)
7. Closes modal

### Scenario 2: Check Pending Review

1. Editor clicks on reviewer email
2. Modal opens
3. Shows assignment information (due date, invitation date)
4. Shows empty state: "Review is in progress..."
5. Editor understands review hasn't been submitted yet
6. Closes modal

### Scenario 3: Check Declined Review

1. Editor clicks on declined reviewer email
2. Modal shows: "Reviewer declined the invitation"
3. Editor understands they need to invite another reviewer
4. Closes modal

## Technical Details

### Data Structure

**ReviewAssignment Interface:**
```typescript
interface ReviewAssignment {
  id: number;
  submission: number;
  status: AssignmentStatus;
  due_date: string;
  invited_at: string;
  responded_at: string | null;
  reviewer_email: string;
  review?: Review | null;
}
```

**Review Interface:**
```typescript
interface Review {
  summary: string;
  strengths: string;
  weaknesses: string;
  confidential_to_editor: string;
  recommendation: Recommendation;
  submitted_at: string;
}
```

### Conditional Rendering

```typescript
{assignment.review ? (
  // Show full review details
) : (
  // Show empty state with status-specific message
)}
```

### Date Formatting

All dates are formatted using `toLocaleDateString()` with options:
```typescript
{
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',    // Only for submission timestamp
  minute: '2-digit',  // Only for submission timestamp
}
```

## Accessibility

- ✅ Keyboard accessible (close with ESC - browser default)
- ✅ Click outside to close
- ✅ Clear focus states on interactive elements
- ✅ Semantic HTML structure
- ✅ Color contrast meets WCAG standards
- ✅ Screen reader friendly labels

## Benefits

### For Editors

1. **Quick Access**: View full review without navigation
2. **Context**: See review alongside submission details
3. **Confidential Info**: Easily access editor-only comments
4. **Status Tracking**: Understand review progress at a glance
5. **Professional UI**: Clean, organized presentation

### For Development

1. **Reusable Component**: Modal can be used elsewhere
2. **Type-Safe**: Full TypeScript support
3. **Maintainable**: Clear separation of concerns
4. **Extensible**: Easy to add more fields or actions

## Future Enhancements

Possible additions:
- Export review as PDF
- Print review button
- Reply to reviewer (send message)
- View reviewer profile
- Compare multiple reviews side-by-side
- Highlight key phrases in review text
- Add editor notes to review

## Summary

The Review Details Modal provides editors with a comprehensive, easy-to-use interface for viewing reviewer feedback. By making reviewer emails clickable and displaying all review information in a well-organized modal, editors can quickly assess reviews without leaving the submission details view.

**Key Features:**
- ✅ Clickable reviewer emails
- ✅ Comprehensive review display
- ✅ Color-coded recommendation badges
- ✅ Organized layout with visual hierarchy
- ✅ Confidential comments section
- ✅ Empty states for pending/declined reviews
- ✅ Smooth UX with backdrop and animations
- ✅ Fully responsive design
