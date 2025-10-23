# BCFI HR Application System - Backend API

## Overview

This is the backend service for the **BCFI HR Application System**, providing a robust API for managing the teacher application process. Built with TypeScript and Express.js, it handles user authentication, application processing, document management, and automated notifications for Blancia College Foundation Inc.'s HR department.

---

## Core Features

### Authentication & Security

- **JWT-based Authentication**
  - Secure token management
  - Role-based access control (RBAC)
  - Email verification with OTP
  - Password encryption
  - Session management

### Application Processing

- **Document Management**

  - Secure file uploads
  - Document validation
  - Cloud storage integration
  - File type restrictions

- **Application Lifecycle**
  - Status tracking
  - Version control
  - History management
  - Automated state transitions

### HR Management Tools

- **Application Review System**

  - Document verification
  - Applicant scoring
  - Teaching demo scheduling
  - Automated notifications

- **Evaluation System**
  - Customizable scoring rubrics
  - Real-time score calculation
  - Performance analytics
  - Result generation

### Notification System

- **Email Services**
  - Application status updates
  - Interview scheduling
  - Document verification
  - Result notifications
  - HR alerts

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

### Authentication Routes

```typescript
POST / api / auth / register; // Register new user
POST / api / auth / login; // User login
POST / api / auth / verify - email; // Verify email with OTP
POST / api / auth / resend - otp; // Resend verification OTP
POST / api / auth / forgot - password; // Request password reset
```

### Application Routes

```typescript
POST   /api/applications     // Submit new application
GET    /api/applications     // List all applications (HR)
GET    /api/applications/:id // Get application details
PUT    /api/applications/:id // Update application
DELETE /api/applications/:id // Delete application
```

### Document Routes

```typescript
POST   /api/uploads         // Upload document
DELETE /api/uploads/:id     // Delete document
GET    /api/uploads/:id     // Download document
```

### HR Management Routes

```typescript
PUT    /api/applications/:id/review   // Review application
POST   /api/applications/:id/schedule // Schedule interview
POST   /api/scoring/:id              // Submit evaluation
GET    /api/reports/applications      // Generate reports
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
