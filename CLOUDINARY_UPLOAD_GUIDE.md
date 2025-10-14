# Cloudinary Upload Implementation Guide

## Overview

This implementation provides a comprehensive file upload system using Cloudinary, adapted from the `backRef` project. It supports single file uploads, multiple file uploads, base64 image uploads, and file deletion.

---

## Features

✅ Single file upload  
✅ Multiple file uploads (up to 10 files)  
✅ Base64 image upload  
✅ File deletion  
✅ Memory-based storage (no local file system usage)  
✅ File type validation  
✅ File size limits (10MB per file)  
✅ Organized folder structure in Cloudinary  
✅ Error handling for timeouts and large files  
✅ TypeScript support

---

## File Structure

```
backend/src/
├── api/uploads/
│   └── upload.controller.ts    # Upload controllers
├── routes/
│   └── uploads.route.ts        # Upload routes
├── utils/
│   └── cloudinary.ts           # Cloudinary utilities
└── configs/
    └── cloudinary.ts           # Cloudinary configuration
```

---

## Cloudinary Folder Structure

Files are organized in Cloudinary with the following folder structure:

```
bcfi_hr/
├── applications/      # Application documents
├── valid_ids/         # ID verification documents
├── documents/         # General documents
├── profiles/          # Profile images
└── general/           # Other files
```

---

## API Endpoints

### 1. **Single File Upload**

**Endpoint:** `POST /api/uploads`  
**Auth:** Optional (public for application submission)  
**Content-Type:** `multipart/form-data`

**Query Parameters:**

- `type` (optional): Upload type - `application`, `id`, `document`, `profile`, or `general` (default)

**Body:**

- `file`: File to upload (field name: `file`)

**Example Request:**

```javascript
const formData = new FormData();
formData.append("file", fileObject);

const response = await fetch(
  "http://localhost:3000/api/uploads?type=application",
  {
    method: "POST",
    body: formData,
  }
);
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "public_id": "bcfi_hr/applications/2025-10-14_1234567890_document",
    "originalname": "document.pdf",
    "fileName": "2025-10-14_1234567890_document.pdf",
    "size": 1048576,
    "mimetype": "application/pdf",
    "uploadType": "application",
    "folder": "bcfi_hr/applications",
    "fileExt": ".pdf",
    "resource_type": "raw"
  },
  "message": "File uploaded successfully"
}
```

---

### 2. **Multiple File Upload**

**Endpoint:** `POST /api/uploads/multiple`  
**Auth:** Required (JWT token)  
**Content-Type:** `multipart/form-data`

**Query Parameters:**

- `type` (optional): Upload type

**Body:**

- `files`: Array of files (field name: `files`, max 10 files)

**Example Request:**

```javascript
const formData = new FormData();
files.forEach((file) => {
  formData.append("files", file);
});

const response = await fetch(
  "http://localhost:3000/api/uploads/multiple?type=document",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }
);
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "files": [
      {
        "url": "https://res.cloudinary.com/...",
        "public_id": "bcfi_hr/documents/...",
        "originalname": "file1.pdf",
        "fileName": "2025-10-14_1234567890_file1.pdf",
        "size": 1048576,
        "mimetype": "application/pdf",
        "fileExt": ".pdf",
        "resource_type": "raw"
      }
    ],
    "failed": [],
    "uploadType": "document",
    "folder": "bcfi_hr/documents",
    "partialSuccess": false
  },
  "message": "All files uploaded successfully"
}
```

---

### 3. **Base64 Image Upload**

**Endpoint:** `POST /api/uploads/base64`  
**Auth:** Optional  
**Content-Type:** `application/json`

**Query Parameters:**

- `type` (optional): Upload type - `profile`, `id`, or `general`

**Body:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Example Request:**

```javascript
const response = await fetch(
  "http://localhost:3000/api/uploads/base64?type=profile",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64String,
    }),
  }
);
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "public_id": "bcfi_hr/profiles/...",
    "uploadType": "profile",
    "folder": "bcfi_hr/profiles"
  },
  "message": "Image uploaded successfully"
}
```

---

### 4. **Application Document Upload**

**Endpoint:** `POST /api/uploads/application`  
**Auth:** Required (JWT token)  
**Content-Type:** `multipart/form-data`

**Body:**

- `files`: Array of application documents (max 10 files)

**Example Request:**

```javascript
const formData = new FormData();
documents.forEach((doc) => {
  formData.append("files", doc);
});

const response = await fetch("http://localhost:3000/api/uploads/application", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

---

### 5. **Delete File**

**Endpoint:** `DELETE /api/uploads/:publicId`  
**Auth:** Required (JWT token)

**Parameters:**

- `publicId`: The Cloudinary public ID of the file to delete (URL encoded)

**Example Request:**

```javascript
const publicId = encodeURIComponent(
  "bcfi_hr/applications/2025-10-14_1234567890_document"
);

const response = await fetch(`http://localhost:3000/api/uploads/${publicId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "result": "ok"
  },
  "message": "File deleted successfully"
}
```

---

### 6. **Get File Info**

**Endpoint:** `GET /api/uploads/:publicId/info`  
**Auth:** Required (JWT token)

**Parameters:**

- `publicId`: The Cloudinary public ID (URL encoded)

---

## File Type Support

**Allowed File Types:**

- Images: JPG, JPEG, PNG
- Documents: PDF, DOC, DOCX, TXT

**File Size Limits:**

- Maximum file size: 10MB per file
- Maximum files per request: 10 files
- Base64 field size limit: 15MB

---

## Usage in Frontend

### Single File Upload

```javascript
import { fetchClient } from "../utils/fetchClient";

async function uploadFile(file, type = "application") {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchClient.post(
    `/api/uploads?type=${type}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}
```

### Multiple File Upload

```javascript
async function uploadMultipleFiles(files, type = "document") {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetchClient.post(
    `/api/uploads/multiple?type=${type}`,
    formData
  );

  return response.data;
}
```

### Base64 Upload

```javascript
async function uploadBase64Image(base64String, type = "profile") {
  const response = await fetchClient.post(`/api/uploads/base64?type=${type}`, {
    image: base64String,
  });

  return response.data;
}
```

### Delete File

```javascript
async function deleteFile(publicId) {
  const encodedId = encodeURIComponent(publicId);
  const response = await fetchClient.delete(`/api/uploads/${encodedId}`);
  return response.data;
}
```

---

## Error Handling

### Common Errors

1. **File Too Large (413)**

   ```json
   {
     "success": false,
     "message": "File too large. Maximum size is 10MB."
   }
   ```

2. **No File Uploaded (400)**

   ```json
   {
     "success": false,
     "statusCode": 400,
     "message": "No file uploaded"
   }
   ```

3. **Invalid File Type (400)**

   ```json
   {
     "success": false,
     "message": "File type application/exe is not allowed. Only JPG, PNG, PDF, DOC, DOCX, and TXT files are permitted."
   }
   ```

4. **Upload Timeout (500)**

   ```json
   {
     "success": false,
     "statusCode": 500,
     "message": "Upload timed out. Server might be experiencing high load or connection issues."
   }
   ```

5. **Too Many Files (400)**
   ```json
   {
     "success": false,
     "message": "Too many files. Maximum is 10 files."
   }
   ```

---

## Utility Functions

The `src/utils/cloudinary.ts` file provides several utility functions:

### Upload Buffer

```typescript
import { uploadBuffer } from "../utils/cloudinary";

const result = await uploadBuffer(fileBuffer, {
  folder: "bcfi_hr/applications",
  resource_type: "auto",
  public_id: "custom-filename",
  timeout: 60000,
});
```

### Upload Base64

```typescript
import { uploadBase64 } from "../utils/cloudinary";

const result = await uploadBase64(base64String, {
  folder: "bcfi_hr/profiles",
  resource_type: "image",
});
```

### Delete Image

```typescript
import { deleteImage } from "../utils/cloudinary";

const result = await deleteImage("bcfi_hr/applications/file-id");
```

### Delete Multiple Images

```typescript
import { deleteMultipleImages } from "../utils/cloudinary";

const results = await deleteMultipleImages([
  "bcfi_hr/applications/file1",
  "bcfi_hr/applications/file2",
]);
```

---

## Security Considerations

1. **Authentication**: Most endpoints require JWT authentication
2. **File Type Validation**: Only allowed file types can be uploaded
3. **File Size Limits**: Prevents DOS attacks with large files
4. **Timeout Protection**: 60-second timeout prevents hanging uploads
5. **Memory Storage**: Files are not stored on disk, reducing security risks

---

## Integration with Applications

The application submission flow can use the upload endpoints:

```typescript
// 1. Upload documents
const uploadedDocs = await uploadMultipleFiles(documents, "application");

// 2. Create application with document URLs
const application = await applicationApi.create({
  program: "Teaching Position",
  documents: uploadedDocs.data.files.map((file) => ({
    url: file.url,
    public_id: file.public_id,
    originalname: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  })),
});
```

---

## Testing

### Test Single Upload

```bash
curl -X POST http://localhost:3000/api/uploads?type=application \
  -F "file=@/path/to/document.pdf"
```

### Test Multiple Upload

```bash
curl -X POST http://localhost:3000/api/uploads/multiple?type=document \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.pdf"
```

### Test Delete

```bash
curl -X DELETE "http://localhost:3000/api/uploads/bcfi_hr%2Fapplications%2Ffile-id" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Environment Variables

Ensure these are set in your `.env` file:

```properties
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Migration Notes

### Changes from Previous Implementation

1. **Removed**: `multer-storage-cloudinary` direct integration in middleware
2. **Added**: Memory-based storage with manual Cloudinary upload
3. **Added**: Comprehensive error handling and timeouts
4. **Added**: Base64 upload support
5. **Added**: Multiple file upload support
6. **Added**: File deletion endpoint
7. **Improved**: Folder organization in Cloudinary
8. **Improved**: Filename formatting with timestamps

### Benefits

- More control over upload process
- Better error handling
- Support for sequential uploads (prevents server overload)
- Detailed upload metadata
- No local file storage needed
- Better timeout handling

---

## Troubleshooting

### Upload Fails with Timeout

- Check internet connection
- Try smaller files
- Check Cloudinary account limits

### Files Not Appearing in Cloudinary

- Verify environment variables
- Check Cloudinary dashboard for errors
- Ensure folder permissions

### "File Type Not Allowed" Error

- Check file extension
- Verify MIME type is in allowed list
- Update `fileFilter` in routes if needed

---

## Next Steps

1. ✅ Implementation complete
2. ⏳ Test all endpoints
3. ⏳ Update frontend upload forms
4. ⏳ Integrate with application submission
5. ⏳ Add progress indicators for large files
6. ⏳ Consider adding image transformation options

---

For more information, see:

- Cloudinary Documentation: https://cloudinary.com/documentation
- Backend API Reference: `API_QUICK_REFERENCE.md`
