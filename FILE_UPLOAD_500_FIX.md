# File Upload 500 Error - Fixes Applied

## Summary

Fixed the internal server error (500) when uploading application documents to Cloudinary.

## Root Causes Identified

### 1. **Double JSON Stringification**

**Problem**: Each file object was being JSON.stringify'd individually, then the array was being JSON.stringify'd again, creating invalid nested JSON strings.

**Before**:

```typescript
documents = req.files.map((file: any) =>
  JSON.stringify({
    // ❌ Stringifying individual objects
    originalName: file.originalname,
    // ...
  })
);
// Then: JSON.stringify(documents) // ❌ Stringifying again
```

**After**:

```typescript
const documents = req.files.map((file: any) => ({
  // ✅ Return plain objects
  originalName: file.originalname,
  // ...
}));
documentsJson = JSON.stringify(documents); // ✅ Stringify once
```

### 2. **Cloudinary File Object Properties**

**Problem**: Code assumed properties that Cloudinary might not provide (filename) or didn't use the correct ones (secure_url).

**Fixed**: Added fallback chain for all properties:

```typescript
fileName: file.filename || file.public_id || file.originalname,
url: file.secure_url || file.path || file.url,
publicId: file.public_id || "",
size: file.size || 0,
mimetype: file.mimetype || "application/octet-stream",
```

### 3. **Cloudinary Storage Configuration**

**Problem**: The params configuration wasn't properly set up as an async function and didn't specify resource_type.

**Before**:

```typescript
params: {
  folder: "hr-applications",
  allowed_formats: [...],
  public_id: (req, file) => {...}
} as any
```

**After**:

```typescript
params: async (req: any, file: any) => {
  return {
    folder: "hr-applications",
    allowed_formats: [...],
    public_id: `${timestamp}-${originalName}`,
    resource_type: "auto",  // ✅ Auto-detect (raw for PDFs, etc.)
  };
}
```

### 4. **Database Column Size**

**Problem**: `documents` column was TEXT (max 65KB), which could be exceeded with multiple files.

**Fixed**: Changed to LONGTEXT (max 4GB):

```prisma
documents String? @db.LongText  // Changed from @db.Text
```

### 5. **Error Logging**

**Problem**: 500 errors weren't showing helpful details for debugging.

**Fixed**: Added comprehensive logging:

- Request details (user, body keys, file count)
- File processing details (object keys, all properties)
- Application creation progress
- Full error stack traces in development

## Files Modified

### Backend

1. **`backend/src/api/applications/applications.controller.ts`**

   - Fixed double JSON stringification
   - Added safe fallbacks for Cloudinary properties
   - Added detailed console logging for debugging
   - Improved error messages

2. **`backend/src/middlewares/upload.middleware.ts`**

   - Changed params to async function
   - Added `resource_type: "auto"`
   - Sanitized filenames (remove special characters)

3. **`backend/src/app.ts`**

   - Enhanced error logging
   - Added development-only error details in response
   - Log error name, message, and stack

4. **`backend/prisma/schema.prisma`**
   - Changed documents column from TEXT to LONGTEXT

### Documentation

5. **`DEBUG_FILE_UPLOAD.md`**

   - Comprehensive debugging guide
   - Step-by-step troubleshooting
   - Common error patterns
   - Expected log outputs

6. **`FILE_UPLOAD_FIX.md`**
   - Initial fix documentation (from previous session)

## How to Test

### 1. Restart Backend

The backend should already be running and updated. If not:

```powershell
cd backend
npm run dev
```

### 2. Submit Application

Go to frontend and submit a new application with files.

### 3. Check Backend Console

You should see detailed logs like:

```
=== Create Application Request ===
User: 45 APPLICANT
Body keys: ['program', 'applicantId']
Files received: 9
Processing 9 files...
File object keys: [...]
File details: {...}
Documents JSON length: 2145
Creating application with program: Teaching Application
Application created successfully: 123
```

### 4. Verify in Cloudinary

- Login to https://cloudinary.com/console
- Check Media Library
- Look for `hr-applications/` folder
- Files should be there with format: `{timestamp}-{filename}`

### 5. Verify in Database

Files metadata should be saved in the Application record:

```sql
SELECT id, documents FROM Application WHERE id = [latest_id];
```

## What Should Work Now

✅ Upload resume (PDF, DOC, DOCX, TXT)
✅ Upload application letter (PDF, DOC, DOCX, TXT)  
✅ Upload multiple documents (up to 10 files)
✅ Files uploaded to Cloudinary
✅ File URLs stored in database
✅ Large file metadata (multiple files won't exceed column limit)
✅ Proper error messages if something fails

## Supported File Types

- Documents: PDF, DOC, DOCX, TXT
- Images: JPG, PNG
- Max size: 10MB per file
- Max files: 10 files per application

## Expected Cloudinary File Object

When files are uploaded successfully, each file will have:

```json
{
  "originalName": "resume.pdf",
  "fileName": "hr-applications/1729012345678-resume",
  "url": "https://res.cloudinary.com/dnfunfiga/raw/upload/v1/hr-applications/1729012345678-resume.pdf",
  "publicId": "hr-applications/1729012345678-resume",
  "size": 245678,
  "mimetype": "application/pdf",
  "format": "pdf",
  "uploadedAt": "2025-10-15T10:30:45.123Z"
}
```

## Troubleshooting

If still getting 500 error:

1. **Check backend console** for the full error message
2. **Look for these patterns**:

   - "Data too long for column" → Database column still TEXT (run migration)
   - "Invalid authentication" → Check Cloudinary credentials
   - "Unexpected field" → Field name must be "documents"
   - "LIMIT_FILE_SIZE" → File exceeds 10MB
   - "File type not allowed" → Unsupported file format

3. **Verify environment variables**:

   ```
   CLOUDINARY_NAME=dnfunfiga
   CLOUDINARY_API_KEY=249235862156371
   CLOUDINARY_API_SECRET=hCijtBdwtzpa2lNemhK8eBcfIlI
   ```

4. **Check Cloudinary quota**: You might have reached your free tier limit

5. **Network issues**: Ensure backend can reach api.cloudinary.com

## Migration Status

The database migration to change documents column to LONGTEXT should already be applied. If not, run:

```powershell
cd backend
npx prisma migrate dev --name change_documents_to_longtext
```

## Current Status

✅ **Backend Changes**: Applied and server restarted
✅ **Database Schema**: Updated to LONGTEXT
✅ **Cloudinary Config**: Fixed with proper params
✅ **Error Handling**: Enhanced with detailed logging
✅ **JSON Processing**: Fixed double stringification

**Ready for testing!**

## Next Steps

1. Try submitting an application with files
2. If it works: ✅ Issue resolved!
3. If error persists: Copy the FULL backend console output and share it
   - The logs will show exactly where it's failing
   - We can pinpoint the exact issue from the error message

The enhanced logging will tell us:

- Are files being received? (Files received: X)
- What do the file objects look like?
- Is it failing during Cloudinary upload or database save?
- What's the exact error?
