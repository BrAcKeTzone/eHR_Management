# Fix: Applicant Side API Call Errors

## Problem

Applicant users were getting 403 Forbidden errors when trying to view their dashboard and history pages:

```
GET http://localhost:3000/api/applications 403 (Forbidden)
Error: Only HR and Admin can view all applications
```

## Root Cause

The applicant pages were incorrectly calling `fetchApplications()` which internally calls `getAllApplications()`. This endpoint (`GET /api/applications`) is restricted to HR and Admin roles only.

**Backend Authorization:**

```typescript
// applications.controller.ts
export const getAllApplications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can view all applications");
    }
    // ... rest of code
  }
);
```

## Solution

Updated applicant pages to use the correct applicant-specific API endpoints:

- ❌ `getAllApplications()` - HR/Admin only
- ✅ `getApplicationHistory()` - Applicants can view their own applications

## Files Modified

### 1. Applicant Dashboard (`frontend/src/pages/Applicant/Dashboard.jsx`)

**Changes:**

1. **Updated Store Import:**

   ```javascript
   // Before:
   const { applications, loading, error, fetchApplications } =
     useApplicationStore();

   // After:
   const { applicationHistory, loading, error, getApplicationHistory } =
     useApplicationStore();
   ```

2. **Updated Data Source:**

   ```javascript
   // Before:
   const userApplications = applications.filter(
     (app) => app.applicantEmail === user?.email
   );

   // After:
   const userApplications = applicationHistory || [];
   ```

3. **Updated useEffect:**

   ```javascript
   // Before:
   useEffect(() => {
     fetchApplications();
   }, [fetchApplications, location.state]);

   // After:
   useEffect(() => {
     getApplicationHistory(); // Applicant-specific endpoint
   }, [getApplicationHistory, location.state]);
   ```

4. **Fixed Field Names (Backend Schema Alignment):**
   - `submittedAt` → `createdAt`
   - `subjectSpecialization` → `program`
   - Sorting by `createdAt` instead of `submittedAt`

### 2. Applicant History (`frontend/src/pages/Applicant/History.jsx`)

**Fixed Field Names:**

- `attempt_number` → `attemptNumber` (camelCase)
- `created_at` → `createdAt` (camelCase)

**Already Correct:**

- Already using `getApplicationHistory()` ✅
- Already using `applicationHistory` state ✅

## API Endpoint Usage by Role

### HR/Admin Endpoints:

- `GET /api/applications` - Get all applications (with filters)
- `PUT /api/applications/:id/approve` - Approve application
- `PUT /api/applications/:id/reject` - Reject application
- `PUT /api/applications/:id/schedule` - Schedule demo

### Applicant Endpoints:

- `GET /api/applications/my-applications` - Get own application history ✅
- `GET /api/applications/my-active-application` - Get current active application ✅
- `POST /api/applications` - Create new application ✅
- `GET /api/applications/:id` - Get specific application (if owned) ✅

## Backend Service Reference

From `applications.service.ts`:

```typescript
// For Applicants
async getApplicationsByApplicant(applicantId: number): Promise<Application[]> {
  return await prisma.application.findMany({
    where: { applicantId: id },
    orderBy: { attemptNumber: "desc" },
  });
}

// For HR/Admin
async getAllApplications(filters?: {...}): Promise<{...}> {
  // Returns ALL applications from ALL applicants
  // Requires HR or ADMIN role
}
```

## Store Function Mapping

| Store Function            | API Call                                 | Backend Endpoint                              | Who Can Access       |
| ------------------------- | ---------------------------------------- | --------------------------------------------- | -------------------- |
| `getAllApplications()`    | `applicationApi.getAll()`                | `GET /api/applications`                       | HR, ADMIN            |
| `getApplicationHistory()` | `applicationApi.getHistory()`            | `GET /api/applications/my-applications`       | APPLICANT (own data) |
| `getCurrentApplication()` | `applicationApi.getCurrentApplication()` | `GET /api/applications/my-active-application` | APPLICANT (own data) |

## Data Structure Changes

### Backend Application Model (Prisma):

```typescript
{
  id: number;
  attemptNumber: number; // ✅ camelCase
  status: ApplicationStatus;
  program: string; // ✅ Combined program/specialization
  documents: string; // JSON string
  demoSchedule: DateTime | null;
  totalScore: number | null;
  result: ApplicationResult | null;
  hrNotes: string | null;
  applicantId: number;
  createdAt: DateTime; // ✅ camelCase
  updatedAt: DateTime; // ✅ camelCase
}
```

### Fields that DON'T exist in backend:

- ❌ `submittedAt` (use `createdAt`)
- ❌ `subjectSpecialization` (use `program`)
- ❌ `applicantEmail` (use `applicant.email` from nested object)
- ❌ `education`, `experience`, `motivation` (not in current schema)

## Testing Checklist

- [x] Applicant can view dashboard without 403 errors
- [x] Applicant dashboard shows their applications
- [x] Current application displays correctly
- [x] History page loads without errors
- [x] Application history shows all attempts
- [x] Field names match backend schema (camelCase)
- [x] Dates display correctly using `createdAt`
- [x] Program field shows instead of subjectSpecialization
- [x] No console errors about missing fields
- [x] Sorting works correctly by createdAt

## Additional Benefits

1. **Proper Authorization**: Applicants only access their own data
2. **Better Performance**: Backend filters by applicantId automatically
3. **Security**: No exposure of other users' applications
4. **Consistency**: Field names match backend schema exactly

## Future Recommendations

1. Remove `fetchApplications()` function from store (deprecated)
2. Add TypeScript interfaces for Application model
3. Create shared types package between frontend/backend
4. Add loading states for better UX
5. Consider adding optimistic updates for better perceived performance
