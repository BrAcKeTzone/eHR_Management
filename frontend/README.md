# BCFI HR Application System - Frontend

## Overview

This frontend application is part of the **BCFI HR Application System**, designed to streamline the hiring process for both applicants and HR staff. Built with modern web technologies, it provides a robust and user-friendly interface for managing applications, scheduling interviews, and tracking hiring progress.

## Features

### Authentication System

- **Multi-Phase Signup Process**

  - Email verification with OTP
  - Personal details collection
  - Password creation with confirmation
  - Real-time email duplicate checking

- **Secure Login**

  - Email-based authentication
  - OTP verification for login
  - JWT token management
  - Automatic session handling

- **Password Management**

  - Forgot password with OTP verification
  - Password reset functionality
  - Change password for authenticated users
  - Password strength validation

- **User Profiles**
  - Personal information management
  - Profile editing and updates
  - Theme preferences (light/dark mode)
  - Session management

### Applicant Portal

- **Application Management**

  - Submit comprehensive job applications
  - Upload required documents (resume, certificates, etc.)
  - Upload optional supporting documents
  - Real-time application status tracking
  - View detailed application history
  - Track document verification progress

- **Interview Management**

  - View scheduled interview dates
  - Access interview information
  - Real-time schedule updates
  - Interview confirmation status

- **Dashboard**
  - Application statistics
  - Recent status updates
  - Upcoming interviews
  - Document upload status

### HR Portal

- **Application Management**

  - Review incoming applications
  - Access applicant documents
  - Filter and search applications
  - Track application progress
  - Update application status
  - Manage application workflows

- **Applicant Scoring**

  - Rate applicants using predefined rubrics
  - Submit evaluation scores
  - Track scoring history
  - View scoring analytics
  - Generate evaluation reports

- **Interview & Demo Scheduling**

  - Schedule interviews and teaching demos
  - Set demo dates and times
  - Track scheduled events
  - Send scheduling notifications
  - Manage demonstration details

- **User Management**

  - Create and manage HR staff accounts
  - Assign user roles and permissions
  - View user statistics and activity
  - OTP-based secure user deletion
  - Email validation for duplicate prevention
  - Update user information

- **Reports & Analytics**
  - Generate application reports
  - Export reports to PDF format
  - View pipeline analytics
  - Track application metrics
  - Export data for analysis

## Tech Stack

- **Core Technologies**

  - React 18+ (UI framework)
  - Vite (build tooling and development server)
  - Zustand (state management)
  - React Router v6 (routing and navigation)
  - TypeScript support ready

- **UI/Styling**

  - Tailwind CSS (utility-first CSS framework)
  - Custom React components
  - Responsive design patterns
  - Dark/Light theme support
  - Icon library (React Icons)

- **Data Management**

  - Axios (HTTP client for API calls)
  - Zustand stores (predictable state management)
  - Form handling with built-in validation
  - Real-time data synchronization

- **Development Tools**
  - ESLint (code quality)
  - Prettier (code formatting)
  - Vite development server with HMR
  - Environment variable management (.env files)

## Project Structure

```
frontend/
├── public/                         # Static assets
│   ├── sample-resume.txt          # Sample resume file
│   └── assets/                    # Images and other media
├── src/
│   ├── api/                       # API integration modules
│   │   ├── applicationApi.js      # Application endpoints
│   │   ├── authApi.js             # Authentication endpoints
│   │   ├── notificationApi.js     # Notification endpoints
│   │   ├── reportApi.js           # Report endpoints
│   │   ├── scheduleApi.js         # Schedule endpoints
│   │   ├── scoringApi.js          # Scoring endpoints
│   │   └── userApi.js             # User management endpoints
│   │
│   ├── components/                # Reusable UI components
│   │   ├── Button.jsx             # Button component
│   │   ├── Modal.jsx              # Modal dialog component
│   │   ├── Input.jsx              # Text input component
│   │   ├── OTPInput.jsx           # 6-digit OTP input
│   │   ├── PasswordInput.jsx      # Password input field
│   │   ├── Table.jsx              # Data table component
│   │   ├── Pagination.jsx         # Pagination controls
│   │   ├── LoadingSpinner.jsx     # Loading indicator
│   │   ├── Navbar.jsx             # Navigation bar
│   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   ├── StatusBadge.jsx        # Status indicator
│   │   ├── NotificationCard.jsx   # Notification display
│   │   └── ThemeToggle.jsx        # Dark/light theme toggle
│   │
│   ├── features/                  # Feature-based modules
│   │   ├── auth/                  # Authentication features
│   │   │   ├── SigninForm.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   └── ForgotPasswordForm.jsx
│   │   ├── dashboard/             # Dashboard features
│   │   ├── comments/              # Discussion features
│   │   └── posts/                 # Post features
│   │
│   ├── layouts/                   # Page layouts
│   │   ├── AdminLayout.jsx        # HR admin layout
│   │   ├── AuthLayout.jsx         # Auth pages layout
│   │   └── MainLayout.jsx         # Main application layout
│   │
│   ├── pages/                     # Route pages
│   │   ├── HomePage.jsx           # Home page
│   │   ├── SigninPage.jsx         # Login page
│   │   ├── SignupPage.jsx         # Registration page
│   │   ├── ForgotPasswordPage.jsx # Password reset page
│   │   ├── ProfilePage.jsx        # User profile page
│   │   ├── DashboardPage.jsx      # Dashboard page
│   │   ├── Applicant/             # Applicant portal pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ApplicationForm.jsx
│   │   │   ├── ApplicationHistory.jsx
│   │   │   └── History.jsx
│   │   └── HR/                    # HR portal pages
│   │       ├── Dashboard.jsx
│   │       ├── ApplicationsManagement.jsx
│   │       ├── UserManagement.jsx
│   │       ├── Scoring.jsx
│   │       ├── Scheduling.jsx
│   │       ├── Review.jsx
│   │       └── Reports.jsx
│   │
│   ├── routes/                    # Route configuration
│   │   └── AppRoutes.jsx
│   │
│   ├── store/                     # Zustand state management
│   │   ├── authStore.js           # Authentication state
│   │   ├── userManagementStore.js # User management state
│   │   ├── applicationStore.js    # Application state
│   │   ├── scoringStore.js        # Scoring state
│   │   ├── scheduleStore.js       # Schedule state
│   │   ├── reportStore.js         # Report state
│   │   └── store.js               # Root store
│   │
│   ├── data/                      # Static data files
│   │   ├── applications.json      # Application templates
│   │   ├── rubrics.json           # Scoring rubrics
│   │   ├── users.json             # User data
│   │   └── privacyPolicy.json     # Privacy policy content
│   │
│   ├── styles/                    # Global styles
│   │   ├── index.css              # Main styles
│   │   └── tailwind.css           # Tailwind configuration
│   │
│   ├── utils/                     # Utility functions
│   │   ├── fetchClient.js         # Axios client configuration
│   │   ├── formatDate.js          # Date formatting utilities
│   │   ├── auth.js                # Authentication helpers
│   │   ├── validation.js          # Form validation
│   │   ├── constants.js           # Application constants
│   │   ├── helpers.js             # General helpers
│   │   ├── api.js                 # API utilities
│   │   └── theme.js               # Theme utilities
│   │
│   ├── App.jsx                    # Root component
│   └── main.jsx                   # Entry point
│
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── eslint.config.js               # ESLint configuration
├── .env                           # Environment variables
├── .env.development               # Development environment
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/BrAcKeTzone/eHR_Management.git
cd eHR_Management/frontend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL="http://localhost:3000"       # Backend API base URL

# Environment
NODE_ENV=development                       # development | production | test
```

4. Start development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Development
npm run dev        # Start Vite development server with HMR
npm run build      # Build optimized production bundle
npm run preview    # Preview production build locally

# Code Quality
npm run lint       # Run ESLint to check code quality
npm run format     # Format code with Prettier
```

## Development Guidelines

1. **Project Structure** - Follow the established folder organization
2. **Component Organization** - Place reusable components in `/components`
3. **Feature Modules** - Group related features in `/features` folder
4. **State Management** - Use Zustand stores for state management
5. **API Integration** - Use API methods from `/api` folder
6. **Styling** - Use Tailwind CSS classes and maintain responsive design
7. **Naming Conventions** - Use PascalCase for components, camelCase for variables
8. **Error Handling** - Implement proper error states and user feedback
9. **Form Validation** - Validate inputs before submission
10. **Testing** - Test thoroughly before submitting PRs

## Key Features Implementation

### Authentication Flow

- Three-phase signup: Email verification → OTP verification → Personal details
- Login with email and OTP verification
- Password reset and change functionality
- JWT token management with automatic session handling

### Applicant Features

- Multi-step application form
- Document upload (resume, certificates)
- Real-time status tracking
- Interview scheduling view
- Application history

### HR Features

- Application review and management
- Applicant scoring with rubrics
- Interview and demo scheduling
- User management with email validation
- Report generation and export
- OTP-based secure user deletion

### UI/UX Features

- Responsive design for all devices
- Dark and light theme support
- Loading indicators for async operations
- Modal dialogs for confirmations
- OTP input with 6 dynamic boxes
- Real-time form validation
- Error and success notifications

## Testing

The project includes vitest setup for testing. To run tests:

```bash
npm run test          # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Performance Tips

1. Use React DevTools to profile components
2. Enable code splitting for route-based pages
3. Optimize images before adding to assets
4. Review bundle size with `vite visualizer`
5. Use lazy loading for large lists
6. Implement proper caching strategies

## Troubleshooting

### Issue: 404 errors when calling API

**Solution:** Ensure backend is running on `http://localhost:3000` and `VITE_API_URL` in `.env` is correctly set.

### Issue: CORS errors

**Solution:** Backend CORS configuration should allow requests from `http://localhost:5173`.

### Issue: OTP not received

**Solution:** Check email configuration in backend `.env` and verify SMTP credentials.

### Issue: Session lost on page refresh

**Solution:** JWT token is stored in localStorage. Check browser's localStorage is enabled.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software of Blancia College Foundation Inc.
All rights reserved.

---

**Blancia College Foundation Inc.**  
_Transforming HR Management Through Technology_
