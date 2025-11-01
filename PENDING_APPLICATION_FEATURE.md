# Pending Application Prevention Feature

## Overview

This feature prevents applicants from filing a new application if they already have a pending or approved application.

## Implementation Details

### Backend

**File**: `backend/src/api/applications/applications.service.ts`

The backend already had the check implemented in the `createApplication()` method:

```typescript
// Check if user has an active application
const existingApplication = await prisma.application.findFirst({
  where: {
    applicantId: applicantId,
    status: {
      in: [ApplicationStatus.PENDING, ApplicationStatus.APPROVED],
    },
  },
});

if (existingApplication) {
  throw new ApiError(
    400,
    "You already have an active application. Please wait for the current application to be completed."
  );
}
```

**Status Check**: Prevents creation if application status is:

- `PENDING`
- `APPROVED`

**Allowed**: Applicants can create new applications if previous application status is:

- `REJECTED`
- `COMPLETED`

### Frontend

#### 1. Application Form (`frontend/src/pages/Applicant/ApplicationForm.jsx`)

**New Features**:

- Checks for pending application on component mount
- Shows loading state while checking
- Displays a user-friendly modal if pending application exists
- Shows current application details (status, submission date, attempt number)
- Provides navigation options to dashboard or history

**Key Changes**:

```javascript
// Check for pending application on component mount
useEffect(() => {
  const checkPendingApplication = async () => {
    try {
      setIsCheckingPending(true);
      const result = await getCurrentApplication();

      if (result.application) {
        const applicationStatus = result.application.status?.toUpperCase();
        // Check if application is PENDING or APPROVED
        if (
          applicationStatus === "PENDING" ||
          applicationStatus === "APPROVED"
        ) {
          setHasPendingApplication(true);
          setPendingApplicationData(result.application);
        }
      }
    } catch (err) {
      console.error("Error checking pending application:", err);
    } finally {
      setIsCheckingPending(false);
    }
  };

  checkPendingApplication();
}, [getCurrentApplication]);
```

**Pending Application Modal**:

- Shows amber warning icon
- Displays message explaining why they can't file new application
- Shows current application details
- Provides buttons to go to dashboard or application history

#### 2. Applicant Dashboard (`frontend/src/pages/Applicant/Dashboard.jsx`)

**Enhanced "New Application" Button**:

- Remains enabled and primary colored if user can create new application
- Becomes disabled with reduced opacity if user has pending/approved application
- Shows tooltip with reason when disabled
- Uses lock icon to indicate disabled state

**Logic**:

```javascript
{
  canCreateNewApplication() ? (
    <Button
      onClick={() => navigate("/applicant/application")}
      variant="primary"
      className="flex items-center justify-center"
    >
      {/* Active button UI */}
    </Button>
  ) : (
    <Button
      disabled
      title={
        currentApplication?.status
          ? `You have a ${currentApplication.status} application`
          : "You cannot create a new application"
      }
      variant="outline"
      className="flex items-center justify-center opacity-50 cursor-not-allowed"
    >
      {/* Disabled button UI with lock icon */}
    </Button>
  );
}
```

## User Experience Flow

### Scenario 1: User has PENDING or APPROVED application

1. User clicks "New Application" button on dashboard
   - Button is disabled with tooltip showing reason
2. User navigates to `/applicant/application` page
   - Page shows pending application alert
   - Cannot proceed with new application form
   - Shown current application details
3. Options:
   - Return to dashboard
   - View application history

### Scenario 2: User has REJECTED or COMPLETED application

1. User can click "New Application" button freely
   - Button is enabled and primary colored
2. Application form loads normally
3. Can proceed with filing new application

## Files Modified

1. **frontend/src/pages/Applicant/ApplicationForm.jsx**

   - Added pending application check on mount
   - Added loading state while checking
   - Added pending application alert modal

2. **frontend/src/pages/Applicant/Dashboard.jsx**
   - Enhanced "New Application" button with enabled/disabled states
   - Shows tooltip on disabled button

## API Endpoints Used

- `GET /api/applications/my-active-application` - Fetches current active application
- `POST /api/applications` - Attempts to create new application (backend validates)

## Error Handling

**Backend Error Response** (400):

```json
{
  "success": false,
  "message": "You already have an active application. Please wait for the current application to be completed.",
  "error": {
    "code": "ACTIVE_APPLICATION_EXISTS"
  }
}
```

**Frontend Handling**:

- Error message displayed on form
- User redirected from form if pending application detected

## Testing Scenarios

1. **Test 1**: User with PENDING application

   - Should not see "New Application" button enabled
   - Should see pending alert on form page
   - Should show current application details

2. **Test 2**: User with APPROVED application

   - Should not see "New Application" button enabled
   - Should see approved alert on form page
   - Should show current application details

3. **Test 3**: User with REJECTED application

   - Should see "New Application" button enabled
   - Should be able to access form normally
   - Should see success after new application submission

4. **Test 4**: User with COMPLETED application

   - Should see "New Application" button enabled
   - Should be able to access form normally
   - Should see success after new application submission

5. **Test 5**: User with no application
   - Should see "New Application" button enabled
   - Should be able to access form normally
   - Should be able to submit first application

## Conclusion

This feature ensures data integrity by preventing duplicate active applications and provides a smooth user experience by clearly communicating when and why applicants cannot file new applications.
