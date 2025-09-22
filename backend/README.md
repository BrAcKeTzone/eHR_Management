# BCFI HR Application System - Teacher Application Process

## Overview

This project is an **Automated HR Filing & Email Notification System** designed for Blancia College Foundation Inc. (BCFI). It streamlines the teacher application process by providing an efficient digital platform for applicants to submit applications and for HR to manage reviews, scheduling, and evaluations.

## Technologies Used

- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Express.js**: A web application framework for Node.js, used to build the backend API.
- **Prisma**: An ORM (Object-Relational Mapping) tool that simplifies database interactions.
- **MySQL**: A relational database management system used to store application data.
- **JWT**: JSON Web Tokens for secure authentication and authorization.
- **Nodemailer**: For sending automated email notifications throughout the application process.

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Prisma schema for HR application models
│   └── migrations/         # Database migrations
├── src/
│   ├── api/                # Feature-based modules (routes, controllers, services)
│   │   ├── applications/   # Application management (CRUD, status updates)
│   │   │   ├── applications.controller.ts
│   │   │   ├── applications.route.ts
│   │   │   └── applications.service.ts
│   │   ├── auth/           # Authentication and user management
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── notifications/  # Email notification system
│   │   │   └── notifications.service.ts
│   │   ├── scoring/        # Rubric scoring and evaluation
│   │   │   ├── scoring.controller.ts
│   │   │   ├── scoring.route.ts
│   │   │   └── scoring.service.ts
│   │   └── users/          # User management
│   ├── configs/
│   │   └── prisma.ts       # Prisma client instance
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT authentication middleware
│   │   ├── error.middleware.ts   # Error handling middleware
│   │   └── validate.middleware.ts # Request validation middleware
│   ├── routes/
│   │   └── index.ts        # Main API router
│   ├── types/
│   │   └── environment.d.ts # TypeScript environment declarations
│   ├── utils/              # Utility functions and classes
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   └── email.ts
│   ├── app.ts              # Express application setup and middleware
│   └── server.ts           # Server initialization
├── .env                    # Environment variables (DB connection, JWT secret, etc.)
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Features

### **Authentication & User Management**

- **Secure Registration**: Applicants can self-register with email verification
- **Role-Based Access Control**: Separate access for APPLICANT, HR, and ADMIN roles
- **JWT Authentication**: Secure token-based authentication system

### **Applicant Features**

- **Application Submission**: Upload documents and submit teacher applications
- **Single Active Application**: Only one active application allowed at a time
- **Status Tracking**: Real-time tracking of application status (Pending, Approved, Rejected, Completed)
- **Demo Schedule Viewing**: View teaching demonstration date and time when approved
- **Score & Results**: View rubric scores and pass/fail results after evaluation
- **Application History**: Access to all previous application attempts

### **HR/Admin Features**

- **Application Review**: Review applicant documents and details
- **Approval/Rejection**: Approve or reject applications with HR notes
- **Demo Scheduling**: Schedule teaching demonstrations for approved applicants
- **Rubric Scoring**: Input scores based on configurable rubric criteria
- **Applicant Tracking**: View and filter all applications by status
- **Score Calculation**: Automatic calculation of final scores and pass/fail determination

### **Automated Notifications**

- **Email Alerts**: Automated emails for submission, approval, rejection, scheduling, and results
- **HR Notifications**: Immediate alerts to HR when new applications are submitted
- **Status Updates**: Real-time notifications for all application status changes

### **Scoring System**

- **Configurable Rubrics**: Create and manage scoring criteria with weights
- **Detailed Scoring**: Input scores per criteria with comments
- **Automatic Calculation**: Auto-compute total scores and pass/fail results
- **Score History**: Track all scoring data for reporting and analysis

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration with OTP verification
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP for email verification

### Applications

- `POST /api/applications` - Create new application (Applicants)
- `GET /api/applications/my-applications` - Get applicant's applications
- `GET /api/applications/my-active-application` - Get active application
- `GET /api/applications` - Get all applications (HR/Admin)
- `GET /api/applications/:id` - Get specific application
- `PUT /api/applications/:id/approve` - Approve application (HR/Admin)
- `PUT /api/applications/:id/reject` - Reject application (HR/Admin)
- `PUT /api/applications/:id/schedule` - Schedule demo (HR/Admin)

### Scoring & Rubrics

- `POST /api/scoring/rubrics` - Create rubric criteria (HR/Admin)
- `GET /api/scoring/rubrics` - Get all rubrics
- `POST /api/scoring/scores` - Input scores (HR/Admin)
- `GET /api/scoring/applications/:id/scores` - Get application scores
- `POST /api/scoring/applications/:id/complete` - Complete scoring (HR/Admin)
- `GET /api/scoring/applications/:id/summary` - Get score summary

## Database Schema

### Key Models

- **User**: Applicants, HR, and Admin users with role-based access
- **Application**: Teacher applications with status tracking and attempt numbers
- **Rubric**: Configurable scoring criteria with weights
- **Score**: Individual rubric scores for each application
- **Notification**: Email notification audit trail

## Setup and Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd BCFI_web_app_for_hr_applicant/eHR_Management/backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file with:

   ```env
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
   PORT=3000
   JWT_SECRET="your_jwt_secret_key"
   JWT_EXPIRES_IN="7d"

   # Email Configuration
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASS="your_app_password"

   # Scoring Configuration
   PASSING_SCORE_PERCENTAGE=70
   ```

4. **Generate Prisma client and run migrations**:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Seed default rubrics (optional)**:

   ```bash
   npm run seed
   ```

6. **Run the application**:
   ```bash
   npm run dev
   ```

## System Workflow

### Applicant Journey

1. **Registration** → Email verification → Login
2. **Application Submission** → Upload documents + program selection
3. **HR Review** → Pending status until HR decision
4. **Approval** → Demo scheduling notification
5. **Teaching Demo** → HR evaluates using rubric
6. **Results** → Final score and pass/fail notification

### HR Workflow

1. **New Application Alert** → Email notification to HR team
2. **Review Process** → Examine documents and applicant details
3. **Decision** → Approve (schedule demo) or Reject (notify applicant)
4. **Demo Evaluation** → Score using rubric criteria
5. **Results** → Calculate final score and notify applicant

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

**Blancia College Foundation Inc.**  
_Automated HR Filing & Email Notification System_
