# HR Review Page - Database Integration Fix

## Summary

Fixed the HR Review Applications page to fetch data from the database instead of using sample/mock data.

## Changes Made

### 1. Application Store (`frontend/src/store/applicationStore.js`)

#### Updated Functions to Use Real API Calls:

**`getAllApplications(filters)`**

- **Before**: Used simulated delays and filtered sample data locally
- **After**: Calls `applicationApi.getAll(filters)` to fetch from backend
- Returns both applications array and total count
- Properly handles errors and sets loading states

**`updateApplicationStatus(applicationId, status, reason)`**

- **Before**: Updated local state with simulated delay
- **After**: Calls `applicationApi.updateStatus()` to update via backend API
- Updates both the applications array and currentApplication
- Returns the updated application object

**`getApplicationHistory(userEmail)`**

- **Before**: Filtered local sample data by email
- **After**: Calls `applicationApi.getHistory()` for applicant's own history
- For HR viewing user history: calls `applicationApi.getAll({ search: email })`
- Properly differentiates between applicant and HR use cases

**`getApplicationById(applicationId)`**

- **Before**: Found application in local array
- **After**: Calls `applicationApi.getById(applicationId)` to fetch from backend
- Returns single application with full details

**`fetchApplications()`**

- **Before**: Complex function with sample data initialization
- **After**: Simple wrapper that calls `getAllApplications()`

**State Initialization**

- **Before**: `applications: applicationsData || sampleApplicationsData`
- **After**: `applications: []` (empty array, data fetched on mount)

### 2. HR Review Page (`frontend/src/pages/HR/Review.jsx`)

#### Updated Data Structure to Match Backend Schema:

**Applicant Information**

- **Before**: `app.applicant_name`, `app.applicant_email`
- **After**: `app.applicant.name`, `app.applicant.email`
- Matches Prisma schema: Application has nested `applicant` object

**Field Name Updates**

- `attempt_number` → `attemptNumber` (camelCase)
- `created_at` → `createdAt` (camelCase)
- Added support for `app.applicant.phone`
- Added support for `app.hrNotes` (HR comments)

**Documents Handling**

- **Before**: Assumed `documents` was an array of objects
- **After**: Parses `documents` field as JSON string
- Backend stores documents as stringified JSON in TEXT field
- Properly handles parsing errors with try-catch
- Document structure: `{ originalName, fileName, url, size, mimetype, uploadedAt }`

**Filter Updates**

- Search filter now checks `app.applicant.name` and `app.applicant.email`
- Status and program filters work with backend enum values

**Removed Fields**

- Removed: `address`, `education`, `experience`, `motivation`
- These fields don't exist in current Prisma schema
- Kept only fields that exist in backend Application model

## Backend Data Structure (Reference)

### Application Model

```typescript
{
  id: number;
  attemptNumber: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  program: string;
  documents: string; // JSON string: "[{originalName, fileName, url, size, mimetype}]"
  demoSchedule: Date | null;
  totalScore: number | null;
  result: "PASS" | "FAIL" | null;
  hrNotes: string | null;
  applicant: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  }
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints Used

1. **GET /api/applications** (with filters)

   - Returns: `{ applications: Application[], total: number }`
   - Filters: `status`, `search`, `page`, `limit`
   - Auth: HR/ADMIN only

2. **PUT /api/applications/:id/approve**

   - Body: `{ hrNotes: string }`
   - Returns: Updated application
   - Auth: HR/ADMIN only

3. **PUT /api/applications/:id/reject**
   - Body: `{ hrNotes: string }`
   - Returns: Updated application
   - Auth: HR/ADMIN only

## Testing Checklist

- [ ] HR can view list of applications from database
- [ ] Applicant name and email display correctly
- [ ] Application status badges show correct colors
- [ ] Filters work: status, program, search by name/email
- [ ] View Details modal shows all application information
- [ ] Documents parse correctly and display count
- [ ] Approve button updates status via API
- [ ] Reject button with reason updates status via API
- [ ] Loading states display during API calls
- [ ] Error messages show when API calls fail
- [ ] Pagination works (if implemented)
- [ ] Mobile responsive layout functions correctly

## Known Issues / Future Improvements

1. **Document Download**: Currently logs to console, needs backend endpoint implementation
2. **Pagination**: Frontend supports it but needs UI controls
3. **Real-time Updates**: Consider WebSocket for live application updates
4. **Optimistic Updates**: Could update UI before API response for better UX
5. **Caching**: Consider implementing React Query for better data caching

## Environment Requirements

- Backend server running on `http://localhost:3000`
- Database populated with application data
- Valid JWT token with HR role in localStorage
- CORS configured for frontend-backend communication

## Related Files Modified

1. `frontend/src/store/applicationStore.js` - Store logic
2. `frontend/src/pages/HR/Review.jsx` - Review page UI
3. `frontend/src/api/applicationApi.js` - Already had correct endpoints

## API Authentication

All HR endpoints require:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

Token must contain:

- `role: "HR"` or `role: "ADMIN"`
- Valid expiration time
- Proper JWT signature

## Error Handling

The store now properly:

- Catches API errors
- Sets error state with descriptive messages
- Clears loading state on error
- Throws errors for component-level handling
- Logs errors to console for debugging
