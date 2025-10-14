# Reports Module Documentation

## Overview

The Reports module provides comprehensive report generation capabilities including CSV exports and PDF reports for applications, scoring, and applicants data. All report generation is now handled by the backend server.

## Backend Implementation

### Files Created

1. **`backend/src/api/reports/reports.service.ts`** - Business logic for data retrieval and report generation
2. **`backend/src/api/reports/reports.controller.ts`** - HTTP request handlers for report endpoints
3. **`backend/src/api/reports/reports.route.ts`** - Route definitions for the reports API

### API Endpoints

All endpoints require authentication and are restricted to HR and ADMIN roles.

#### Statistics & Analytics

**GET /api/reports/statistics**

- Get comprehensive report statistics
- Query Parameters:
  - `startDate` (optional): ISO date string for filtering
  - `endDate` (optional): ISO date string for filtering
- Returns: Statistics object with counts, breakdowns, and metrics

**GET /api/reports/analytics**

- Get dashboard analytics with trends
- Returns: Analytics object with monthly trends and top programs

#### CSV Exports

**GET /api/reports/export/applications/csv**

- Export applications data as CSV
- Query Parameters:
  - `startDate` (optional)
  - `endDate` (optional)
  - `status` (optional): PENDING | APPROVED | REJECTED | COMPLETED
  - `result` (optional): PASS | FAIL
  - `program` (optional): Program name filter
- Returns: CSV file download

**GET /api/reports/export/scoring/csv**

- Export scoring data as CSV (completed applications with scores)
- Query Parameters:
  - `startDate` (optional)
  - `endDate` (optional)
  - `result` (optional): PASS | FAIL
  - `program` (optional)
- Returns: CSV file download

**GET /api/reports/export/applicants/csv**

- Export applicants data as CSV
- Query Parameters:
  - `startDate` (optional)
  - `endDate` (optional)
- Returns: CSV file download

#### PDF Reports

**GET /api/reports/export/applications/pdf**

- Generate comprehensive applications report as PDF
- Query Parameters: Same as CSV export
- Returns: PDF file download

**GET /api/reports/export/scoring/pdf**

- Generate scoring report as PDF
- Query Parameters: Same as CSV export
- Returns: PDF file download

**GET /api/reports/export/applicants/pdf**

- Generate applicants report as PDF
- Query Parameters: Same as CSV export
- Returns: PDF file download

### PDF Generation

PDFs are generated using the `pdfkit` library with the following features:

- Professional header with institution name
- Summary statistics section
- Detailed data listings
- Program breakdowns and analytics
- Proper formatting and pagination

### CSV Format

CSV exports include comprehensive data:

- **Applications CSV**: ID, Name, Email, Phone, Program, Status, Result, Score, Dates, Attempt, Demo details, HR Notes
- **Scoring CSV**: Application ID, Name, Email, Program, Score, Result, Demo details, Notes, Completion date
- **Applicants CSV**: Name, Email, Phone, Total Applications, Programs, Latest Status/Result, Latest Date

## Frontend Implementation

### Updated Files

1. **`frontend/src/api/reportApi.js`** - API client methods
2. **`frontend/src/store/reportStore.js`** - State management with backend integration

### Usage Example

```javascript
import { useReportStore } from "../../store/reportStore";

const MyComponent = () => {
  const {
    generateApplicationReport,
    exportToCsv,
    getReportStatistics,
    getDashboardAnalytics,
    loading,
    error,
  } = useReportStore();

  // Generate PDF report
  const handleGeneratePDF = async () => {
    try {
      const blob = await generateApplicationReport({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        status: "COMPLETED",
      });

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "applications_report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate report:", err);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const blob = await exportToCsv("applications", {
        startDate: "2024-01-01",
        status: "COMPLETED",
      });

      // Download CSV
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "applications_export.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  // Get statistics
  const loadStats = async () => {
    try {
      const { statistics } = await getReportStatistics({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });
      console.log("Statistics:", statistics);
    } catch (err) {
      console.error("Failed to load statistics:", err);
    }
  };

  return (
    <div>
      <button onClick={handleGeneratePDF} disabled={loading}>
        Generate PDF Report
      </button>
      <button onClick={handleExportCSV} disabled={loading}>
        Export to CSV
      </button>
      <button onClick={loadStats} disabled={loading}>
        Load Statistics
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

## Report Types

### 1. Applications Report

- **Data**: All applications with applicant details
- **Includes**: Status, program, scores, dates, demo schedule, HR notes
- **Filters**: Date range, status, result, program
- **Statistics**: Total count, status breakdown, pass rate, processing time

### 2. Scoring Report

- **Data**: Completed applications with scores
- **Includes**: Scores, results, demo details, HR feedback
- **Filters**: Date range, result, program
- **Statistics**: Average score, pass rate, score distribution

### 3. Applicants Report

- **Data**: User profiles with application history
- **Includes**: Contact info, total applications, programs applied, latest status
- **Filters**: Date range
- **Statistics**: Total applicants, returning vs new, program breakdown

## Installation

The reports module requires the following package:

```bash
npm install pdfkit @types/pdfkit --legacy-peer-deps
```

## Security

- All endpoints require authentication (JWT token)
- Only HR and ADMIN roles can access report endpoints
- Data is filtered based on user permissions
- Sensitive information is excluded from exports

## Error Handling

The backend returns appropriate HTTP status codes:

- **200**: Success
- **400**: Bad request (invalid filters)
- **401**: Unauthorized (no token)
- **403**: Forbidden (insufficient permissions)
- **500**: Server error

Frontend error handling:

- Errors are captured in the store's `error` state
- Loading states are managed with `loading` flag
- Try-catch blocks in all async operations

## Performance Considerations

- Large datasets may take time to generate (especially PDFs)
- Consider pagination for very large reports
- CSV exports are more efficient than PDFs for large datasets
- Database queries are optimized with proper indexes

## Future Enhancements

Potential improvements:

- Email report delivery
- Scheduled report generation
- Custom report templates
- Data visualization in PDFs (charts, graphs)
- Excel format exports (.xlsx)
- Report caching for frequently requested data
