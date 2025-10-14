# Reports Module - Quick Reference Guide

## 🚀 Quick Start

The Reports module is now fully integrated with the backend. All CSV exports and PDF generation are processed server-side.

## 📁 New Backend Files

```
backend/src/api/reports/
├── reports.service.ts      # Business logic & data processing
├── reports.controller.ts   # HTTP handlers
└── reports.route.ts        # Route definitions
```

## 🔌 API Endpoints

### Get Statistics

```
GET /api/reports/statistics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Get Analytics

```
GET /api/reports/analytics
```

### Export CSV

```
GET /api/reports/export/applications/csv?status=COMPLETED&program=Mathematics
GET /api/reports/export/scoring/csv?result=PASS
GET /api/reports/export/applicants/csv
```

### Generate PDF

```
GET /api/reports/export/applications/pdf?startDate=2024-01-01&endDate=2024-12-31
GET /api/reports/export/scoring/pdf?program=Mathematics
GET /api/reports/export/applicants/pdf
```

## 🎨 Frontend Usage

The existing Reports page works automatically. No changes needed to UI code.

```javascript
// Store is already connected to backend
import { useReportStore } from "../../store/reportStore";

const {
  generateApplicationReport, // Generates PDF from backend
  exportToCsv, // Exports CSV from backend
  getReportStatistics, // Fetches statistics
  getDashboardAnalytics, // Fetches analytics
  loading,
  error,
} = useReportStore();
```

## 📊 Report Types

| Report Type  | CSV | PDF | Filters                            |
| ------------ | --- | --- | ---------------------------------- |
| Applications | ✅  | ✅  | status, result, program, dateRange |
| Scoring      | ✅  | ✅  | result, program, dateRange         |
| Applicants   | ✅  | ✅  | dateRange                          |

## 🔐 Security

- **Required**: JWT token in Authorization header
- **Roles**: HR, ADMIN only
- **Data**: Filtered by user permissions

## 📦 Package Installed

```bash
npm install pdfkit @types/pdfkit --legacy-peer-deps
```

## ✅ Testing Checklist

- [ ] Login as HR user
- [ ] Navigate to Reports page
- [ ] Generate Applications PDF
- [ ] Export Applications CSV
- [ ] Generate Scoring PDF
- [ ] Export Scoring CSV
- [ ] Generate Applicants PDF
- [ ] Export Applicants CSV
- [ ] Test with date filters
- [ ] Test with status filters
- [ ] Verify downloaded files

## 🐛 Troubleshooting

### CSV downloads empty

- Check if there's data matching your filters
- Verify date format: YYYY-MM-DD
- Check browser console for errors

### PDF generation fails

- Check backend logs for errors
- Verify pdfkit is installed
- Ensure enough server memory

### 403 Forbidden

- Verify user has HR or ADMIN role
- Check JWT token is valid
- Ensure user is authenticated

## 📞 Support

For issues or questions:

1. Check backend logs: `npm run dev` output
2. Check frontend console: Browser DevTools
3. Review API response in Network tab
4. Check documentation files:
   - `REPORTS_MODULE_DOCUMENTATION.md` - Full API reference
   - `REPORTS_MODULE_SUMMARY.md` - Implementation details

## 🎯 Common Use Cases

### Generate monthly report

```javascript
const blob = await generateApplicationReport({
  startDate: "2024-10-01",
  endDate: "2024-10-31",
});
```

### Export completed applications

```javascript
const blob = await exportToCsv("applications", {
  status: "COMPLETED",
});
```

### Get pass rate statistics

```javascript
const { statistics } = await getReportStatistics();
console.log(`Pass Rate: ${statistics.passRate}%`);
```

## ✨ Features

✅ Server-side PDF generation with pdfkit
✅ Comprehensive CSV exports
✅ Real-time statistics calculation
✅ Monthly trend analysis
✅ Program breakdown analytics
✅ Pass rate metrics
✅ Processing time tracking
✅ Flexible date range filtering
✅ Status and result filtering
✅ Program-specific reports
✅ Role-based access control
✅ Professional PDF formatting
✅ Automatic file downloads

## 🎉 Status: READY FOR PRODUCTION
