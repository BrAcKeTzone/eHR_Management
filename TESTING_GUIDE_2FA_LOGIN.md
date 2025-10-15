# Two-Factor Authentication - Quick Test Guide

## Test the Feature

### Prerequisites

✅ Backend running on `http://localhost:3000`
✅ Frontend running on `http://localhost:5174`
✅ Email service configured in backend `.env`

---

## Test Scenario 1: Successful Login with OTP

### Step 1: Navigate to Login Page

1. Open browser: `http://localhost:5174/signin`
2. You should see the login form

### Step 2: Enter Credentials

1. Enter your email: `your-email@example.com`
2. Enter your password: `your-password`
3. Click **"Continue"** button

### Step 3: Check Email

1. Backend will send OTP to your email
2. Check your email inbox (or spam folder)
3. Subject: "Your OTP for BCFI Login Verification"
4. Copy the 6-digit OTP

### Step 4: Verify OTP

1. You should now see the "Verify OTP" screen
2. Enter the 6-digit OTP
3. Click **"Verify & Sign In"** button

### Step 5: Access Dashboard

1. You should be redirected to:
   - `/hr/dashboard` (if you're HR)
   - `/applicant/dashboard` (if you're Applicant)

---

## Test Scenario 2: Invalid Credentials

### Steps:

1. Go to login page
2. Enter incorrect email or password
3. Click "Continue"
4. ❌ Error message: "Incorrect email or password"
5. OTP should NOT be sent

---

## Test Scenario 3: Invalid OTP

### Steps:

1. Complete Step 1-2 from Scenario 1 (enter valid credentials)
2. On OTP screen, enter wrong OTP: `999999`
3. Click "Verify & Sign In"
4. ❌ Error message: "Invalid or expired OTP"
5. You can retry with correct OTP

---

## Test Scenario 4: Expired OTP

### Steps:

1. Complete Step 1-3 from Scenario 1
2. Wait for 11+ minutes (OTP expires after 10 minutes)
3. Try to verify the OTP
4. ❌ Error message: "Invalid or expired OTP"
5. Click "Back to login" and start over

---

## Test Scenario 5: Back to Login

### Steps:

1. Complete Step 1-2 from Scenario 1
2. On OTP screen, click **"← Back to login"**
3. You should return to credentials screen
4. Can re-enter credentials to get new OTP

---

## Expected Behavior Checklist

### Phase 1 - Credentials:

- [ ] Email field validates format
- [ ] Password field is masked
- [ ] "Continue" button disabled until both fields filled
- [ ] Loading spinner shows during submission
- [ ] Error message displays for invalid credentials
- [ ] Success transitions to OTP screen

### Phase 2 - OTP:

- [ ] Shows email where OTP was sent
- [ ] OTP input accepts only 6 digits
- [ ] "Verify & Sign In" disabled until 6 digits entered
- [ ] Loading spinner shows during verification
- [ ] Error message displays for invalid OTP
- [ ] Success redirects to dashboard
- [ ] "Back to login" returns to Phase 1

### Email Delivery:

- [ ] OTP email arrives within seconds
- [ ] Email contains 6-digit code
- [ ] Email is readable and formatted
- [ ] OTP matches what's in database

---

## Database Check

### Verify OTP is stored:

```sql
SELECT * FROM Otp WHERE email = 'your-email@example.com';
```

### Verify OTP is deleted after use:

```sql
-- After successful verification, this should return no rows
SELECT * FROM Otp WHERE email = 'your-email@example.com';
```

---

## Browser Console Checks

### Successful Flow:

```
Login response: { requiresOtp: true, email: "user@example.com" }
OTP verification response: { user: {...}, token: "..." }
localStorage: authToken set
```

### Error Flow:

```
Error: Incorrect email or password
// or
Error: Invalid or expired OTP
```

---

## API Testing (Optional)

### Test with Postman/cURL:

#### 1. Login (send OTP):

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**

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

#### 2. Verify OTP:

```bash
POST http://localhost:3000/api/auth/verify-login-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Expected Response:**

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
    "token": "eyJhbGci..."
  }
}
```

---

## Common Issues & Solutions

### Issue: OTP not received

**Solution:**

- Check spam folder
- Verify email service configuration in `.env`
- Check backend logs for email sending errors

### Issue: "Port already in use"

**Solution:**

- Backend using alternate port (check terminal output)
- Frontend using port 5174 instead of 5173

### Issue: OTP verification fails

**Solution:**

- Ensure OTP is correct (case-sensitive digits only)
- Check if OTP expired (10-minute limit)
- Verify email matches the one used in Phase 1

### Issue: Can't go back to credentials

**Solution:**

- Click "← Back to login" link
- Refresh page if stuck

---

## Security Notes

✅ Passwords are hashed in database
✅ OTPs expire after 10 minutes
✅ OTPs are deleted after successful use
✅ Email verification ensures valid email access
✅ JWT tokens have 7-day expiration

---

## Next Steps

After successful testing:

1. ✅ Mark feature as complete
2. ✅ Update user documentation
3. ✅ Consider adding "Resend OTP" button
4. ✅ Monitor email delivery rates
5. ✅ Set up rate limiting for OTP requests

---

**Date:** October 16, 2025
**Feature:** Two-Factor Authentication for Login
**Status:** ✅ Ready for Testing
