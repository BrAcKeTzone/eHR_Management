# Quick API Reference Guide

## Frontend API Usage

### Import Constants

```javascript
import {
  USER_ROLES,
  APPLICATION_STATUS,
  APPLICATION_RESULT,
  STATUS_LABELS,
  RESULT_LABELS,
} from "../utils/constants";
```

### Authentication

```javascript
import { authApi } from "../api/authApi";

// Registration Flow
await authApi.sendOtp(email);
await authApi.verifyOtp(email, otp);
await authApi.register({ email, password, name, phone, role });

// Login
const response = await authApi.login({ email, password });
const { token, user } = response.data;

// Password Reset
await authApi.sendOtpForReset(email);
await authApi.verifyOtpForReset(email, otp);
await authApi.resetPassword(email, otp, newPassword);

// Password Change
await authApi.sendOtpForChange(email, currentPassword);
await authApi.verifyOtpForChange(email, otp);
await authApi.changePassword(email, oldPassword, otp, newPassword);
```

### Applications

```javascript
import { applicationApi } from "../api/applicationApi";
import { APPLICATION_STATUS } from "../utils/constants";

// Create Application (Applicant)
const formData = {
  program: "Teaching Position",
  documents: [{ file: fileObject }],
};
const { application } = await applicationApi.create(formData);

// Get Current Application (Applicant)
const { application } = await applicationApi.getCurrentApplication();

// Get Application History (Applicant)
const { applications } = await applicationApi.getHistory();

// Get All Applications (HR)
const { applications, total } = await applicationApi.getAll({
  status: APPLICATION_STATUS.PENDING,
  page: 1,
  limit: 10,
  search: "John",
});

// Approve/Reject Application (HR)
await applicationApi.updateStatus(
  applicationId,
  APPLICATION_STATUS.APPROVED,
  "Good candidate"
);
await applicationApi.updateStatus(
  applicationId,
  APPLICATION_STATUS.REJECTED,
  "Insufficient experience"
);

// Schedule Demo (HR)
await applicationApi.scheduleDemo(applicationId, "2025-10-15T10:00:00Z");

// Get Application by ID
const { application } = await applicationApi.getById(applicationId);
```

### Scoring

```javascript
import { scoringApi } from "../api/scoringApi";

// Rubric Management (HR/Admin)
const rubric = await scoringApi.createRubric({
  criteria: "Communication Skills",
  description: "Ability to communicate clearly",
  maxScore: 10,
  weight: 1.5,
  isActive: true,
});

const rubrics = await scoringApi.getAllRubrics(false); // exclude inactive
const rubric = await scoringApi.getRubricById(rubricId);
await scoringApi.updateRubric(rubricId, { maxScore: 15 });
await scoringApi.deleteRubric(rubricId);

// Score Management (HR)
const score = await scoringApi.createScore({
  applicationId: 1,
  rubricId: 2,
  scoreValue: 8.5,
  comments: "Excellent communication",
});

const scores = await scoringApi.getScoresByApplication(applicationId);

await scoringApi.updateScore(applicationId, rubricId, {
  scoreValue: 9.0,
  comments: "Outstanding performance",
});

await scoringApi.deleteScore(applicationId, rubricId);

// Score Calculation (HR)
const calculation = await scoringApi.calculateApplicationScore(applicationId);
// Returns: { totalScore, maxPossibleScore, percentage, result, scores }

const completedApp = await scoringApi.completeApplicationScoring(applicationId);
// Marks application as COMPLETED, sets result (PASS/FAIL), sends email

const summary = await scoringApi.getApplicationScoresSummary(applicationId);
```

### Users

```javascript
import { userApi } from "../api/userApi";
import { USER_ROLES } from "../utils/constants";

// Get Current User
const user = await userApi.getCurrentUser();

// Update Current User
await userApi.updateCurrentUser({ name: "New Name", phone: "123-456-7890" });

// Get All Users (HR)
const result = await userApi.getAllUsers({
  page: 1,
  limit: 10,
  role: USER_ROLES.APPLICANT,
  search: "john",
  sortBy: "createdAt",
  sortOrder: "desc",
});

// Get User Stats (HR)
const stats = await userApi.getUserStats();
// Returns: { totalUsers, totalApplicants, totalHR, ... }

// Get User by ID (HR or Own)
const user = await userApi.getUserById(userId);

// Create User (HR)
const newUser = await userApi.createUser({
  email: "user@example.com",
  password: "SecurePass123",
  name: "John Doe",
  phone: "123-456-7890",
  role: USER_ROLES.APPLICANT,
});

// Update User (HR or Own)
await userApi.updateUser(userId, { name: "Updated Name" });

// Update Password (Own)
await userApi.updateUserPassword(userId, {
  currentPassword: "OldPass123",
  newPassword: "NewPass123",
});

// Delete User (HR)
await userApi.deleteUser(userId);
```

### File Uploads

```javascript
import { fetchClient } from "../utils/fetchClient";

// Single File Upload (public or authenticated)
async function uploadFile(file, type = "application") {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchClient.post(
    `/api/uploads?type=${type}`,
    formData
  );
  return response.data;
}

// Multiple File Upload (authenticated required)
async function uploadMultipleFiles(files, type = "document") {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetchClient.post(
    `/api/uploads/multiple?type=${type}`,
    formData
  );
  return response.data;
}

// Base64 Image Upload
async function uploadBase64(base64String, type = "profile") {
  const response = await fetchClient.post(`/api/uploads/base64?type=${type}`, {
    image: base64String,
  });
  return response.data;
}

// Application Documents Upload (authenticated)
async function uploadApplicationDocs(documents) {
  const formData = new FormData();
  documents.forEach((doc) => {
    formData.append("files", doc);
  });

  const response = await fetchClient.post("/api/uploads/application", formData);
  return response.data;
}

// Delete File (authenticated)
async function deleteFile(publicId) {
  const encodedId = encodeURIComponent(publicId);
  const response = await fetchClient.delete(`/api/uploads/${encodedId}`);
  return response.data;
}

// Upload Types:
// - 'application': Application documents → bcfi_hr/applications/
// - 'id': ID verification → bcfi_hr/valid_ids/
// - 'document': General docs → bcfi_hr/documents/
// - 'profile': Profile images → bcfi_hr/profiles/
// - 'general': Other files → bcfi_hr/general/

// File Constraints:
// - Max size: 10MB per file
// - Max files: 10 per request
// - Allowed: JPG, PNG, PDF, DOC, DOCX, TXT
```

### Reports (Client-Side Implementation Required)

```javascript
import { reportApi } from "../api/reportApi";

// Get data for client-side report generation
const applicationsData = await reportApi.getApplicationsData({
  status: APPLICATION_STATUS.COMPLETED,
  startDate: "2025-01-01",
  endDate: "2025-12-31",
});

const userStats = await reportApi.getUserStatistics();

// Note: Implement your own report generation functions
// Backend does not provide report generation endpoints
```

### Scheduling (Wrapper around Applications API)

```javascript
import { scheduleApi } from "../api/scheduleApi";

// Set Demo Schedule (HR) - Uses applications API internally
await scheduleApi.setDemoSchedule(applicationId, {
  demoSchedule: "2025-10-15T10:00:00Z",
});

// Get Demo Schedule
const { data } = await scheduleApi.getDemoSchedule(applicationId);

// Get My Demo Schedule (Applicant)
const { data } = await scheduleApi.getMyDemoSchedule();

// Get All Schedules (HR) - Returns approved applications with schedules
const { data } = await scheduleApi.getAllSchedules({
  startDate: "2025-10-01",
  endDate: "2025-10-31",
});
```

### Notifications

⚠️ **Important:** Backend sends email notifications automatically. No REST API endpoints exist.

```javascript
// Notifications are sent automatically for:
// - Application submission
// - Application approval
// - Application rejection
// - Demo scheduling
// - Results completion

// The notificationApi file contains placeholders only
// Implement client-side notification UI if needed
```

---

## Error Handling

```javascript
try {
  const result = await applicationApi.create(data);
} catch (error) {
  // Backend returns: { success: false, message: "...", statusCode: 400 }
  console.error(error.response?.data?.message || error.message);

  // Handle specific status codes
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 403) {
    // Show "Access Denied"
  }
}
```

---

## Response Structure

All successful responses follow this structure:

```javascript
{
  success: true,
  statusCode: 200,
  data: { /* actual data */ },
  message: "Success message"
}
```

Error responses:

```javascript
{
  success: false,
  statusCode: 400,
  message: "Error message",
  errors: [] // Optional validation errors
}
```

---

## File Uploads

```javascript
const formData = new FormData();
formData.append("program", "Teaching Position");
formData.append("documents", fileObject1);
formData.append("documents", fileObject2);

const { application } = await applicationApi.create(formData);
```

**Upload Constraints:**

- Max file size: 10MB
- Allowed types: PDF, JPG, PNG, DOC, DOCX
- Multiple files supported

---

## Authentication

All API calls (except auth endpoints) require authentication token:

```javascript
// Token is automatically added by fetchClient interceptor
localStorage.setItem("authToken", token);

// On 401 error, user is redirected to /signin automatically
```

---

## Role-Based Access

- **APPLICANT**: Can create applications, view own data
- **HR**: Can view all data, approve/reject, score applications, manage users

Backend enforces RBAC - unauthorized requests return 403.

---

## Environment Setup

Frontend `.env`:

```properties
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

Backend `.env` should have:

```properties
PORT=3000
DATABASE_URL=mysql://...
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:5173
```

---

## Common Patterns

### Pagination

```javascript
const { applications, total } = await applicationApi.getAll({
  page: 1,
  limit: 10,
});

const totalPages = Math.ceil(total / limit);
```

### Filtering

```javascript
await applicationApi.getAll({
  status: APPLICATION_STATUS.PENDING,
  search: "John",
});
```

### Sorting

```javascript
await userApi.getAllUsers({
  sortBy: "createdAt",
  sortOrder: "desc",
});
```

---

## Status Flow

```
Application: PENDING → APPROVED → COMPLETED
                  ↓
               REJECTED
```

After approval, HR can:

1. Schedule demo
2. Score the demo using rubrics
3. Complete scoring (calculates PASS/FAIL)
4. Application status becomes COMPLETED

---

## Testing Tips

1. Use Postman/Insomnia to test backend endpoints first
2. Check browser Network tab for API calls
3. Verify token is sent in Authorization header
4. Check email inbox for notification emails
5. Test with different roles (APPLICANT, HR)
6. Test error scenarios (invalid data, unauthorized access)

---

## Next Steps

1. Update frontend stores to use new API methods
2. Implement client-side report generation
3. Update UI components to use constants
4. Test all workflows end-to-end
5. Add loading states and error handling
6. Implement proper form validation

---

For detailed information, see: `FRONTEND_BACKEND_SYNC.md`
