# BCFI HR Application System - Backend API

## Overview

This is the backend service for the **BCFI HR Application System**, providing a robust API for managing the teacher application process. Built with TypeScript and Express.js, it handles user authentication, application processing, document management, and automated notifications for Blancia College Foundation Inc.'s HR department.

---

## Core Features

### Authentication & Security

- **JWT-based Authentication**
  - Secure token management with JWT tokens
  - Role-based access control (RBAC) - APPLICANT and HR roles
  - Email verification with 6-digit OTP (10-minute expiration)
  - Password encryption with bcryptjs
  - Multi-phase signup process (email verification → personal details)
  - Login with OTP verification
  - Password reset and change functionality

### User Management

- **HR User Management**
  - Create, read, update, delete HR staff accounts
  - OTP-based secure HR user deletion
  - User statistics and analytics
  - Email uniqueness validation
  - Phone number storage and tracking

### Application Processing

- **Document Management**

  - Secure file uploads with Cloudinary
  - Document validation and restrictions
  - Support for required and optional documents
  - Public document IDs for secure access
  - Automatic cloud storage integration
  - Resume and certificate uploads

- **Application Lifecycle**
  - Complete application status tracking
  - Application version history
  - Real-time status updates via notifications
  - Document verification workflow
  - Support for multiple application submissions

### HR Management Tools

- **Application Review System**

  - Document verification and review
  - Applicant scoring system with customizable rubrics
  - Teaching demo scheduling
  - Interview scheduling with date validation
  - Real-time applicant status tracking
  - Automated status transitions

- **Evaluation System**
  - Customizable scoring rubrics per position
  - Real-time score calculation
  - Performance analytics and reports
  - Result generation and PDF export
  - Score history tracking

### Notification System

- **Email Services**
  - Application submission confirmations
  - Interview scheduling notifications
  - Document verification status updates
  - OTP delivery for authentication
  - HR account management notifications
  - Automated email scheduling

---

## Technical Stack

- **Core Framework**

  - TypeScript 5.0+
  - Node.js 18+
  - Express.js 4.18+

- **Database & ORM**

  - MySQL 8.0+
  - Prisma ORM
  - Migration system

- **Authentication**

  - JSON Web Tokens (JWT)
  - Bcrypt password hashing
  - Role-based middleware

- **File Handling**

  - Multer
  - Cloudinary integration
  - Stream processing

- **Testing**
  - Vitest
  - Supertest
  - Coverage reporting

## Project Structure

```typescript
backend/
├── src/
│   ├── api/                    # API Modules
│   │   ├── applications/       # Application management
│   │   ├── auth/              # Authentication & authorization
│   │   ├── notifications/      # Email & notification system
│   │   ├── reports/           # Reporting services
│   │   ├── scoring/           # Evaluation system
│   │   └── users/             # User management
│   │
│   ├── configs/               # Configuration files
│   │   ├── cloudinary.ts      # Cloud storage setup
│   │   └── prisma.ts          # Database configuration
│   │
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.middleware.ts # JWT verification
│   │   ├── rbac.middleware.ts # Role-based access
│   │   └── upload.middleware.ts# File upload handling
│   │
│   ├── routes/                # API routes
│   ├── types/                 # TypeScript definitions
│   ├── utils/                 # Utility functions
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
│
├── prisma/                    # Database schema & migrations
├── coverage/                  # Test coverage reports
└── uploads/                   # Temporary file storage
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/BrAcKeTzone/eHR_Management.git
cd eHR_Management/backend
```

2. Install dependencies

```bash
npm install
```

3. Configure environment
   Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL="mysql://root@localhost:3306/hr_ms"      # Main database URL
TEST_DATABASE_URL="mysql://root@localhost:3306/db_hr_test"  # Test database URL

# Server Configuration
PORT=3000                                            # Server port number
NODE_ENV=development                                 # development | production | test

# Authentication
JWT_SECRET="yoursecretkey"                          # JWT signing secret

# Email Configuration - Primary (Legacy)
EMAIL_USER="your-email@gmail.com"                    # Email user (legacy)
EMAIL_PASS="your-app-password"                       # Email password (legacy)

# Email Configuration - SMTP
EMAIL_HOST=smtp.gmail.com                            # SMTP server host
EMAIL_PORT=587                                       # SMTP server port
EMAIL_USERNAME="your-email@gmail.com"                # SMTP username
EMAIL_PASSWORD="your-app-password"                   # SMTP password

# Cloudinary Configuration
CLOUDINARY_NAME="your-cloud-name"                    # Cloudinary cloud name
CLOUDINARY_API_KEY="your-cloudinary-key"             # Cloudinary API key
CLOUDINARY_API_SECRET="your-cloudinary-secret"       # Cloudinary API secret

# Frontend Configuration
FRONTEND_URL="http://localhost:5173/"                # Frontend application URL
```

**Note**: Replace the email, Cloudinary, and other sensitive values with your actual credentials. Never commit real credentials to version control.

4. Initialize database

```bash
npx prisma generate
npx prisma migrate dev
```

5. Start development server

```bash
npm run dev
```

## Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run migrate      # Run database migrations
npm run seed         # Seed initial data

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage# Generate coverage report

# Maintenance
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

---

## API Documentation

### Authentication Routes (`/api/auth`)

```typescript
POST / send - otp; // Send OTP to email for signup
POST / verify - otp; // Verify email with OTP during signup
POST / register; // Complete registration with personal details
POST / login; // User login
POST / verify - login - otp; // Verify OTP for login authentication
POST / send - otp - reset; // Send OTP for password reset
POST / verify - otp - reset; // Verify OTP for password reset
POST / reset - password; // Reset password with OTP
POST / send - otp - change; // Send OTP for password change
POST / verify - otp - change; // Verify OTP for password change
POST / change - password; // Change password (authenticated users)
```

### User Management Routes (`/api/users`)

```typescript
GET    /check-email             // Check if email already exists (PUBLIC)
GET    /me                      // Get current user profile
GET    /stats                   // Get user statistics (HR only)
GET    /                        // List all users with pagination (HR only)
GET    /:id                     // Get user by ID
POST   /                        // Create new user (HR only)
POST   /hr-deletion/send-otp    // Send OTP for HR deletion (HR only)
POST   /:id/verify-and-delete-hr// Verify OTP and delete HR user (HR only)
PUT    /me                      // Update current user profile
PUT    /:id                     // Update user (HR or own profile)
PUT    /:id/password            // Update user password
DELETE /:id                     // Delete user (HR only, non-HR users)
```

### Application Routes (`/api/applications`)

```typescript
GET    /                        // List applications with filtering (HR only)
GET    /:id                     // Get application details
POST   /                        // Submit new application (Applicants)
PUT    /:id                     // Update application
PUT    /:id/review              // Review application (HR only)
PUT    /:id/status              // Update application status
DELETE /:id                     // Delete application
```

### Scoring & Evaluation Routes (`/api/scoring`)

```typescript
GET    /                        // Get all scoring records
GET    /:id                     // Get scoring details
POST   /                        // Submit applicant evaluation
PUT    /:id                     // Update scoring
GET    /rubric/:positionId      // Get scoring rubric for position
```

### Scheduling Routes (`/api/schedules`)

```typescript
GET    /                        // List schedules
GET    /:id                     // Get schedule details
POST   /                        // Create interview schedule (HR only)
PUT    /:id                     // Update schedule
DELETE /:id                     // Delete schedule
```

### Notifications Routes (`/api/notifications`)

```typescript
GET    /                        // Get user notifications
GET    /:id                     // Get notification details
PUT    /:id/mark-read           // Mark notification as read
DELETE /:id                     // Delete notification
```

### Reports Routes (`/api/reports`)

```typescript
GET    /applications            // Generate application report
GET    /scoring/:positionId     // Generate scoring report
GET    /pipeline                // Get application pipeline report
POST   /export                  // Export reports to PDF/CSV
```

### Upload Routes (`/api/uploads`)

```typescript
POST   /                        // Upload document
GET    /:id                     // Download/retrieve document
DELETE /:id                     // Delete document
```

## Error Handling

The API uses a consistent error response format:

```typescript
{
  success: boolean,
  message: string,
  error?: {
    code: string,
    details: any
  }
}
```

---

## Testing

The project uses Vitest for testing. Run tests with:

```bash
npm run test
```

View coverage report:

```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

Copyright © 2025 Blancia College Foundation Inc.
All rights reserved.

---

**Blancia College Foundation Inc.**  
_Building the Future of Education_
