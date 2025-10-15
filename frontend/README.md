# React + Vite - Frontend Setup

## Overview

This frontend is part of the **BCFI HR Application System**, designed to provide a user-friendly interface for applicants and HR staff. It is built with React and Vite for fast development and performance.

---

## Features

### **Applicant Features**

- Submit applications with document uploads
- Track application status in real-time
- View demo schedules and results
- Access application history

### **HR Features**

- Review and manage applications
- Schedule teaching demonstrations
- Evaluate applicants using rubrics
- View reports and analytics

---

## Technologies Used

- **React**: Frontend library for building user interfaces
- **Vite**: Build tool for fast development
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **Zustand**: State management library

---

## Project Structure

```
frontend/
├── public/                # Static assets
├── src/
│   ├── api/              # API service modules
│   ├── components/       # Reusable UI components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Application pages
│   ├── routes/           # Route definitions
│   ├── store/            # State management
│   ├── styles/           # Global styles
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/BrAcKeTzone/eHR_Management.git
cd eHR_Management/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend/` directory with the following content:

```env
VITE_API_BASE_URL="http://localhost:3000/api"
```

### 4. Run the Development Server

Start the frontend development server:

```bash
npm run dev
```

The application will run at `http://localhost:5173` by default.

---

## Available Scripts

### `npm run dev`

Runs the app in development mode.

### `npm run build`

Builds the app for production.

### `npm run preview`

Previews the production build locally.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

**Blancia College Foundation Inc.**  
_Automated HR Filing & Email Notification System_
