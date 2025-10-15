# File Upload Fix - Application Documents to Cloudinary

## Problem

Files were not being uploaded to Cloudinary when applicants submitted their applications. The files were not being passed as multipart/form-data properly.

## Root Cause

The API request was sending FormData, but the Axios interceptor was adding a default `Content-Type: application/json` header which prevented proper multipart/form-data handling.

## Solution Applied

### 1. **Frontend Changes**

#### `frontend/src/api/applicationApi.js`

- **Changed**: Explicitly set `Content-Type: multipart/form-data` header
- **Before**: Comment said "Don't set Content-Type" but the fetchClient default was still being applied
- **After**: Explicitly sets `"Content-Type": "multipart/form-data"` which tells Axios to handle FormData properly

```javascript
const response = await fetchClient.post(
  `${API_BASE_URL}/applications`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);
```

#### `frontend/src/pages/Applicant/ApplicationForm.jsx`

- **Added**: Console logging to debug file uploads
- **Purpose**: Helps verify files are being collected and sent properly
- **Output**: Shows total files and details about each file (name, type, hasFile boolean)

### 2. **Backend Changes**

#### `backend/src/api/applications/applications.controller.ts`

- **Updated**: File handling to support Cloudinary's response format
- **Added Properties**:
  - `publicId`: Cloudinary's unique identifier for the file (needed for future operations like deletion)
  - `format`: File format from Cloudinary
  - `secure_url`: Cloudinary's HTTPS URL as fallback to `path`
- **Fallback Logic**: `file.filename || file.public_id` and `file.path || file.secure_url`

```typescript
documents = req.files.map((file: any) =>
  JSON.stringify({
    originalName: file.originalname,
    fileName: file.filename || file.public_id, // Cloudinary uses public_id
    url: file.path || file.secure_url, // Cloudinary provides secure_url
    publicId: file.public_id, // Cloudinary public ID for future operations
    size: file.size,
    mimetype: file.mimetype,
    format: file.format, // Cloudinary provides format
    uploadedAt: new Date().toISOString(),
  })
);
```

## Existing Configuration (Already Correct)

### 1. **Multer-Cloudinary Setup** (`backend/src/middlewares/upload.middleware.ts`)

✅ Already configured to upload to Cloudinary
✅ Storage configured with CloudinaryStorage
✅ File validation (types, size limits)
✅ Up to 10 files allowed
✅ 10MB max file size

### 2. **Cloudinary Config** (`backend/src/configs/cloudinary.ts`)

✅ Properly configured with environment variables
✅ Credentials loaded from `.env`

### 3. **Route Middleware** (`backend/src/api/applications/applications.route.ts`)

✅ `uploadDocuments` middleware already attached
✅ `handleUploadError` middleware for error handling

### 4. **Environment Variables** (`.env`)

✅ Cloudinary credentials set:

- `CLOUDINARY_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## File Upload Flow

1. **User selects files** in ApplicationForm.jsx
2. **Files stored in state** (resumeFile, applicationLetterFile, documentFiles)
3. **On submit**, files collected into `allDocuments` array
4. **FormData created** in applicationApi.js
5. **Files appended** to FormData with field name "documents"
6. **Axios sends** FormData with `multipart/form-data` header
7. **Multer middleware** receives files on backend
8. **Cloudinary storage** uploads files to cloud
9. **Controller** receives Cloudinary response with URLs
10. **Document metadata** saved to database as JSON string
11. **Response sent** back to frontend with application data

## Supported File Types

- Images: JPG, PNG
- Documents: PDF, DOC, DOCX, TXT
- Max Size: 10MB per file
- Max Files: 10 files per application

## Cloudinary Storage Structure

- **Folder**: `hr-applications/`
- **Filename Format**: `{timestamp}-{originalName}`
- **Example**: `1728987654321-resume.pdf`

## Testing Checklist

### Before Testing

- [ ] Verify Cloudinary credentials in `.env`
- [ ] Backend server running
- [ ] Frontend dev server running

### Upload Test

- [ ] Upload resume (step 1)
- [ ] Upload application letter (step 2)
- [ ] Upload all required documents (step 3)
- [ ] Check browser console for file details
- [ ] Submit application
- [ ] Check backend console for upload confirmation
- [ ] Verify files in Cloudinary dashboard (dnfunfiga account)
- [ ] Verify application in database has document URLs

### Error Handling Test

- [ ] Try uploading file > 10MB (should show error)
- [ ] Try uploading unsupported file type (should show error)
- [ ] Try uploading > 10 files (should show error)
- [ ] Check error messages are user-friendly

## Debugging

### Frontend Console Logs

When submitting, you should see:

```javascript
Submitting application with files: {
  totalFiles: 9,
  fileDetails: [
    { name: "resume.pdf", type: "resume", hasFile: true },
    { name: "cover-letter.pdf", type: "applicationLetter", hasFile: true },
    { name: "diploma.pdf", type: "diploma", hasFile: true },
    // ... more files
  ]
}
```

### Backend Console

Check for:

- Multer receiving files
- Cloudinary upload progress
- File URLs returned

### Common Issues

1. **"File too large" error**

   - Solution: Ensure files are under 10MB
   - Check file size before upload

2. **"Unexpected file field" error**

   - Solution: Verify field name is "documents" (plural)
   - Check FormData append calls

3. **Files undefined in backend**

   - Solution: Check Content-Type header is set properly
   - Verify uploadDocuments middleware is applied to route

4. **Cloudinary upload fails**
   - Solution: Verify credentials in .env
   - Check Cloudinary dashboard for quota/limits
   - Verify internet connection from backend server

## File Metadata Structure

Stored in database as JSON string:

```json
[
  {
    "originalName": "resume.pdf",
    "fileName": "1728987654321-resume",
    "url": "https://res.cloudinary.com/dnfunfiga/raw/upload/v1/hr-applications/1728987654321-resume.pdf",
    "publicId": "hr-applications/1728987654321-resume",
    "size": 245678,
    "mimetype": "application/pdf",
    "format": "pdf",
    "uploadedAt": "2025-10-15T10:30:45.123Z"
  }
]
```

## Future Enhancements

1. **Progress Indicator**: Show upload progress for large files
2. **Preview**: Allow preview of uploaded files before submission
3. **Edit**: Allow replacing files before final submission
4. **Download**: Add download functionality for HR to view documents
5. **Delete**: Add function to delete files from Cloudinary when application deleted
6. **Compression**: Auto-compress images before upload
7. **Validation**: Check file content (not just extension) for security

## Notes

- Cloudinary automatically generates secure HTTPS URLs
- Files are publicly accessible via the URL (no authentication required)
- Each file has a unique public_id for management operations
- Files persist in Cloudinary even if application is deleted (manual cleanup needed)
- Consider implementing cleanup job for orphaned files
