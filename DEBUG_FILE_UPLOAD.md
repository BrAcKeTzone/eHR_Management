# Debugging File Upload 500 Error

## Current Error

```
:3000/api/applications:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Error creating application: AxiosError
Failed to submit application: Error: Internal server error
```

## Steps to Debug

### 1. **Restart Backend Server**

The changes won't take effect until you restart the backend server.

```powershell
# Stop the current backend process (Ctrl+C in the terminal running it)
# Then restart:
cd backend
npm run dev
```

### 2. **Check Backend Console Logs**

After restarting, when you submit an application, you should see detailed logs:

```
=== Create Application Request ===
User: 123 APPLICANT
Body keys: ['program', 'applicantId']
Files received: 9
Processing 9 files...
File object keys: [list of properties]
File details: {...}
```

### 3. **Common Issues & Solutions**

#### Issue A: No files received (Files received: 0)

**Cause**: Frontend not sending FormData properly
**Solution**:

- Check browser Network tab
- Verify request Content-Type is `multipart/form-data`
- Verify files are in the request payload

#### Issue B: Cloudinary upload fails

**Possible causes**:

1. Invalid Cloudinary credentials
2. File type not supported
3. File too large
4. Network issues

**Check**:

- Verify `.env` has correct credentials:
  ```
  CLOUDINARY_NAME=dnfunfiga
  CLOUDINARY_API_KEY=249235862156371
  CLOUDINARY_API_SECRET=hCijtBdwtzpa2lNemhK8eBcfIlI
  ```
- Test credentials at: https://cloudinary.com/console

#### Issue C: Database error

**Cause**: JSON string too long or invalid data type
**Check backend logs for**:

```
Error: Data too long for column 'documents'
```

**Solution**: Increase column size in schema or store fewer file metadata

#### Issue D: Multer configuration error

**Error patterns**:

- "Unexpected field"
- "File validation failed"
- "LIMIT_FILE_SIZE"

**Check**:

- Field name is "documents" (plural)
- File types are allowed: jpg, png, pdf, doc, docx, txt
- File size < 10MB
- Number of files <= 10

### 4. **Test with Single File**

To isolate the issue, try uploading just the resume first:

1. Upload resume only (skip step 2 & 3)
2. Try to submit
3. Check if it works with 1 file

### 5. **Check Cloudinary Dashboard**

Login to Cloudinary: https://cloudinary.com/console

- Go to Media Library
- Check if files are being uploaded to `hr-applications/` folder
- If files appear there but backend still errors, the issue is in the database save

### 6. **Verify Database Schema**

Check if `documents` column can handle JSON text:

```sql
DESCRIBE Application;
-- Look for documents column type (should be TEXT or LONGTEXT)
```

### 7. **Manual Test via Postman**

Test the endpoint directly:

```
POST http://localhost:3000/api/applications
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- documents: (file) select a PDF
- program: "Teaching Application"
- applicantId: 123
```

## What the Logs Should Show (Success Case)

```
=== Create Application Request ===
User: 45 APPLICANT
Body keys: ['program', 'applicantId']
Files received: 9
Processing 9 files...
File object keys: ['fieldname', 'originalname', 'encoding', 'mimetype', 'path', 'size', 'filename', 'public_id', 'secure_url', 'format', 'resource_type', ...]
File details: {
  originalname: 'resume.pdf',
  filename: undefined,
  public_id: 'hr-applications/1729012345678-resume',
  secure_url: 'https://res.cloudinary.com/dnfunfiga/raw/upload/v1729012345678/hr-applications/1729012345678-resume.pdf',
  path: 'https://res.cloudinary.com/...',
  size: 123456,
  mimetype: 'application/pdf',
  format: 'pdf'
}
Documents JSON length: 1234
Creating application with program: Teaching Application
Application created successfully: 123
```

## Error Patterns to Look For

### Pattern 1: Cloudinary Auth Error

```
Error: Invalid authentication signature
```

**Fix**: Check CLOUDINARY_API_SECRET

### Pattern 2: Database Error

```
Error: Data too long for column 'documents' at row 1
```

**Fix**: Change column type to LONGTEXT

### Pattern 3: Multer Error

```
MulterError: Unexpected field
```

**Fix**: Ensure field name is "documents"

### Pattern 4: File Type Error

```
Error: File type application/zip is not allowed
```

**Fix**: Only upload supported file types

### Pattern 5: Network Error

```
Error: connect ETIMEDOUT
Error: getaddrinfo ENOTFOUND
```

**Fix**: Check internet connection, Cloudinary might be unreachable

## Quick Fixes

### If documents column is too small:

```sql
ALTER TABLE Application MODIFY documents LONGTEXT;
```

### If Cloudinary credentials are wrong:

Update `.env` file and restart backend

### If file field name is wrong:

Frontend should use `formData.append("documents", file)`
Backend expects field name: `"documents"`

## Verification Checklist

After restarting backend, verify:

- [ ] Backend console shows detailed logs
- [ ] Files are received (Files received: X)
- [ ] Cloudinary properties are present in file object
- [ ] Files appear in Cloudinary dashboard
- [ ] Application record created in database
- [ ] Frontend receives success response

## Next Steps

1. **Restart backend server** (MUST DO)
2. **Submit application** from frontend
3. **Copy backend console output** (all the logs)
4. **Share the logs** so we can see exactly what's failing

The detailed logging will tell us:

- Are files being received?
- What properties does the file object have?
- Where exactly is it failing?
- What's the actual error message?

## Expected File Object Structure (Cloudinary)

When using CloudinaryStorage, the file object should have:

```javascript
{
  fieldname: 'documents',
  originalname: 'resume.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  path: 'https://res.cloudinary.com/...',  // Full Cloudinary URL
  size: 123456,
  filename: 'hr-applications/1729012345678-resume',  // May be undefined
  destination: undefined,  // Not used with Cloudinary
  public_id: 'hr-applications/1729012345678-resume',  // Cloudinary public ID
  secure_url: 'https://res.cloudinary.com/...',  // HTTPS URL
  url: 'http://res.cloudinary.com/...',  // HTTP URL
  format: 'pdf',  // File extension
  resource_type: 'raw',  // Cloudinary resource type
  created_at: '2025-10-15T...',  // Upload timestamp
  bytes: 123456,  // File size
  type: 'upload',
  etag: '...',
  placeholder: false,
  // ... more Cloudinary properties
}
```

Our code now uses safe fallbacks:

- `fileName: file.filename || file.public_id || file.originalname`
- `url: file.secure_url || file.path || file.url`
- `publicId: file.public_id || ""`

This should handle any property that might be missing.
