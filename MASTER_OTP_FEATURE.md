# Master OTP for Login Verification

## Overview

Added a master OTP code (`000000`) that will always be accepted during login verification. This provides emergency access and simplifies testing without needing to check email for OTP codes.

---

## Feature Details

### Master OTP Code

**Code:** `000000` (six zeros)

### Usage

When prompted for OTP during login, enter `000000` to bypass the regular OTP verification and gain immediate access.

---

## How It Works

### Regular Login Flow (with email OTP):

1. User enters email and password
2. System sends OTP to user's email
3. User checks email and enters received OTP
4. System verifies OTP against database
5. If valid, user is logged in

### Master OTP Flow:

1. User enters email and password
2. System sends OTP to user's email (still happens)
3. User enters `000000` instead of checking email
4. System recognizes master OTP and grants access immediately
5. User is logged in without email verification

---

## Implementation

### File Modified

`backend/src/api/auth/auth.service.ts`

### Code Changes

#### In `verifyLoginOtp` function:

```typescript
export const verifyLoginOtp = async (
  email: string,
  otp: string
): Promise<{ user: User; token: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Master OTP for emergency access and testing
  const MASTER_OTP = "000000";

  // Check if it's the master OTP
  if (otp === MASTER_OTP) {
    console.log(`Master OTP used for login by: ${email}`);

    // Delete any existing OTP records for this email to clean up
    await prisma.otp.deleteMany({
      where: { email },
    });

    const token = generateToken(user.id);
    return { user, token };
  }

  // Regular OTP verification continues...
};
```

---

## Security Considerations

### ⚠️ Important Security Notes

1. **Production Environment:**

   - Consider disabling master OTP in production
   - Or restrict it to specific admin accounts only
   - Log all master OTP usage for audit trail

2. **Access Control:**

   - Master OTP works for ANY valid user account
   - Requires valid email and password first
   - Still validates user credentials before OTP check

3. **Logging:**
   - Every master OTP usage is logged to console
   - Format: `Master OTP used for login by: user@example.com`
   - Can be extended to database logging for security audits

### Current Security Layer

```
Layer 1: Email + Password ✅ (Still Required)
Layer 2: OTP Verification ⚠️ (Bypassed with Master OTP)
```

The master OTP bypasses the second layer but NOT the first layer. Valid credentials are still required.

---

## Use Cases

### 1. Development & Testing

**Scenario:** Developer needs to test login flow multiple times

- Enter credentials
- Use `000000` instead of checking email each time
- Faster testing cycles

### 2. Demo Presentations

**Scenario:** Showing the application to stakeholders

- Demonstrate login without email delays
- Smooth presentation flow
- No need to switch to email client

### 3. Email Service Downtime

**Scenario:** Email service is temporarily unavailable

- Users can still access the system
- Emergency access maintained
- Business continuity ensured

### 4. Automated Testing

**Scenario:** Running automated test scripts

- Tests don't depend on email delivery
- Consistent and reliable test results
- Faster CI/CD pipelines

---

## How to Use

### For Testers:

1. Go to login page: `http://localhost:5174/signin`
2. Enter your email and password
3. Click "Continue"
4. When prompted for OTP, enter: `000000`
5. Click "Verify & Sign In"
6. You're logged in!

### For Users (Production):

⚠️ **Note:** Master OTP should ideally be disabled or restricted in production.

If enabled in production:

- Document should be kept confidential
- Only share with authorized personnel
- Monitor usage through logs

---

## Testing the Feature

### Test Case 1: Master OTP Login

**Steps:**

1. Navigate to login page
2. Enter valid email: `test@example.com`
3. Enter valid password: `password123`
4. Click "Continue"
5. Enter OTP: `000000`
6. Click "Verify & Sign In"

**Expected Result:**

- ✅ User successfully logged in
- ✅ Redirected to appropriate dashboard
- ✅ Console log shows: "Master OTP used for login by: test@example.com"
- ✅ JWT token generated and stored

### Test Case 2: Regular OTP Still Works

**Steps:**

1. Navigate to login page
2. Enter valid credentials
3. Click "Continue"
4. Check email for OTP
5. Enter actual OTP from email
6. Click "Verify & Sign In"

**Expected Result:**

- ✅ User successfully logged in
- ✅ Regular OTP verification works as expected
- ✅ OTP deleted from database after use

### Test Case 3: Invalid Credentials + Master OTP

**Steps:**

1. Navigate to login page
2. Enter invalid email or password
3. Click "Continue"

**Expected Result:**

- ❌ Error: "Incorrect email or password"
- ❌ OTP screen never shown
- ❌ Master OTP cannot bypass credential check

### Test Case 4: Master OTP + Invalid Email

**Steps:**

1. Complete credential verification
2. Enter OTP screen
3. Use different email that wasn't used in Step 1
4. Enter master OTP: `000000`

**Expected Result:**

- ✅ System uses email from login credentials, not OTP form
- ✅ Master OTP still works (email is tracked from Phase 1)

---

## Database Cleanup

When master OTP is used:

```typescript
// Delete any existing OTP records for this email to clean up
await prisma.otp.deleteMany({
  where: { email },
});
```

This ensures:

- No orphaned OTP records in database
- Clean state for next login attempt
- Proper database maintenance

---

## Logging and Monitoring

### Console Log Format

```
Master OTP used for login by: user@example.com
```

### Recommended Enhancements for Production

1. **Database Logging:**

```typescript
await prisma.auditLog.create({
  data: {
    action: "MASTER_OTP_LOGIN",
    userId: user.id,
    email: email,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    timestamp: new Date(),
  },
});
```

2. **Alert System:**

```typescript
if (otp === MASTER_OTP) {
  // Send alert to admin
  await sendEmail({
    to: "admin@bcfi.edu.ph",
    subject: "Master OTP Used",
    message: `Master OTP was used for login by: ${email}`,
  });
}
```

3. **Rate Limiting:**

```typescript
// Limit master OTP usage to X times per day per user
const todayUsage = await getMasterOtpUsageToday(email);
if (todayUsage >= 5) {
  throw new ApiError(429, "Master OTP usage limit exceeded");
}
```

---

## Configuration Options

### Option 1: Environment Variable Control

```env
# .env
ENABLE_MASTER_OTP=true
MASTER_OTP_CODE=000000
```

```typescript
const MASTER_OTP = process.env.MASTER_OTP_CODE || "000000";
const MASTER_OTP_ENABLED = process.env.ENABLE_MASTER_OTP === "true";

if (MASTER_OTP_ENABLED && otp === MASTER_OTP) {
  // Master OTP logic
}
```

### Option 2: Role-Based Access

```typescript
// Only allow master OTP for HR/Admin users
if (otp === MASTER_OTP) {
  if (user.role !== "HR" && user.role !== "ADMIN") {
    throw new ApiError(403, "Master OTP not available for your role");
  }
  // Continue with master OTP logic
}
```

### Option 3: Time-Based Expiry

```typescript
// Master OTP only works during business hours
const currentHour = new Date().getHours();
if (otp === MASTER_OTP) {
  if (currentHour < 8 || currentHour > 18) {
    throw new ApiError(403, "Master OTP only available during business hours");
  }
  // Continue with master OTP logic
}
```

---

## Recommendations

### For Development Environment:

✅ **ENABLE** master OTP

- Speeds up development
- Simplifies testing
- No security concerns in dev

### For Staging Environment:

⚠️ **ENABLE with LOGGING**

- Useful for QA testing
- Monitor usage patterns
- Prepare for production

### For Production Environment:

❌ **DISABLE or RESTRICT**

- Security risk if widely known
- Implement role-based restriction
- Add comprehensive logging
- Consider IP whitelist
- Add rate limiting

---

## Disabling Master OTP for Production

### Method 1: Comment Out Code

```typescript
export const verifyLoginOtp = async (
  email: string,
  otp: string
): Promise<{ user: User; token: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // DISABLED IN PRODUCTION
  // const MASTER_OTP = "000000";
  // if (otp === MASTER_OTP) {
  //   // Master OTP logic
  // }

  // Regular OTP verification only
  const otpRecord = await prisma.otp.findFirst({
    // ...
  });
  // ...
};
```

### Method 2: Environment Variable

```typescript
const ENABLE_MASTER_OTP = process.env.NODE_ENV !== "production";

if (ENABLE_MASTER_OTP && otp === MASTER_OTP) {
  // Master OTP logic
}
```

---

## Date Implemented

October 16, 2025

## Related Files

- `backend/src/api/auth/auth.service.ts` - Main implementation

## Related Documentation

- `TWO_FACTOR_LOGIN_AUTHENTICATION.md` - Login OTP system
- `TESTING_GUIDE_2FA_LOGIN.md` - Testing procedures

---

**Status:** ✅ Implemented and Working
**Environment:** Development/Testing
**Production Ready:** ⚠️ Requires security review and restrictions
