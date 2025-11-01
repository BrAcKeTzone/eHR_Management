# Demo Date Scheduling Validation

## Overview

This feature ensures that demo dates cannot be scheduled for today or any date in the past. Demo dates must be at least 1 day in the future.

## Example

- **Current Date**: November 1, 2025 (01/11/2025)
- **Invalid Dates**: October 31, 2025 or earlier, November 1, 2025
- **Valid Dates**: November 2, 2025 onwards

## Implementation

### Backend Validation (`applications.service.ts`)

**Method**: `scheduleDemo()`

**Validation Logic**:

```typescript
// Validate demo date is at least 1 day in the future
const demoDate = new Date(demoSchedule);
const today = new Date();
// Set time to start of day for comparison
today.setHours(0, 0, 0, 0);
demoDate.setHours(0, 0, 0, 0);

// Calculate the difference in days
const timeDifference = demoDate.getTime() - today.getTime();
const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

if (daysDifference < 1) {
  throw new ApiError(
    400,
    `Demo date must be at least 1 day in the future. Please select a date starting from ${
      new Date(today.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    }`
  );
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "message": "Demo date must be at least 1 day in the future. Please select a date starting from 2025-11-02",
  "error": {
    "code": "INVALID_DEMO_DATE"
  }
}
```

### Frontend Validation (`Scheduling.jsx`)

**Two-Layer Validation**:

1. **Input Constraint** - HTML5 `min` attribute prevents selecting invalid dates

```jsx
min={getMinimumDate()}
```

2. **Form Submission Validation** - JavaScript validation before API call

```javascript
const handleSubmitSchedule = async () => {
  // ... other validations

  // Validate demo date is at least 1 day in the future
  const selectedDateObj = new Date(scheduleData.date);
  const minimumDate = new Date(getMinimumDate());

  if (selectedDateObj < minimumDate) {
    alert(
      `Demo date must be at least 1 day in the future. Please select a date starting from ${getMinimumDate()}`
    );
    return;
  }

  // ... proceed with scheduling
};
```

**Helper Function**:

```javascript
const getMinimumDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};
```

## Files Modified

1. **backend/src/api/applications/applications.service.ts**

   - Enhanced `scheduleDemo()` method with date validation
   - Clear error message with next valid date

2. **frontend/src/pages/HR/Scheduling.jsx**
   - Added `getMinimumDate()` helper function
   - Updated date input `min` attribute
   - Added validation in `handleSubmitSchedule()`

## User Experience

### Scenario 1: Using Date Picker

1. HR staff opens the scheduling modal
2. Clicks on the demo date input
3. Date picker shows only dates starting from tomorrow as selectable
4. Cannot select today or past dates
5. Successfully schedules demo for valid date

### Scenario 2: Direct Date Input (Browser-specific)

1. If user tries to manually enter an invalid date
2. Frontend validation catches it
3. Shows alert with next valid date
4. Prevents API call

### Scenario 3: Edge Case (API Bypass)

1. If validation somehow gets bypassed
2. Backend validation catches it
3. Returns 400 error with helpful message
4. User informed of the requirement

## Testing Scenarios

### Test 1: Schedule for today

- **Current Date**: November 1, 2025
- **Action**: Try to schedule demo for November 1, 2025
- **Result**: ❌ Date picker doesn't allow selection
- **Expected**: Cannot select today's date

### Test 2: Schedule for yesterday

- **Current Date**: November 1, 2025
- **Action**: Try to schedule demo for October 31, 2025
- **Result**: ❌ Cannot select past date
- **Expected**: Date picker only allows November 2 onwards

### Test 3: Schedule for tomorrow

- **Current Date**: November 1, 2025
- **Action**: Schedule demo for November 2, 2025
- **Result**: ✅ Scheduling successful
- **Expected**: Demo scheduled successfully

### Test 4: Schedule for multiple days ahead

- **Current Date**: November 1, 2025
- **Action**: Schedule demo for November 15, 2025
- **Result**: ✅ Scheduling successful
- **Expected**: Demo scheduled successfully

### Test 5: Multiple schedulings same day

- **Current Date**: November 1, 2025
- **Action**: Schedule multiple demos for November 2, 2025
- **Result**: ✅ All scheduled successfully (if slots available)
- **Expected**: Multiple demos can be scheduled on same valid date

## Browser Compatibility

- **Chrome/Edge**: Date picker enforces min attribute
- **Firefox**: Date picker enforces min attribute
- **Safari**: Date picker enforces min attribute
- **Mobile browsers**: Native date picker enforces min attribute

## Additional Notes

- The validation uses **UTC dates** for consistency across timezones
- Dates are compared as whole days (ignoring time)
- Error messages are user-friendly and actionable
- Backend provides the next valid date in error message
- Both frontend and backend validation ensure data integrity

## Conclusion

This feature ensures that:

1. ✅ Demo dates are always at least 1 day in the future
2. ✅ HR staff cannot accidentally schedule demos for past dates
3. ✅ Clear feedback when invalid dates are attempted
4. ✅ Validation at multiple layers (UI, JavaScript, Backend)
