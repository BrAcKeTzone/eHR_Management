# Frontend-Backend Synchronization Report

**Date:** October 9, 2025  
**Project:** BCFI HR Management System  
**Purpose:** Document changes made to align frontend API calls with backend endpoints

---

## Summary

This document details the modifications made to the frontend to ensure it matches the backend API implementation. Several discrepancies were identified and resolved to ensure proper communication between the frontend and backend services.

---

## Changes Made

### 1. ✅ Scoring API (`frontend/src/api/scoringApi.js`)

**Issue:** Frontend was using incorrect endpoint structure for scoring operations.

**Backend Endpoints:**

- `POST /api/scoring/rubrics` - Create rubric
- `GET /api/scoring/rubrics` - Get all rubrics
- `GET /api/scoring/rubrics/:id` - Get rubric by ID
- `PUT /api/scoring/rubrics/:id` - Update rubric
- `DELETE /api/scoring/rubrics/:id` - Delete rubric
- `POST /api/scoring/scores` - Create score
- `GET /api/scoring/applications/:applicationId/scores` - Get scores for application
- `PUT /api/scoring/applications/:applicationId/scores/:rubricId` - Update score
- `DELETE /api/scoring/applications/:applicationId/scores/:rubricId` - Delete score
- `GET /api/scoring/applications/:applicationId/calculate` - Calculate application score
- `POST /api/scoring/applications/:applicationId/complete` - Complete scoring
- `GET /api/scoring/applications/:applicationId/summary` - Get scores summary

**Changes:**

- Restructured all scoring API functions to match backend routes
- Separated rubric management and score management functions
- Added proper score calculation and completion endpoints
- Removed non-existent endpoints like `/api/scoring/:applicationId` (direct)

---

### 2. ✅ Notification API (`frontend/src/api/notificationApi.js`)

**Issue:** Frontend had extensive notification endpoints that don't exist in the backend.

**Backend Reality:**

- The backend **does NOT have REST API endpoints** for notifications
- Notifications are sent automatically via email by the `notifications.service.ts`
- Notifications are triggered automatically on:
  - Application submission
  - Application approval
  - Application rejection
  - Demo scheduling
  - Results completion

**Changes:**

- Converted all notification functions to placeholders with console warnings
- Added comprehensive documentation explaining that notifications are email-only
- Kept file structure for potential future expansion
- Users should rely on email notifications, not in-app notifications

---

### 3. ✅ Schedule API (`frontend/src/api/scheduleApi.js`)

**Issue:** Frontend had a separate `/api/schedule` endpoint that doesn't exist.

**Backend Reality:**

- Scheduling is handled through the applications API
- Endpoint: `PUT /api/applications/:id/schedule`
- Body: `{ demoSchedule: "ISO_DATE_STRING" }`

**Changes:**

- Refactored scheduleApi to be a wrapper around applications API
- `setDemoSchedule()` now calls `/api/applications/:id/schedule`
- `getDemoSchedule()` uses `/api/applications/:id`
- `getMyDemoSchedule()` uses `/api/applications/my-active-application`
- `getAllSchedules()` filters applications with status "APPROVED"
- Added documentation recommending direct use of `applicationApi` instead

---

### 4. ✅ Report API (`frontend/src/api/reportApi.js`)

**Issue:** Frontend had `/api/reports` endpoints that don't exist.

**Backend Reality:**

- Backend has **NO report generation endpoints**
- Statistics available via: `GET /api/users/stats` (HR only)
- Report data should be generated client-side from:
  - `applicationApi.getAll()` - Application data
  - `scoringApi` endpoints - Scoring data
  - `userApi.getUserStats()` - User statistics

**Changes:**

- Converted all report functions to placeholders with console warnings
- Added helper functions to fetch data from existing endpoints
- Recommended implementing client-side report generation (CSV, PDF)
- Kept file structure for future implementation

---

### 5. ✅ Application API (`frontend/src/api/applicationApi.js`)

**Issue:** Scheduling endpoint needed to be added.

**Changes:**

- Added `scheduleDemo()` function
- Endpoint: `PUT /api/applications/:id/schedule`
- Body: `{ demoSchedule: ISO_DATE_STRING }`

---

### 6. ✅ Constants File (`frontend/src/utils/constants.js`)

**Created:** New constants file to ensure enum consistency.

**Contents:**

```javascript
USER_ROLES = { APPLICANT, HR };
APPLICATION_STATUS = { PENDING, APPROVED, REJECTED, COMPLETED };
APPLICATION_RESULT = { PASS, FAIL };
NOTIFICATION_TYPES = {
  submission,
  approval,
  rejection,
  schedule,
  result,
  hr_alert,
};
PASSING_PERCENTAGE = 70;
```

**Purpose:**

- Ensure frontend uses exact same enum values as backend Prisma schema
- Provide display labels and colors for UI
- Define upload constraints and pagination defaults
- Single source of truth for application-wide constants

---

### 7. ✅ Environment Configuration

**Verified:**

- Frontend `.env`: `VITE_API_URL=http://localhost:3000`
- Backend `.env`: `PORT=3000`
- Configuration is correct and matching

---

## Backend API Reference

### Authentication (`/api/auth`)

- `POST /api/auth/send-otp` - Send OTP for registration
- `POST /api/auth/verify-otp` - Verify OTP for registration
- `POST /api/auth/send-otp-reset` - Send OTP for password reset
- `POST /api/auth/verify-otp-reset` - Verify OTP for password reset
- `POST /api/auth/send-otp-change` - Send OTP for password change
- `POST /api/auth/verify-otp-change` - Verify OTP for password change
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password

### Users (`/api/users`) - All require authentication

- `GET /api/users/me` - Get current user profile
- `GET /api/users` - Get all users (HR only)
- `GET /api/users/stats` - Get user statistics (HR only)
- `GET /api/users/:id` - Get user by ID (HR or own)
- `POST /api/users` - Create user (HR only)
- `PUT /api/users/me` - Update current user
- `PUT /api/users/:id` - Update user (HR or own)
- `PUT /api/users/:id/password` - Update password (own only)
- `DELETE /api/users/:id` - Delete user (HR only)

### Applications (`/api/applications`) - All require authentication

- `POST /api/applications` - Create application (Applicant only)
- `GET /api/applications/my-applications` - Get user's applications (Applicant)
- `GET /api/applications/my-active-application` - Get active application (Applicant)
- `GET /api/applications` - Get all applications (HR only)
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id` - Update application (HR only)
- `DELETE /api/applications/:id` - Delete application (Admin only)
- `PUT /api/applications/:id/approve` - Approve application (HR only)
- `PUT /api/applications/:id/reject` - Reject application (HR only)
- `PUT /api/applications/:id/schedule` - Schedule demo (HR only)

### Scoring (`/api/scoring`) - All require authentication

**Rubric Management:**

- `POST /api/scoring/rubrics` - Create rubric (HR/Admin only)
- `GET /api/scoring/rubrics` - Get all rubrics (HR/Admin only)
- `GET /api/scoring/rubrics/:id` - Get rubric by ID (HR/Admin only)
- `PUT /api/scoring/rubrics/:id` - Update rubric (HR/Admin only)
- `DELETE /api/scoring/rubrics/:id` - Delete rubric (Admin only)

**Score Management:**

- `POST /api/scoring/scores` - Create score (HR only)
- `GET /api/scoring/applications/:applicationId/scores` - Get scores
- `PUT /api/scoring/applications/:applicationId/scores/:rubricId` - Update score (HR only)
- `DELETE /api/scoring/applications/:applicationId/scores/:rubricId` - Delete score (HR only)

**Score Calculation:**

- `GET /api/scoring/applications/:applicationId/calculate` - Calculate score (HR only)
- `POST /api/scoring/applications/:applicationId/complete` - Complete scoring (HR only)
- `GET /api/scoring/applications/:applicationId/summary` - Get summary

---

## Data Models (from Prisma Schema)

### User

```typescript
{
  id: number
  email: string
  password: string (hashed)
  name: string
  phone?: string
  role: "APPLICANT" | "HR"
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Application

```typescript
{
  id: number
  attemptNumber: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
  program: string
  documents?: string (JSON)
  demoSchedule?: DateTime
  totalScore?: number (percentage)
  result?: "PASS" | "FAIL"
  hrNotes?: string
  applicantId: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Rubric

```typescript
{
  id: number
  criteria: string
  description?: string
  maxScore: number (default: 10)
  weight: number (default: 1.0)
  isActive: boolean (default: true)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Score

```typescript
{
  id: number
  scoreValue: number
  comments?: string
  applicationId: number
  rubricId: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Notification

```typescript
{
  id: number
  email: string
  subject: string
  message: string
  type: "submission" | "approval" | "rejection" | "schedule" | "result" | "hr_alert"
  sentAt: DateTime
  applicationId?: number
  createdAt: DateTime
}
```

---

## Recommendations

### 1. Update Frontend Stores

The following store files may need updates to use the new API endpoints:

- `frontend/src/store/scoringStore.js` - Update to use new scoring API methods
- `frontend/src/store/scheduleStore.js` - Update to use application API instead
- `frontend/src/store/reportStore.js` - Implement client-side report generation

### 2. Implement Client-Side Reports

Since backend has no report endpoints, consider:

- Using libraries like `jsPDF` for PDF generation
- Using `papaparse` or native methods for CSV export
- Creating report templates in React components
- Fetching data from existing APIs and formatting client-side

### 3. Notification UI

Since backend only sends email notifications:

- Consider removing in-app notification UI components
- OR implement a local notification system for UI feedback
- Display success/error messages after actions
- Show email confirmation messages ("Check your email...")

### 4. Environment Variables

Consider adding to backend `.env`:

```properties
PASSING_SCORE_PERCENTAGE=70
```

Currently defaults to 70 in code but should be configurable.

### 5. Testing

Test all modified endpoints thoroughly:

- Authentication flow (OTP → Register → Login)
- Application CRUD operations
- Scoring workflow (Create rubrics → Score application → Complete)
- User management (HR operations)
- File upload functionality

### 6. Error Handling

Ensure frontend handles these backend errors:

- 401 Unauthorized (token expired/invalid)
- 403 Forbidden (insufficient permissions)
- 404 Not Found (resource doesn't exist)
- 400 Bad Request (validation errors)
- 500 Internal Server Error

### 7. Documentation

Update user-facing documentation to reflect:

- Email-based notification system
- No in-app notifications
- Report generation limitations
- File upload requirements

---

## Files Modified

1. `frontend/src/api/scoringApi.js` - Complete restructure
2. `frontend/src/api/notificationApi.js` - Converted to placeholders
3. `frontend/src/api/scheduleApi.js` - Refactored as wrapper
4. `frontend/src/api/reportApi.js` - Converted to placeholders
5. `frontend/src/api/applicationApi.js` - Added scheduleDemo()
6. `frontend/src/utils/constants.js` - **CREATED NEW FILE**

---

## Testing Checklist

- [ ] Test authentication flow (OTP, register, login)
- [ ] Test application creation with file upload
- [ ] Test application approval/rejection
- [ ] Test demo scheduling
- [ ] Test rubric CRUD operations
- [ ] Test scoring workflow
- [ ] Test score calculation and completion
- [ ] Test user management (HR functions)
- [ ] Verify email notifications are sent
- [ ] Test error handling for all endpoints
- [ ] Verify enum values match backend
- [ ] Test pagination and filtering
- [ ] Verify role-based access control

---

## Notes

- All API responses follow the structure: `{ statusCode, data, message, success }`
- Authentication uses Bearer tokens in Authorization header
- File uploads use multipart/form-data
- Dates should be sent as ISO strings
- Backend validates all inputs using Joi schemas
- RBAC middleware enforces role-based access control

---

## Contact

For questions about these changes, refer to:

- Backend API: `backend/src/api/`
- Prisma Schema: `backend/prisma/schema.prisma`
- Backend Routes: `backend/src/routes/index.ts`

---

**Status:** ✅ Frontend successfully aligned with backend API structure
