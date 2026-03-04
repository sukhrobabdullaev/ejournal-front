# API Integration Troubleshooting Guide

## "Failed to fetch" Error - SOLVED ✅

If you're seeing **"API Request Error: TypeError: Failed to fetch"**, here's how to fix it:

### **Solution 1: Enable Mock Mode (Recommended for Testing)**

This allows you to test the frontend without a working backend.

1. Create a `.env` file in your project root (copy from `.env.example`):

```bash
cp .env.example .env
```

2. Make sure it contains:

```env
VITE_API_BASE_URL=https://api.uzfintex.uz/api
VITE_USE_MOCK=true
```

3. Restart your development server:

```bash
npm run dev
```

4. Now you can login with **any credentials**:
   - Email: `test@example.com`
   - Password: `password` (or anything)

### **Solution 2: Connect to Real Backend API**

When your backend is ready and running:

1. Update `.env`:

```env
VITE_API_BASE_URL=https://your-actual-api.com/api
VITE_USE_MOCK=false
```

2. Restart dev server:

```bash
npm run dev
```

3. Login with real credentials from your backend

## Visual Indicators

### API Status Badge (Development Only)

Look at the **bottom-right corner** of the page:

- 🟡 **"Mock Mode"** = Using fake data (backend not required)
- 🟢 **"Live API"** = Connected to real backend

This badge only appears in development mode.

## Console Logging

Open browser DevTools Console to see:

```
[API Client] Base URL: https://api.uzfintex.uz/api
[API Client] Mock Mode: true
[Queries API] Mock mode: true
[API Request] POST https://api.uzfintex.uz/api/auth/login
```

These logs help you understand what's happening.

## Common Issues

### Issue 1: Still seeing "Failed to fetch" even with Mock Mode

**Cause:** Environment variable not loaded  
**Solution:**
1. Make sure `.env` file exists in project root
2. Restart dev server completely (Ctrl+C, then `npm run dev`)
3. Clear browser cache and refresh

### Issue 2: CORS Error

**Cause:** Backend not allowing your frontend origin  
**Solution:**
- Enable mock mode temporarily: `VITE_USE_MOCK=true`
- Or fix backend CORS settings to allow `http://localhost:5173`

### Issue 3: 404 Not Found on API endpoints

**Cause:** Wrong API base URL  
**Solution:**
- Check `VITE_API_BASE_URL` matches your backend
- Example: If your API is at `https://api.example.com/api/auth/login`, set:
  ```env
  VITE_API_BASE_URL=https://api.example.com/api
  ```

### Issue 4: Mock Mode not working

**Cause:** Environment variable is a string, not boolean  
**Solution:**
- Use exactly: `VITE_USE_MOCK=true` (not `"true"`)
- Restart dev server

## Testing Checklist

- [ ] `.env` file exists in project root
- [ ] `VITE_USE_MOCK=true` is set for testing
- [ ] Dev server restarted after `.env` changes
- [ ] Browser console shows `[API Client] Mock Mode: true`
- [ ] Yellow "Mock Mode" badge visible in bottom-right
- [ ] Can login with any email/password

## API Endpoints Reference

When `VITE_USE_MOCK=false`, the app calls:

- `POST /auth/login` - Login
- `POST /auth/signup` - Register
- `POST /auth/refresh` - Refresh token
- `GET /me` - Get current user
- `GET /submissions` - Get my submissions
- `GET /reviewer/assignments` - Get review assignments
- `GET /editor/submissions` - Get all submissions (editor)

Check `/imports/API_FRONTEND.md` for complete API documentation.

## Development Workflow

### Phase 1: Frontend Development (Current)
```env
VITE_USE_MOCK=true
```
- Build UI components
- Test user flows
- No backend required

### Phase 2: Backend Integration
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000/api  # Local backend
```
- Connect to local backend
- Test real API calls
- Debug integration issues

### Phase 3: Production
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.production.com/api
```
- Deploy frontend
- Connect to production API
- Monitor errors

## Mock Data Details

When mock mode is enabled, you get:

**User Profile:**
- Email: test@example.com
- Name: Dr. John Doe
- Roles: author, reviewer, editor (all approved)
- ORCID: 0000-0002-1234-5678

**Submissions:**
- 2 sample submissions (draft, submitted)

**Review Assignments:**
- 1 sample review invitation

This allows full testing of all features without a backend.

## Need More Help?

1. Check browser console for detailed errors
2. Look for API Status badge in bottom-right
3. Review `/API_SETUP.md` for configuration details
4. Check `/imports/API_FRONTEND.md` for API spec
