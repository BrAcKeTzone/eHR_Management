# First User HR Assignment

## Overview

The system automatically assigns HR role to the first user who registers in the application.

## How it works

1. **First Registration**: When the very first user completes the registration process, they are automatically assigned the `HR` role regardless of what role they might have requested.

2. **Subsequent Registrations**: All users after the first one get the default `APPLICANT` role unless explicitly specified otherwise.

## Backend Implementation

The logic is implemented in `backend/src/api/auth/auth.service.ts` in the `register` function:

```typescript
// Check if this is the first user - if so, make them HR
const userCount = await prisma.user.count();
const assignedRole = userCount === 0 ? "HR" : role;

if (userCount === 0) {
  console.log(
    `First user registration detected. Assigning HR role to: ${email}`
  );
}
```

## User Experience

- **First User**: Receives a special message: "Registration successful! As the first user, you have been assigned HR privileges."
- **Other Users**: Receives standard message: "Registration successful!"

## Database Requirements

- The system counts existing users using `prisma.user.count()`
- No seed data should exist for this feature to work properly
- The first user check happens during the registration transaction

## Security Notes

- This feature is designed for initial system setup
- Only the very first user gets automatic HR privileges
- All subsequent users must be manually promoted by existing HR users

## Testing

To test this feature:

1. Ensure the database is completely empty (no users)
2. Complete the full registration process (OTP verification + registration)
3. The first user should receive HR role and special message
4. Subsequent registrations should get APPLICANT role

## Logging

The system logs when the first user is detected:

```
First user registration detected. Assigning HR role to: user@example.com
```
