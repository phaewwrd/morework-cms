# Authentication Security Implementation

## Overview
This implementation provides comprehensive access token validation for all protected routes in the application, ensuring no sensitive data is rendered before proper authentication is verified.

## Components

### 1. Middleware (`middleware.ts`)
- **Global Route Protection**: Validates access tokens on every request to protected routes
- **Role-Based Access Control**: Ensures users can only access routes appropriate to their role
- **Automatic Redirects**: Redirects unauthenticated users to `/auth/login`
- **Protected Routes**: 
  - `/admin/*` - Requires admin role
  - `/dashboard/*` - Requires company role
- **Protected API Routes**: All API endpoints except auth and public routes

### 2. JWT Validation (`src/lib/jwt.ts`)
- **Token Verification**: Validates JWT signature, expiration, and structure
- **Field Validation**: Ensures required fields (userId, email, role) are present
- **Expiration Checks**: Multiple layers of expiration validation
- **Error Handling**: Graceful handling of expired, invalid, or malformed tokens

### 3. Client-Side Auth Guard (`src/hooks/use-auth-guard.ts`)
- **Session Monitoring**: Periodically checks token validity during app usage
- **Automatic Logout**: Redirects to login when token expires during session
- **Visibility Detection**: Re-validates auth when user returns to tab
- **Local Storage Cleanup**: Clears stored data on logout

### 4. Global Integration (`src/components/providers.tsx`)
- **App-Wide Protection**: Auth guard runs on all pages automatically
- **React Query Integration**: Handles auth errors in API calls
- **No Code Duplication**: Single implementation covers entire app

## Security Features

### Server-Side Protection
- ✅ **Middleware validation** on every request
- ✅ **Token expiration** checking
- ✅ **Role-based access control**
- ✅ **API endpoint protection**
- ✅ **Malformed token handling**

### Client-Side Protection  
- ✅ **Real-time session monitoring**
- ✅ **Automatic token expiration detection**
- ✅ **Local storage cleanup on logout**
- ✅ **Seamless user experience with redirects**

### Production Ready
- ✅ **No console logs in production**
- ✅ **Proper error handling**
- ✅ **Performance optimized**
- ✅ **TypeScript fully typed**

## Route Protection Matrix

| Route Pattern | Authentication Required | Role Requirement | Redirect Destination |
|---------------|------------------------|------------------|---------------------|
| `/` | No | None | Dashboard (if authenticated) |
| `/auth/*` | No | None | Dashboard (if authenticated) |
| `/admin/*` | Yes | admin | `/auth/login` |
| `/dashboard/*` | Yes | company | `/auth/login` |
| `/api/auth/*` | Varies | None | N/A |
| `/api/*` | Yes | Any authenticated | 401 JSON response |

## Error Handling

### Invalid/Expired Tokens
- Server: Immediate redirect to `/auth/login`
- Client: Toast notification + redirect
- API: 401 JSON response

### Role Mismatches
- Admin trying to access company routes: Redirect to admin dashboard
- Company trying to access admin routes: Redirect to company dashboard
- Unauthenticated: Redirect to login

### Network Errors
- Client-side auth checks: Allow user to continue (graceful degradation)
- Server-side: Always enforce security

## Usage

The authentication system is automatically enabled and requires no additional setup. All protected routes are secured by default.

### Adding New Protected Routes
Add route patterns to the `protectedRoutes` or `protectedApiRoutes` arrays in `middleware.ts`.

### Custom Role Requirements
Modify the role checking logic in the middleware for custom role-based access control.

## Testing

### Manual Testing
1. Access protected route without login → Should redirect to `/auth/login`
2. Login and access appropriate routes → Should work normally  
3. Try to access wrong role routes → Should redirect appropriately
4. Let token expire during session → Should show toast and redirect
5. Access API without token → Should return 401

### Token Expiration Testing
- Set short token expiration in JWT_SECRET
- Login and wait for expiration
- Try to access protected routes → Should redirect
- Try API calls → Should return 401
