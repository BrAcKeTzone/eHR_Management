# Complete Backend API Endpoints

**Project:** BCFI HR Management System  
**Base URL:** `http://localhost:3000/api`  
**Updated:** October 14, 2025

---

## Authentication Endpoints (`/api/auth`)

All endpoints are **public** (no authentication required).

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| POST   | `/auth/send-otp`          | Send OTP for registration      |
| POST   | `/auth/verify-otp`        | Verify OTP for registration    |
| POST   | `/auth/send-otp-reset`    | Send OTP for password reset    |
| POST   | `/auth/verify-otp-reset`  | Verify OTP for password reset  |
| POST   | `/auth/send-otp-change`   | Send OTP for password change   |
| POST   | `/auth/verify-otp-change` | Verify OTP for password change |
| POST   | `/auth/register`          | Register new user              |
| POST   | `/auth/login`             | User login                     |
| POST   | `/auth/reset-password`    | Reset password with OTP        |
| POST   | `/auth/change-password`   | Change password with OTP       |

---

## User Management (`/api/users`)

All endpoints **require authentication**.

| Method | Endpoint              | Auth Required | Role Required | Description                 |
| ------ | --------------------- | ------------- | ------------- | --------------------------- |
| GET    | `/users/me`           | ✅            | Any           | Get current user profile    |
| PUT    | `/users/me`           | ✅            | Any           | Update current user profile |
| GET    | `/users`              | ✅            | HR            | Get all users (paginated)   |
| GET    | `/users/stats`        | ✅            | HR            | Get user statistics         |
| GET    | `/users/:id`          | ✅            | HR or Own     | Get user by ID              |
| POST   | `/users`              | ✅            | HR            | Create new user             |
| PUT    | `/users/:id`          | ✅            | HR or Own     | Update user                 |
| PUT    | `/users/:id/password` | ✅            | Own           | Update user password        |
| DELETE | `/users/:id`          | ✅            | HR            | Delete user (not HR users)  |

---

## Applications (`/api/applications`)

All endpoints **require authentication**.

| Method | Endpoint                              | Auth Required | Role Required | Description                     |
| ------ | ------------------------------------- | ------------- | ------------- | ------------------------------- |
| POST   | `/applications`                       | ✅            | APPLICANT     | Create new application          |
| GET    | `/applications/my-applications`       | ✅            | APPLICANT     | Get user's applications         |
| GET    | `/applications/my-active-application` | ✅            | APPLICANT     | Get active application          |
| GET    | `/applications`                       | ✅            | HR            | Get all applications (filtered) |
| GET    | `/applications/:id`                   | ✅            | HR or Own     | Get application by ID           |
| PUT    | `/applications/:id`                   | ✅            | HR            | Update application              |
| DELETE | `/applications/:id`                   | ✅            | ADMIN         | Delete application              |
| PUT    | `/applications/:id/approve`           | ✅            | HR            | Approve application             |
| PUT    | `/applications/:id/reject`            | ✅            | HR            | Reject application              |
| PUT    | `/applications/:id/schedule`          | ✅            | HR            | Schedule demo                   |

---

## Scoring & Rubrics (`/api/scoring`)

All endpoints **require authentication**.

### Rubric Management

| Method | Endpoint               | Auth Required | Role Required | Description      |
| ------ | ---------------------- | ------------- | ------------- | ---------------- |
| POST   | `/scoring/rubrics`     | ✅            | HR/ADMIN      | Create rubric    |
| GET    | `/scoring/rubrics`     | ✅            | HR/ADMIN      | Get all rubrics  |
| GET    | `/scoring/rubrics/:id` | ✅            | HR/ADMIN      | Get rubric by ID |
| PUT    | `/scoring/rubrics/:id` | ✅            | HR/ADMIN      | Update rubric    |
| DELETE | `/scoring/rubrics/:id` | ✅            | ADMIN         | Delete rubric    |

### Score Management

| Method | Endpoint                                                | Auth Required | Role Required | Description            |
| ------ | ------------------------------------------------------- | ------------- | ------------- | ---------------------- |
| POST   | `/scoring/scores`                                       | ✅            | HR            | Create score           |
| GET    | `/scoring/applications/:applicationId/scores`           | ✅            | HR or Own     | Get application scores |
| PUT    | `/scoring/applications/:applicationId/scores/:rubricId` | ✅            | HR            | Update score           |
| DELETE | `/scoring/applications/:applicationId/scores/:rubricId` | ✅            | HR            | Delete score           |

### Score Calculation

| Method | Endpoint                                         | Auth Required | Role Required | Description                 |
| ------ | ------------------------------------------------ | ------------- | ------------- | --------------------------- |
| GET    | `/scoring/applications/:applicationId/calculate` | ✅            | HR            | Calculate total score       |
| POST   | `/scoring/applications/:applicationId/complete`  | ✅            | HR            | Complete scoring (finalize) |
| GET    | `/scoring/applications/:applicationId/summary`   | ✅            | HR or Own     | Get scores summary          |

---

## File Uploads (`/api/uploads`) ✨ NEW

### Public Endpoints

| Method | Endpoint                      | Auth Required | Description         |
| ------ | ----------------------------- | ------------- | ------------------- |
| POST   | `/uploads?type={type}`        | ❌            | Upload single file  |
| POST   | `/uploads/base64?type={type}` | ❌            | Upload base64 image |

**Upload Types:** `application`, `id`, `document`, `profile`, `general`

### Protected Endpoints

| Method | Endpoint                        | Auth Required | Description                    |
| ------ | ------------------------------- | ------------- | ------------------------------ |
| POST   | `/uploads/multiple?type={type}` | ✅            | Upload multiple files (max 10) |
| POST   | `/uploads/document`             | ✅            | Upload documents               |
| POST   | `/uploads/application`          | ✅            | Upload application docs        |
| DELETE | `/uploads/:publicId`            | ✅            | Delete file from Cloudinary    |
| GET    | `/uploads/:publicId/info`       | ✅            | Get file information           |

---

## Request/Response Formats

### Successful Response

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    /* response data */
  },
  "message": "Success message"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

---

## Common Query Parameters

### Pagination

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 10      | Items per page |

### Filtering

| Parameter | Type   | Description                                               |
| --------- | ------ | --------------------------------------------------------- |
| `status`  | string | Filter by status (PENDING, APPROVED, REJECTED, COMPLETED) |
| `role`    | string | Filter by role (APPLICANT, HR)                            |
| `search`  | string | Search by name or email                                   |

### Sorting

| Parameter   | Type   | Description                              |
| ----------- | ------ | ---------------------------------------- |
| `sortBy`    | string | Field to sort by (createdAt, name, etc.) |
| `sortOrder` | string | Sort direction (asc, desc)               |

---

## Authentication

### JWT Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Token is obtained from:

- `/api/auth/login` - Returns `{ token, user }`
- `/api/auth/register` - Returns `{ token, user }`

### Token Expiration

- Tokens expire after a configured time
- 401 Unauthorized returned for expired tokens
- User must login again to get new token

---

## Role-Based Access Control (RBAC)

### User Roles

| Role      | Description   | Permissions                                        |
| --------- | ------------- | -------------------------------------------------- |
| APPLICANT | Job applicant | Create applications, view own data                 |
| HR        | HR Personnel  | View all data, approve/reject, score, manage users |

### Middleware

- `auth.middleware.ts` - Validates JWT token
- `rbac.middleware.ts` - Enforces role-based access
  - `requireHR` - Requires HR role
  - `requireOwnershipOrHR` - Requires HR or resource owner
  - `requireModificationRights` - Requires HR or owner for updates

---

## File Upload Details

### Constraints

- **Max File Size:** 10MB per file
- **Max Files:** 10 files per request
- **Field Size:** 15MB (for base64)

### Allowed File Types

- **Images:** JPG, JPEG, PNG
- **Documents:** PDF, DOC, DOCX, TXT

### Cloudinary Folders

| Type        | Folder Path             |
| ----------- | ----------------------- |
| application | `bcfi_hr/applications/` |
| id          | `bcfi_hr/valid_ids/`    |
| document    | `bcfi_hr/documents/`    |
| profile     | `bcfi_hr/profiles/`     |
| general     | `bcfi_hr/general/`      |

### File Naming

Format: `YYYY-MM-DD_TIMESTAMP_originalname.ext`

Example: `2025-10-14_1728912345678_resume.pdf`

---

## Status Codes

| Code | Meaning               | Usage                              |
| ---- | --------------------- | ---------------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE        |
| 201  | Created               | Successful POST (resource created) |
| 400  | Bad Request           | Validation error, invalid data     |
| 401  | Unauthorized          | Missing or invalid token           |
| 403  | Forbidden             | Insufficient permissions           |
| 404  | Not Found             | Resource doesn't exist             |
| 413  | Payload Too Large     | File too large                     |
| 500  | Internal Server Error | Server error                       |

---

## Rate Limiting

⚠️ **Not currently implemented**

Consider adding rate limiting for:

- Authentication endpoints (prevent brute force)
- File upload endpoints (prevent abuse)
- Public endpoints (prevent DOS)

---

## CORS Configuration

CORS is enabled for all origins in development.

For production, configure specific origins in `app.ts`:

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

---

## Environment Variables

Required variables in `.env`:

```properties
# Database
DATABASE_URL="mysql://user:pass@localhost:3306/hr_ms"

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET="your-secret-key"

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD="app-password"

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Testing (optional)
TEST_DATABASE_URL="mysql://user:pass@localhost:3306/db_hr_test"
```

---

## Testing Endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get current user
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload file
curl -X POST "http://localhost:3000/api/uploads?type=application" \
  -F "file=@/path/to/document.pdf"
```

### Using Postman

1. Import endpoints as collection
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:3000/api`
3. Set auth token variable: `{{token}}`
4. Use Bearer Token authorization type

---

## Notification System

⚠️ **No REST API endpoints** - Notifications sent via email automatically

### Automatic Email Notifications

Emails are sent automatically for:

- Application submission
- Application approval
- Application rejection
- Demo scheduling
- Results (PASS/FAIL)
- New application alerts to HR

### Email Service

Configured in `src/utils/email.ts` using Nodemailer.

---

## Database Schema

### Key Models

- **User**: Applicants and HR personnel
- **Application**: Teacher applications with documents
- **Rubric**: Scoring criteria
- **Score**: Individual scores per rubric per application
- **Notification**: Email notification log
- **Otp**: OTP verification codes

See `prisma/schema.prisma` for complete schema.

---

## API Versioning

Currently: **No versioning** (v1 implicit)

For future versions, consider:

- `/api/v1/...` - Current version
- `/api/v2/...` - Future version

---

## Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Detailed error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Endpoint Summary

| Category     | Public | Auth Required | HR Only | Total  |
| ------------ | ------ | ------------- | ------- | ------ |
| Auth         | 10     | 0             | 0       | 10     |
| Users        | 0      | 6             | 3       | 9      |
| Applications | 0      | 6             | 4       | 10     |
| Scoring      | 0      | 8             | 4       | 12     |
| Uploads      | 2      | 4             | 0       | 6      |
| **Total**    | **12** | **24**        | **11**  | **47** |

---

## Next Steps

1. ✅ Implementation complete
2. ⏳ Test all endpoints
3. ⏳ Add rate limiting
4. ⏳ Add request logging
5. ⏳ Add API documentation (Swagger/OpenAPI)
6. ⏳ Add monitoring and analytics
7. ⏳ Production deployment

---

**Documentation Files:**

- `API_QUICK_REFERENCE.md` - Quick usage guide
- `CLOUDINARY_UPLOAD_GUIDE.md` - Upload implementation guide
- `FRONTEND_BACKEND_SYNC.md` - Frontend alignment guide

---

**Last Updated:** October 14, 2025  
**Status:** Complete ✅
