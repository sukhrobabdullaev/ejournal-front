# Reviewer Selection Feature

## Overview

The Editor Dashboard now supports selecting reviewers from an approved list of reviewers when inviting them to review a submission. This replaces the previous email-only invitation system.

## What's New

### 1. Reviewer Selection Dropdown

Editors can now:
- **Select from approved reviewers**: View and select from a list of pre-approved reviewers
- **Invite external reviewers**: Still maintain the ability to invite reviewers by email who aren't in the system yet
- **Toggle between modes**: Switch between "Select Reviewer" and "Invite by Email" modes

### 2. Reviewer Information Display

When a reviewer is selected from the dropdown, the UI displays:
- Full name
- Email address
- Affiliation
- Country

### 3. Backend Integration

The feature integrates with the new backend endpoint:
- `GET /api/editor/reviewers` - Fetches all approved reviewers

### 4. Invitation Payload

When inviting a reviewer, the system now sends:
- **For existing reviewers**: `{ reviewer_user_id: <id>, due_date: "YYYY-MM-DD" }`
- **For external reviewers**: `{ reviewer_email: "email@example.com", due_date: "YYYY-MM-DD" }`

## Files Modified

### 1. `/src/lib/api.ts`
- Added `Reviewer` interface with fields: `id`, `email`, `full_name`, `affiliation`, `country`, `is_approved_reviewer`

### 2. `/src/api/endpoints.ts`
- Added `reviewers: '/editor/reviewers'` endpoint to the `editor` object

### 3. `/src/api/hooks/useEditor.ts`
- Added `QUERY_KEYS.reviewers` for caching
- Created `useReviewers()` hook to fetch approved reviewers list
- Returns `Reviewer[]` array

### 4. `/src/features/editor/components/ReviewerInviteForm.tsx`
Complete redesign with:
- Mode toggle buttons (Select Reviewer / Invite by Email)
- Dropdown select element with search capability
- Selected reviewer info card
- External email input field
- Due date picker (common to both modes)
- Validation: requires either a selected reviewer OR an email

### 5. `/src/features/editor/components/SubmissionDetails.tsx`
- Added `reviewers`, `isLoadingReviewers`, `selectedReviewerId`, and `onReviewerSelect` props
- Passes these props to `ReviewerInviteForm`

### 6. `/src/pages/EditorDashboard.tsx`
- Added `selectedReviewerId` state
- Added reviewers query using `useQuery` to fetch from `/api/editor/reviewers`
- Updated `handleInviteReviewer()` to build request data with either `reviewer_user_id` or `reviewer_email`
- Updated `inviteReviewerMutation` to accept dynamic parameters
- Passes reviewer data and handlers to `SubmissionDetails`

## User Flow

### Inviting an Approved Reviewer

1. Editor selects a submission from the list
2. The submission details panel opens
3. Under "Invite Reviewer", the default mode is "Select Reviewer"
4. Editor clicks the dropdown showing "Select a reviewer..."
5. A list of approved reviewers appears with format: `Name (email) - Affiliation`
6. Editor selects a reviewer
7. Selected reviewer's info card appears showing full details
8. Editor optionally sets a due date
9. Editor clicks "Send Invitation"
10. Backend creates assignment with `reviewer_user_id` and sends invitation email

### Inviting an External Reviewer

1. Editor selects a submission
2. Editor clicks "Invite by Email" toggle button
3. Email input field appears
4. Editor enters reviewer's email address
5. Editor optionally sets a due date
6. Editor clicks "Send Invitation"
7. Backend creates assignment with `reviewer_email` and sends invitation email

## UI Components

### Mode Toggle
```
[Select Reviewer] [Invite by Email]
```
- Blue background = active mode
- Gray background = inactive mode

### Dropdown (Select Reviewer Mode)
```
Select Approved Reviewer
[Select a reviewer...              ▼]

Selected Reviewer Card (when selected):
┌─────────────────────────────────────┐
│ Dr. Jane Doe                        │
│ jane.doe@example.com                │
│ University of Example, United States│
└─────────────────────────────────────┘
```

### Email Input (Invite by Email Mode)
```
Reviewer Email
[reviewer@example.com              ]
External reviewer will receive an invitation email
```

### Common Elements
```
Review Due Date (optional)
[YYYY-MM-DD                        ]

[✉ Send Invitation]
```

## API Specification

### GET /api/editor/reviewers

**Authentication**: Required (Editor role)

**Response**: Array of reviewer objects
```json
[
  {
    "id": 5,
    "email": "reviewer@example.com",
    "full_name": "Dr. Sample Reviewer",
    "affiliation": "University X",
    "country": "United States",
    "is_approved_reviewer": true
  }
]
```

### POST /api/editor/submissions/{id}/invite-reviewer

**Authentication**: Required (Editor role)

**Request Body (Option 1 - Existing Reviewer)**:
```json
{
  "reviewer_user_id": 5,
  "due_date": "2026-03-20"
}
```

**Request Body (Option 2 - External Reviewer)**:
```json
{
  "reviewer_email": "external@example.com",
  "due_date": "2026-03-20"
}
```

**Response**: Review assignment object with invitation details

## Technical Notes

### State Management
- Uses React Query for reviewer list caching
- `selectedReviewerId` state tracks current selection
- Mode switching clears selectedReviewerId when switching to email mode

### Validation
- Submit button disabled if neither reviewer selected nor email entered
- Email validation handled by HTML5 input type="email"

### Error Handling
- Network errors when fetching reviewers show "Loading reviewers..." or "No approved reviewers available"
- Invitation errors display in the main error banner

### Performance
- Reviewers list cached by React Query (key: `['reviewers']`)
- Only fetched once per session unless explicitly invalidated
- Dropdown renders all reviewers (no virtualization needed for typical reviewer list sizes)

## Future Enhancements

Potential improvements:
- Search/filter within reviewer dropdown for large reviewer lists
- Display reviewer's expertise areas to help editors match reviewers to submission topics
- Show reviewer workload (number of active reviews)
- Batch reviewer invitation
- Reviewer recommendation based on submission keywords
