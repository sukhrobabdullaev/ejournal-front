# API Integration Guide

## Overview

The application now uses a REST API backend instead of Supabase. The API client supports both production and development modes.

## Configuration

### Environment Variables (`.env`)

```env
# API Base URL
VITE_API_BASE_URL=https://api.uzfintex.uz/api

# Mock Mode (for development/testing)
VITE_USE_MOCK=true  # Set to 'false' for production
```

## Mock Mode (Development)

When the backend API is unavailable or you want to test the frontend without a real backend:

1. Set `VITE_USE_MOCK=true` in `.env`
2. The app will use mock data from `/lib/mock-api.ts`
3. Mock mode includes:
   - Fake user authentication
   - Sample submissions
   - Sample review assignments
   - All CRUD operations return mock data

### Mock Credentials

Use any email/password combination in mock mode. Example:
- **Email**: `test@example.com`
- **Password**: `anything`

## Production Mode

When your backend API is ready:

1. Set `VITE_USE_MOCK=false` in `.env`
2. Set `VITE_API_BASE_URL` to your actual API endpoint
3. The app will make real HTTP requests to your backend

## API Client Features

✅ **Automatic Token Management**
- Stores JWT access + refresh tokens in localStorage
- Automatically refreshes expired tokens
- Redirects to login when authentication fails

✅ **Error Handling**
- Network error handling
- CORS error detection
- Detailed error logging in console

✅ **TypeScript Types**
- Full type safety for all API responses
- Types match API specification

## Troubleshooting

### "Failed to fetch" Error

This error means the frontend cannot reach the backend API. Try these solutions:

1. **Enable Mock Mode** (recommended for testing):
   ```env
   VITE_USE_MOCK=true
   ```

2. **Check API URL**:
   - Verify `VITE_API_BASE_URL` is correct
   - Test the API endpoint in your browser or Postman

3. **CORS Issues**:
   - Ensure your backend allows requests from your frontend origin
   - Add CORS headers to your API responses

4. **Network Issues**:
   - Check if the backend server is running
   - Verify firewall settings
   - Check if you can ping the API domain

### Console Logs

The API client logs useful information:
```
[API Client] Base URL: https://api.uzfintex.uz/api
[API Client] Mock Mode: true
[Queries API] Mock mode: true
```

Check the browser console for these logs to verify configuration.

## File Structure

```
/lib/
  ├── api.ts           # API client (handles HTTP requests, tokens)
  ├── queries-api.ts   # Query functions (auth, submissions, reviews, etc.)
  └── mock-api.ts      # Mock data for development
```

## Migration from Supabase

All Supabase functions have been replaced:

| Old (Supabase) | New (REST API) |
|----------------|----------------|
| `supabase.auth.signUp()` | `signup()` |
| `supabase.auth.signInWithPassword()` | `login()` |
| `supabase.auth.signOut()` | `logout()` |
| `supabase.from('profiles').select()` | `getMyProfile()` |
| `supabase.from('submissions').insert()` | `createSubmission()` |

## Testing

### 1. Test with Mock Mode

```bash
# In .env
VITE_USE_MOCK=true

# Run the app
npm run dev
```

Login with any credentials and explore the mock data.

### 2. Test with Real API

```bash
# In .env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api.com/api

# Run the app
npm run dev
```

Use real credentials from your backend.

## Need Help?

- Check browser console for detailed error messages
- Verify `.env` configuration
- Test API endpoints in Postman first
- Enable mock mode for frontend-only testing
