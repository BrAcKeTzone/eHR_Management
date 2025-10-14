# Feature: Display Rejection Reasons on Applications

## Overview

Added display of rejection reasons (hrNotes field) across all application views for both HR and Applicant users. When an application is rejected, the reason provided by HR is now prominently displayed.

## Changes Made

### 1. Applicant Dashboard (`frontend/src/pages/Applicant/Dashboard.jsx`)

**Added Rejection Alert Box:**

- Location: After progress bar, before action buttons
- Condition: Shows when `status === "REJECTED"` and `hrNotes` exists
- Design: Red alert box with icon and formatted text

```jsx
{currentApplication.status === "REJECTED" && currentApplication.hrNotes && (
  <div className="bg-red-50 border border-red-200 rounded-md p-4">
    <div className="flex items-start">
      <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" ...>
        <path ... /> {/* Error icon */}
      </svg>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-900 mb-1">
          Rejection Reason
        </h4>
        <p className="text-sm text-red-800">
          {currentApplication.hrNotes}
        </p>
      </div>
    </div>
  </div>
)}
```

**Visual Design:**

- Background: `bg-red-50` (light red)
- Border: `border-red-200` (red)
- Icon: Error/warning icon in red
- Text: Dark red for emphasis

### 2. Applicant History - Detail Modal (`frontend/src/pages/Applicant/History.jsx`)

**Added to Detail Modal:**

- Location: After submitted date, before education fields
- Same design as Dashboard
- Prominently displays rejection reason in modal view

**Also Updated List View:**

- Enhanced existing rejection reason section
- Fixed field names: `rejection_reason` → `hrNotes`
- Fixed status check: `"rejected"` → `"REJECTED"`
- Fixed demo schedule field: `demo_schedule` → `demoSchedule`
- Added icon and better visual styling

```jsx
{application.status === "REJECTED" && application.hrNotes && (
  <div className="mt-3 pt-3 border-t border-red-200 bg-red-50 rounded-md p-3">
    <div className="flex items-start">
      <svg className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" ...>
        <path ... />
      </svg>
      <div>
        <p className="text-xs font-semibold text-red-900 mb-0.5">
          Rejection Reason:
        </p>
        <p className="text-sm text-red-800">
          {application.hrNotes}
        </p>
      </div>
    </div>
  </div>
)}
```

### 3. HR Review Page (`frontend/src/pages/HR/Review.jsx`)

**Already Implemented:**

- HR Notes display already existed in detail modal
- Shows for all statuses, not just rejected
- Located after program field, before documents section

```jsx
{
  selectedApplication.hrNotes && (
    <div>
      <p className="text-sm font-medium text-gray-500">HR Notes</p>
      <div className="mt-1 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-700">{selectedApplication.hrNotes}</p>
      </div>
    </div>
  );
}
```

### 4. HR Applications Management (`frontend/src/pages/HR/ApplicationsManagement.jsx`)

**Added HR Notes Section:**

- Location: After feedback field in detail modal
- Dynamic label: "Rejection Reason" for rejected apps, "HR Notes" for others
- Conditional styling: Red background for rejected, gray for others

```jsx
{
  selectedApplication.hrNotes && (
    <div>
      <p className="text-sm font-medium text-gray-500">
        {selectedApplication.status === "REJECTED"
          ? "Rejection Reason"
          : "HR Notes"}
      </p>
      <div
        className={`mt-1 p-3 rounded-md ${
          selectedApplication.status === "REJECTED"
            ? "bg-red-50 border border-red-200"
            : "bg-gray-50"
        }`}
      >
        <p
          className={`text-sm break-words ${
            selectedApplication.status === "REJECTED"
              ? "text-red-800"
              : "text-gray-700"
          }`}
        >
          {selectedApplication.hrNotes}
        </p>
      </div>
    </div>
  );
}
```

## Backend Field Reference

### Application Model (Prisma Schema):

```prisma
model Application {
  id             Int               @id @default(autoincrement())
  attemptNumber  Int               @default(1)
  status         ApplicationStatus @default(PENDING)
  program        String
  documents      String?           @db.Text
  demoSchedule   DateTime?
  totalScore     Float?
  result         ApplicationResult?
  hrNotes        String?           @db.Text  // ⭐ Rejection reason field

  applicantId    Int
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}
```

### ApplicationStatus Enum:

```prisma
enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED    // ⭐ Check this status to show rejection reason
  COMPLETED
}
```

## Visual Design Patterns

### Rejected Application Alert (Applicant View):

```
┌─────────────────────────────────────────────┐
│  🔴  Rejection Reason                       │
│      Your application was not approved      │
│      because...                             │
│      [HR's detailed rejection reason]      │
└─────────────────────────────────────────────┘
Background: Light red (red-50)
Border: Red (red-200)
Text: Dark red (red-800/red-900)
```

### HR Notes Display (HR View):

```
┌─────────────────────────────────────────────┐
│  HR Notes / Rejection Reason                │
│  ┌───────────────────────────────────────┐  │
│  │  [HR's notes or rejection reason]    │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
Background: Gray (gray-50) or Red (red-50) if rejected
Text: Gray or Red depending on status
```

## User Experience Flow

### For Applicants:

1. **Dashboard**: See rejection reason immediately on current application card
2. **History List**: See rejection reason inline with each rejected application
3. **Detail Modal**: See rejection reason prominently in modal view
4. **Visual Cues**: Red color scheme immediately signals rejection

### For HR:

1. **Review Page**: See HR notes (including rejection reasons) in detail modal
2. **Management Page**: See rejection reason with contextual label
3. **Visual Context**: Red styling for rejected apps, gray for others

## Field Name Corrections Applied

| Old Name           | New Name        | Location          |
| ------------------ | --------------- | ----------------- |
| `rejection_reason` | `hrNotes`       | All views         |
| `demo_schedule`    | `demoSchedule`  | History list      |
| `"rejected"`       | `"REJECTED"`    | Status checks     |
| `attempt_number`   | `attemptNumber` | History views     |
| `created_at`       | `createdAt`     | All date displays |

## Testing Checklist

- [x] Rejection reason displays on applicant dashboard for rejected apps
- [x] Rejection reason shows in applicant history list view
- [x] Rejection reason appears in applicant history detail modal
- [x] Red alert styling applied to rejection messages
- [x] HR can see rejection reason in Review page modal
- [x] HR can see rejection reason in Applications Management modal
- [x] Label changes based on status (rejected vs other)
- [x] Conditional styling works (red for rejected, gray for others)
- [x] hrNotes field properly fetched from backend
- [x] No display if hrNotes is null or empty
- [x] Text wraps properly for long rejection reasons
- [x] Icons display correctly
- [x] Responsive design works on mobile

## Backend Integration

### How Rejection Reason is Set:

When HR rejects an application via the Review page:

```javascript
// Frontend sends:
await updateApplicationStatus(applicationId, "REJECTED", reason);

// API call:
PUT /api/applications/:id/reject
Body: { hrNotes: "reason text here" }

// Backend saves:
await prisma.application.update({
  where: { id },
  data: {
    status: "REJECTED",
    hrNotes: reason
  }
});
```

### API Response Includes hrNotes:

```javascript
{
  statusCode: 200,
  data: {
    id: 1,
    status: "REJECTED",
    hrNotes: "Your qualifications don't match our requirements...",
    // ... other fields
  }
}
```

## Benefits

1. ✅ **Transparency**: Applicants understand why they were rejected
2. ✅ **Accountability**: HR must provide meaningful rejection reasons
3. ✅ **User Experience**: Clear, prominent display with appropriate styling
4. ✅ **Consistency**: Same field (hrNotes) used across entire application
5. ✅ **Visibility**: Shows in multiple views (dashboard, list, modal)
6. ✅ **Professional**: Well-designed UI with icons and proper spacing

## Future Enhancements

1. Add character limit/validation for rejection reasons
2. Add predefined rejection reason templates for HR
3. Add email notification with rejection reason
4. Add analytics on common rejection reasons
5. Allow applicants to respond to rejection reasons
6. Add history of rejection reasons for previous attempts
