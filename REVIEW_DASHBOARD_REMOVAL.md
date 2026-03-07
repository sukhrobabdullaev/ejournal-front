# Review Dashboard Removal

## Overview

Removed the separate `/review/dashboard` route and consolidated all reviewer functionality into the main `/dashboard` page which already handles reviewer assignments.

## Changes Made

### Files Removed
- ✅ `/src/pages/ReviewDashboard.tsx` - Deleted (199 lines)

### Files Updated

#### 1. `/src/App.tsx`
- Removed `ReviewDashboard` lazy import
- Removed `/review/dashboard` route
- All review-related navigation now goes through `/dashboard`

#### 2. `/src/components/Header.tsx`
- Updated "Reviewer" link from `/review/dashboard` → `/dashboard`
- Updated "Reviewer Dashboard" mobile link from `/review/dashboard` → `/dashboard`

#### 3. `/src/pages/ReviewAssignmentDetail.tsx`
- Updated "Back to Dashboard" button from `/review/dashboard` → `/dashboard`
- Updated auto-redirect after decline from `/review/dashboard` → `/dashboard`

#### 4. `/src/pages/ReviewInvite.tsx`
- Updated redirect button from `/review/dashboard` → `/dashboard`

## Rationale

The `/review/dashboard` was redundant because:

1. **DashboardNew.tsx already shows reviewer assignments** - It has a dedicated "Reviewer Panel" that displays all assignments with proper counts and navigation
2. **Duplicate functionality** - Both pages showed essentially the same information
3. **Better UX** - Single unified dashboard is cleaner and less confusing for users with multiple roles
4. **Simpler navigation** - All users go to `/dashboard` regardless of their role

## User Experience

### Before
- Reviewers had a separate `/review/dashboard` page
- Users with multiple roles had to navigate between different dashboards
- Clicking "Reviewer" in the header took users to a separate page

### After
- All users use the unified `/dashboard` page
- DashboardNew automatically detects reviewer role and shows the appropriate panel
- Reviewers can see their assignments directly from the main dashboard
- Clicking on an assignment takes them to `/review/assignments/:id` (unchanged)

## Migration

No database or API changes required. This is a pure frontend routing change.

**User Impact:** None. The unified dashboard already displays reviewer assignments, so reviewers will see the same information in a better organized view.

## Routes After Removal

**Reviewer-related routes:**
- ❌ `/review/dashboard` - Removed (was: list of assignments)
- ✅ `/dashboard` - Unified dashboard with reviewer panel
- ✅ `/review/assignments/:id` - Individual assignment detail (unchanged)
- ✅ `/review/invite/:token` - Accept invitation by token (unchanged)

## Benefits

1. **Cleaner codebase** - 199 lines removed
2. **Better UX** - Single source of truth for all dashboard data
3. **Easier maintenance** - One dashboard component instead of two
4. **Consistent navigation** - All users use the same entry point
5. **Better for multi-role users** - See all their roles in one view
