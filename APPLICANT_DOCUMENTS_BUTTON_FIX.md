# Applicant Documents Button Fix

## Issue

On the applicant side (History page), clicking the "Documents" button did nothing because it was trying to navigate to a non-existent route: `/applicant/application/${application.id}/documents`

## Root Cause

The Documents button was using `window.location.href` to navigate to a page that doesn't exist in the routing configuration. The intent was to show the documents, but there was no page or route set up for this.

## Solution

Updated the History.jsx page to:

1. Show documents in the existing application details modal (instead of navigating to a separate page)
2. Display the full list of documents with download buttons
3. Add loading states for document downloads
4. Use the same document download functionality that works on the HR side

## Changes Made

### File: `frontend/src/pages/Applicant/History.jsx`

#### 1. Added applicationApi import

```javascript
import { applicationApi } from "../../api/applicationApi";
```

#### 2. Added state for tracking downloads

```javascript
const [downloadingDoc, setDownloadingDoc] = useState(null);
```

#### 3. Added download handler function

```javascript
const downloadDocument = async (applicationId, documentIndex) => {
  setDownloadingDoc(documentIndex);
  try {
    await applicationApi.downloadDocument(applicationId, documentIndex);
  } catch (error) {
    console.error("Error downloading document:", error);
    alert("Failed to download document. Please try again.");
  } finally {
    setDownloadingDoc(null);
  }
};
```

#### 4. Fixed Documents button click handler

**Before:**

```javascript
<Button
  onClick={() =>
    (window.location.href = `/applicant/application/${application.id}/documents`)
  }
  variant="outline"
  size="sm"
>
  Documents
</Button>
```

**After:**

```javascript
<Button
  onClick={() => setSelectedApplication(application)}
  variant="outline"
  size="sm"
>
  Documents
</Button>
```

#### 5. Enhanced documents section in modal

**Before:** Only showed a count of documents submitted

```javascript
<div className="bg-gray-50 rounded-lg p-3">
  <p className="text-sm text-gray-600">
    {typeof selectedApplication.documents === "string"
      ? "Documents submitted"
      : `${
          JSON.parse(selectedApplication.documents || "[]").length
        } document(s) submitted`}
  </p>
</div>
```

**After:** Shows full document list with download buttons and loading states

```javascript
<div className="space-y-2">
  {docs.map((doc, index) => (
    <div
      key={index}
      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
    >
      {/* Document icon and name */}
      <div className="flex items-center space-x-3">
        <svg className="w-8 h-8 text-blue-500">...</svg>
        <div>
          <p className="text-sm font-medium text-gray-900 truncate">
            {doc.originalName || doc.fileName || `Document ${index + 1}`}
          </p>
          <p className="text-xs text-gray-500">
            {doc.mimetype || "Unknown type"}
          </p>
        </div>
      </div>

      {/* Download button with loading state */}
      <Button
        onClick={() => downloadDocument(selectedApplication.id, index)}
        variant="outline"
        size="sm"
        disabled={downloadingDoc === index}
      >
        {downloadingDoc === index ? (
          <>
            <svg className="animate-spin w-4 h-4 mr-1">...</svg>
            Downloading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1">...</svg>
            Download
          </>
        )}
      </Button>
    </div>
  ))}
</div>
```

## How It Works Now

1. **Click Documents button**: Opens the application details modal (same as clicking "View Details")
2. **View documents list**: Modal shows all submitted documents with their names and file types
3. **Download document**: Click "Download" button to download any document
4. **Loading feedback**: Button shows spinner and "Downloading..." text during download
5. **File downloads**: File downloads to user's device with correct filename (not opened in browser)

## User Flow

### Applicant Side - History Page

1. Applicant views their application history
2. Sees "Documents" button on applications with uploaded documents
3. Clicks "Documents" button
4. Modal opens showing full application details
5. Scrolls to "Submitted Documents" section
6. Sees list of all uploaded documents with file names
7. Clicks "Download" button on any document
8. Document downloads to their device
9. Button shows loading spinner during download

## Technical Details

### Document Storage

- Documents are stored as JSON array in database (LONGTEXT column)
- Each document object contains: `originalName`, `fileName`, `url`, `publicId`, `size`, `mimetype`, `format`, `uploadedAt`

### Download Flow

1. `downloadDocument` function called with applicationId and documentIndex
2. Calls `applicationApi.getDocuments(applicationId)` to fetch document metadata
3. Extracts document URL and filename from metadata
4. Calls `applicationApi.downloadFromUrl(url, filename)` to download file
5. Downloads file as blob, creates temporary download link, triggers browser download

### Error Handling

- Try/catch wrapper around download function
- Alert shown to user on error
- Console logging for debugging
- Loading state always cleaned up in finally block

## Related Files

- `frontend/src/api/applicationApi.js` - Contains download functions
- `frontend/src/pages/HR/Review.jsx` - Similar implementation on HR side
- `backend/src/api/applications/applications.controller.ts` - Backend download endpoints

## Testing Checklist

- [x] Documents button opens modal
- [x] Modal shows document list
- [x] Download button works
- [x] Loading state shows during download
- [x] File downloads (not opens in browser)
- [x] Correct filename used
- [x] Error handling works
- [x] No console errors

## Date Fixed

October 15, 2025
