# Two-Factor Authentication (2FA) for Login

## Overview

Implemented a two-factor authentication system where users must verify their identity with an OTP (One-Time Password) sent to their registered email after entering correct login credentials. This adds an extra layer of security to the login process.

---

## How It Works

### Login Flow

1. **Phase 1: Credential Verification**

   - User enters email and password
   - Backend validates credentials
   - If valid, generates 6-digit OTP
   - Sends OTP to user's email
   - Returns response indicating OTP is required

2. **Phase 2: OTP Verification**
   - User receives OTP via email
   - Enters OTP in the login form
   - Backend verifies OTP
   - If valid, generates JWT token and completes login
   - Redirects to appropriate dashboard

---

## Backend Implementation

### 1. Auth Service (`backend/src/api/auth/auth.service.ts`)

#### Updated `login` function:

```typescript
export const login = async (
  email: string,
  password: string
): Promise<{ message: string; requiresOtp: boolean }>
```

**Changes:**

- Validates email and password (existing functionality)
- Generates 6-digit OTP using `otp-generator`
- Stores OTP in database with 10-minute expiration
- Sends OTP to user's email
- Returns `requiresOtp: true` instead of token

#### New `verifyLoginOtp` function:

```typescript
export const verifyLoginOtp = async (
  email: string,
  otp: string
): Promise<{ user: User; token: string }>
```

**Functionality:**

- Validates OTP against database
- Checks if OTP is not expired (within 10 minutes)
- Deletes OTP after successful verification
- Generates JWT token
- Returns user data and token

### 2. Auth Controller (`backend/src/api/auth/auth.controller.ts`)

#### Updated `login` controller:

```typescript
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(new ApiResponse(200, result, "OTP sent to your email"));
});
```

#### New `verifyLoginOtp` controller:

```typescript
export const verifyLoginOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await authService.verifyLoginOtp(email, otp);
    res.status(200).json(new ApiResponse(200, result, "Login successful"));
  }
);
```

### 3. Auth Routes (`backend/src/api/auth/auth.route.ts`)

**New route added:**

```typescript
router.post(
  "/verify-login-otp",
  validate(authValidation.verifyOtp),
  authController.verifyLoginOtp
);
```

---

## Frontend Implementation

### 1. Auth API (`frontend/src/api/authApi.js`)

**New method added:**

```javascript
// Verify Login OTP
verifyLoginOtp: async (email, otp) => {
  const response = await fetchClient.post(`${API_BASE}/verify-login-otp`, {
    email,
    otp,
  });
  return response.data;
};
```

### 2. Auth Store (`frontend/src/store/authStore.js`)

#### New state properties:

```javascript
// Login OTP phase state
loginPhase: 1, // 1: Credentials, 2: OTP Verification
loginData: {
  email: "",
  password: "",
  otp: "",
}
```

#### Updated `login` method:

```javascript
login: async (credentials) => {
  // Calls backend login API
  // Checks for requiresOtp flag
  // If true, sets loginPhase to 2
  // Returns { requiresOtp: true, email }
};
```

#### New `verifyLoginOtp` method:

```javascript
verifyLoginOtp: async (otp) => {
  // Calls backend verify-login-otp API
  // Receives user and token
  // Updates auth state
  // Stores token in localStorage
  // Returns { user, token }
};
```

#### New `resetLogin` method:

```javascript
resetLogin: () => {
  // Resets login phase to 1
  // Clears login data
  // Clears errors
};
```

### 3. SigninForm Component (`frontend/src/features/auth/SigninForm.jsx`)

**Complete rewrite with two-phase UI:**

#### Phase 1 - Credentials Input:

- Email input field
- Password input field
- "Continue" button
- Links to forgot password and signup

#### Phase 2 - OTP Verification:

- Info message showing email where OTP was sent
- 6-digit OTP input field (numeric only)
- "Verify & Sign In" button
- "Back to login" link

**Key features:**

- Phase switching based on `loginPhase` state
- OTP input validation (6 digits only)
- Loading states during API calls
- Error message display
- Back button to return to credentials phase

---

## API Endpoints

### POST `/api/auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "message": "OTP sent to your email. Please verify to complete login.",
    "requiresOtp": true
  }
}
```

### POST `/api/auth/verify-login-otp`

**Request:**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "APPLICANT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Email Template

**Subject:** Your OTP for BCFI Login Verification

**Body:**

```
Your OTP for login is: 123456. It will expire in 10 minutes.
```

---

## Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **Single Use**: OTPs are deleted after successful verification
3. **Secure Storage**: Passwords remain hashed in database
4. **Email Verification**: OTP sent to registered email only
5. **Failed Attempt Handling**: Invalid OTP returns error without lockout
6. **Token Generation**: JWT token only generated after successful OTP verification

---

## User Experience Flow

### Successful Login:

1. User enters email and password → Clicks "Continue"
2. System validates credentials → Sends OTP to email
3. User sees "Verify OTP" screen with email confirmation
4. User checks email → Enters 6-digit OTP
5. Clicks "Verify & Sign In"
6. System validates OTP → Generates token
7. User redirected to dashboard based on role

### Error Scenarios:

**Invalid Credentials:**

- Error shown on Phase 1
- User remains on credentials screen
- Can retry with correct credentials

**Invalid/Expired OTP:**

- Error shown on Phase 2
- User can retry with valid OTP
- Can go back to Phase 1 if needed

**Email Delivery Issues:**

- User can click "Back to login"
- Re-enter credentials to resend OTP
- Contact support if persistent issues

---

## Testing Checklist

### Backend Testing:

- [ ] Valid credentials send OTP email
- [ ] Invalid credentials return error
- [ ] OTP is stored in database
- [ ] OTP expires after 10 minutes
- [ ] Valid OTP completes login
- [ ] Invalid OTP returns error
- [ ] OTP is deleted after use
- [ ] Token is generated correctly

### Frontend Testing:

- [ ] Credentials form validates inputs
- [ ] Successful credential validation shows OTP screen
- [ ] OTP input accepts only 6 digits
- [ ] Back button returns to credentials
- [ ] Valid OTP completes login
- [ ] Invalid OTP shows error
- [ ] Loading states work correctly
- [ ] Navigation to dashboard works
- [ ] Error messages are clear

### Email Testing:

- [ ] OTP email is received
- [ ] Email contains correct OTP
- [ ] Email is well-formatted
- [ ] Email arrives within reasonable time

---

## Configuration

### Environment Variables (Backend):

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
```

### OTP Configuration:

- **Length**: 6 digits
- **Format**: Numeric only (0-9)
- **Expiration**: 10 minutes
- **Delivery**: Email

---

## Benefits

1. **Enhanced Security**: Two-factor verification prevents unauthorized access
2. **Email Verification**: Ensures user has access to registered email
3. **Audit Trail**: Login attempts can be tracked via OTP records
4. **User-Friendly**: Simple 6-digit code instead of complex 2FA apps
5. **Flexible**: Can be extended to support SMS or authenticator apps

---

## Future Enhancements

1. **Resend OTP**: Add button to resend OTP if not received
2. **OTP Attempt Limit**: Lock account after X failed OTP attempts
3. **Remember Device**: Option to skip OTP on trusted devices
4. **SMS Support**: Alternative OTP delivery via SMS
5. **Backup Codes**: Generate backup codes for emergency access
6. **Rate Limiting**: Prevent OTP spam by rate limiting requests

---

## Troubleshooting

### OTP Not Received:

1. Check spam/junk folder
2. Verify email is correct
3. Check email service is configured correctly
4. Use "Back to login" and retry

### OTP Expired:

1. Click "Back to login"
2. Re-enter credentials
3. New OTP will be sent

### Invalid OTP Error:

1. Verify correct 6-digit code
2. Check if OTP has expired
3. Request new OTP if needed

---

## Date Implemented

October 16, 2025

## Related Files

- `backend/src/api/auth/auth.service.ts`
- `backend/src/api/auth/auth.controller.ts`
- `backend/src/api/auth/auth.route.ts`
- `frontend/src/api/authApi.js`
- `frontend/src/store/authStore.js`
- `frontend/src/features/auth/SigninForm.jsx`
