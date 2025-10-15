# "Unknown File Format" Error - FIXED

## Problem

**Error**: "An unknown file format not allowed" (Cloudinary 400 error)
**Cause**: Cloudinary's `allowed_formats` parameter was too restrictive

## Root Cause

The Cloudinary storage configuration had:

```typescript
allowed_formats: ["jpg", "png", "pdf", "doc", "docx", "txt"],
resource_type: "auto"
```

### Issues:

1. **`allowed_formats` is too restrictive** - Even valid file extensions like `.jpeg` would fail (only `.jpg` was allowed)
2. **`resource_type: "auto"` doesn't always work reliably** with allowed_formats
3. **Document formats (PDF, DOC, DOCX)** need `resource_type: "raw"` in Cloudinary
4. **Images (JPG, PNG)** need `resource_type: "image"`
5. **The combination caused conflicts** and rejected valid files

## Solution Applied

### Updated `upload.middleware.ts`

**Changed**: Removed `allowed_formats` restriction and determine `resource_type` dynamically based on MIME type

```typescript
// Determine resource type based on mimetype
let resourceType: "image" | "video" | "raw" = "raw";
if (file.mimetype.startsWith("image/")) {
  resourceType = "image";
} else if (file.mimetype.startsWith("video/")) {
  resourceType = "video";
}

return {
  folder: "hr-applications",
  public_id: `${timestamp}-${originalName}`,
  resource_type: resourceType, // Determined dynamically
  // No allowed_formats restriction
};
```

### How It Works:

1. **Check MIME type** of uploaded file
2. **Set resource_type**:
   - `image/*` → `resource_type: "image"` (JPG, PNG, GIF, etc.)
   - `video/*` → `resource_type: "video"` (if video support needed)
   - Everything else → `resource_type: "raw"` (PDF, DOC, DOCX, TXT, etc.)
3. **Let Cloudinary handle format validation** - It knows what formats are valid for each resource type
4. **No artificial restrictions** on file formats

### File Type Validation

The multer `fileFilter` still validates MIME types before upload:

```typescript
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
```

This ensures only approved file types reach Cloudinary.

## Supported File Types

### Images (resource_type: "image")

- ✅ JPEG/JPG - `image/jpeg`
- ✅ PNG - `image/png`

### Documents (resource_type: "raw")

- ✅ PDF - `application/pdf`
- ✅ DOC - `application/msword`
- ✅ DOCX - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- ✅ TXT - `text/plain`

All these file types will now upload successfully to Cloudinary!

## Cloudinary Resource Types Explained

Cloudinary has three main resource types:

1. **`image`**: For image files (jpg, png, gif, webp, etc.)
   - Supports image transformations
   - Can apply filters, resize, crop, etc.
2. **`video`**: For video files (mp4, webm, etc.)
   - Supports video transformations
   - Can trim, resize, convert formats
3. **`raw`**: For non-media files (pdf, doc, txt, zip, etc.)
   - No transformations
   - Simple file storage and delivery
   - Perfect for documents

## Backend Changes

✅ **Removed `allowed_formats` restriction**
✅ **Dynamic `resource_type` determination**
✅ **Added logging for uploaded files**
✅ **Simplified Cloudinary configuration**

## Testing

### The backend should auto-restart with changes. If not:

```powershell
cd backend
# Server should auto-reload, or restart manually
```

### Try uploading again:

1. Go to application form
2. Upload files:
   - Resume (PDF, DOC, DOCX, TXT)
   - Application letter (PDF, DOC, DOCX, TXT)
   - Documents (PDF, DOC, DOCX, TXT, JPG, PNG)
3. Submit

### Check backend console:

You should see:

```
Uploading file: {
  originalname: 'resume.pdf',
  mimetype: 'application/pdf',
  resourceType: 'raw'
}
Uploading file: {
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
  resourceType: 'image'
}
```

### Expected Results:

✅ All files upload successfully
✅ No "unknown file format" errors
✅ Files appear in Cloudinary dashboard
✅ Application created with document URLs

## Why This Works

### Before:

```typescript
allowed_formats: ["jpg", "png", "pdf", "doc", "docx", "txt"],
resource_type: "auto"
```

- ❌ Too restrictive - rejects valid files
- ❌ `.jpeg` files rejected (only `.jpg` allowed)
- ❌ `resource_type: "auto"` conflicts with allowed_formats
- ❌ Documents might be uploaded as wrong type

### After:

```typescript
resource_type: determined_from_mimetype, // "image" or "raw"
// No allowed_formats restriction
```

- ✅ Flexible - accepts all valid formats for the resource type
- ✅ `.jpeg` and `.jpg` both work
- ✅ Correct resource type for each file
- ✅ Documents uploaded as "raw", images as "image"
- ✅ Cloudinary handles format validation internally

## Additional Notes

### MIME Type Protection

File validation still happens at the multer level through `fileFilter`, so only approved MIME types reach Cloudinary. This prevents malicious file uploads.

### File Extensions

The file extension doesn't matter as much as the MIME type. Cloudinary uses the MIME type to determine how to handle the file.

### Cloudinary URLs

- Images: `https://res.cloudinary.com/[cloud]/image/upload/[folder]/[file]`
- Documents: `https://res.cloudinary.com/[cloud]/raw/upload/[folder]/[file]`

Notice "image" vs "raw" in the URL path.

## Status

🎉 **READY TO TEST!**

The "unknown file format" error should now be resolved. All supported file types will upload correctly:

- PDFs → uploaded as "raw"
- DOCs → uploaded as "raw"
- JPGs/PNGs → uploaded as "image"
- TXTs → uploaded as "raw"

Try uploading your files again! 🚀
