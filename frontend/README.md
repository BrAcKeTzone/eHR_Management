# BCFI HR Application System - Frontend

## Overview

This frontend application is part of the **BCFI HR Application System**, designed to streamline the hiring process for both applicants and HR staff. Built with modern web technologies, it provides a robust and user-friendly interface for managing applications, scheduling interviews, and tracking hiring progress.

## Features

### Applicant Portal

- **Application Management**

  - Submit detailed job applications
  - Upload required documents (resume, certificates, etc.)
  - Track application status in real-time
  - View and respond to interview schedules

- **Profile Management**
  - Create and update personal profile
  - Manage uploaded documents
  - View application history

### HR Portal

- **Application Processing**

  - Review incoming applications
  - Manage applicant documents
  - Schedule interviews and demonstrations
  - Track application progress

- **Evaluation System**

  - Score applicants using predefined rubrics
  - Generate evaluation reports
  - Manage teaching demonstration schedules

- **User Management**
  - Manage HR staff accounts
  - Control access permissions
  - Track user activities

## Tech Stack

- **Core Technologies**

  - React 18
  - Vite (for build tooling)
  - Redux/Zustand (state management)
  - React Router v6 (routing)

- **UI/Styling**

  - Tailwind CSS
  - Custom components
  - Responsive design

- **Data Management**
  - Axios (API client)
  - React Query (data fetching)
  - Form validation

## Project Structure

```
frontend/
├── public/                    # Static assets
│   └── assets/               # Images and other media
├── src/
│   ├── api/                  # API integration modules
│   │   ├── applicationApi.js
│   │   ├── authApi.js
│   │   └── ...
│   ├── components/           # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   └── ...
│   ├── features/             # Feature-based modules
│   │   ├── auth/            # Authentication
│   │   ├── dashboard/       # Dashboard features
│   │   └── ...
│   ├── layouts/             # Page layouts
│   ├── pages/               # Route pages
│   │   ├── Applicant/      # Applicant portal pages
│   │   ├── HR/             # HR portal pages
│   │   └── ...
│   ├── store/              # State management
│   ├── styles/             # Global styles
│   └── utils/              # Utility functions
├── .env                    # Environment variables
└── package.json           # Project dependencies
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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Development Guidelines

1. Follow the established project structure
2. Use appropriate feature folders for new functionality
3. Maintain consistent component naming conventions
4. Write clean, documented code
5. Test thoroughly before submitting PRs

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
