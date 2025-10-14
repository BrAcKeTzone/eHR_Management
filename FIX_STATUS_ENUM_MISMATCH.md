# Fix: Status Enum Mismatch Between Frontend and Backend

## Problem

The frontend was sending lowercase status values (`"pending"`, `"approved"`, `"rejected"`, `"completed"`) but the backend Prisma schema expects uppercase enum values (`"PENDING"`, `"APPROVED"`, `"REJECTED"`, `"COMPLETED"`).

### Error Message

```
PrismaClientValidationError:
Invalid `prisma.application.count()` invocation
Invalid value for argument `status`. Expected ApplicationStatus.
```

## Root Cause

- **Backend**: Uses Prisma enum `ApplicationStatus { PENDING, APPROVED, REJECTED, COMPLETED }`
- **Frontend**: Was using lowercase strings in filters and comparisons
- **Mismatch**: When frontend sent `status: "pending"`, backend rejected it

## Solution

### 1. Import Constants (Review.jsx)

Added import for application status constants:

```javascript
import { APPLICATION_STATUS } from "../../utils/constants";
```

### 2. Updated Initial Filter State

**Before:**

```javascript
const [filters, setFilters] = useState({
  status: "pending", // ❌ lowercase
  program: "",
  search: "",
});
```

**After:**

```javascript
const [filters, setFilters] = useState({
  status: APPLICATION_STATUS.PENDING, // ✅ uppercase enum
  program: "",
  search: "",
});
```

### 3. Updated Status Filter Dropdown

**Before:**

```javascript
<option value="pending">Pending</option>
<option value="approved">Approved</option>
<option value="rejected">Rejected</option>
<option value="completed">Completed</option>
```

**After:**

```javascript
<option value={APPLICATION_STATUS.PENDING}>Pending</option>
<option value={APPLICATION_STATUS.APPROVED}>Approved</option>
<option value={APPLICATION_STATUS.REJECTED}>Rejected</option>
<option value={APPLICATION_STATUS.COMPLETED}>Completed</option>
```

### 4. Updated Status Comparisons

**Before:**

```javascript
{row.status === "pending" && (
  // Approve/Reject buttons
)}
```

**After:**

```javascript
{row.status === APPLICATION_STATUS.PENDING && (
  // Approve/Reject buttons
)}
```

### 5. Updated Decision Modal Logic

**Before:**

```javascript
const openDecisionModal = (application, decisionType) => {
  setDecision(decisionType); // "approved" or "rejected"
};

{
  decision === "approved" ? "Approve" : "Reject";
}
{
  decision === "rejected" && <textarea />;
}
```

**After:**

```javascript
const openDecisionModal = (application, decisionType) => {
  setDecision(decisionType.toUpperCase()); // "APPROVED" or "REJECTED"
};

{
  decision === APPLICATION_STATUS.APPROVED ? "Approve" : "Reject";
}
{
  decision === APPLICATION_STATUS.REJECTED && <textarea />;
}
{
  decision.toLowerCase();
} // for display text
```

## Files Modified

1. **frontend/src/pages/HR/Review.jsx**
   - Added `APPLICATION_STATUS` import
   - Updated filter initial state
   - Updated all status comparisons
   - Updated decision modal logic
   - Fixed status filter dropdown values

## Backend Enum Reference

From `backend/prisma/schema.prisma`:

```prisma
enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}
```

## Constants File

The `frontend/src/utils/constants.js` already had the correct values:

```javascript
export const APPLICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
};
```

## API Flow

### Before Fix:

```
Frontend → status: "pending" → Backend ❌ Invalid enum value
```

### After Fix:

```
Frontend → status: "PENDING" → Backend ✅ Valid enum value
Backend → status: "PENDING" → Frontend ✅ Matches constant
```

## Testing Checklist

- [x] Filter by status dropdown sends correct enum values
- [x] Initial filter loads with `PENDING` status
- [x] Status comparisons work in table actions
- [x] Approve/Reject buttons only show for PENDING applications
- [x] Decision modal displays correct title
- [x] Decision modal shows rejection reason field only for REJECTED
- [x] Clear filters resets to empty string (no default status)
- [x] Backend accepts status values without validation errors
- [x] No TypeScript/ESLint errors

## Related Issues Fixed

1. ✅ Status filter dropdown now sends uppercase values
2. ✅ Action buttons only appear for PENDING applications
3. ✅ Decision modal properly handles APPROVED/REJECTED states
4. ✅ All status comparisons use enum constants
5. ✅ Backend no longer throws PrismaClientValidationError

## Additional Benefits

- **Type Safety**: Using constants prevents typos
- **Maintainability**: Single source of truth for status values
- **Consistency**: Frontend and backend use identical enum values
- **Readability**: `APPLICATION_STATUS.PENDING` is clearer than `"pending"`

## Future Recommendations

1. Consider using TypeScript in frontend for compile-time type checking
2. Add PropTypes validation for status fields
3. Create a shared types package for frontend/backend enum synchronization
4. Add ESLint rule to enforce constant usage instead of magic strings
