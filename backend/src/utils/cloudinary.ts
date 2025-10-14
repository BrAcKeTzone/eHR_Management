import cloudinary from "../configs/cloudinary";

/**
 * Delete an image from Cloudinary by its public ID
 * @param publicId - The public ID of the image to delete
 * @returns Result of the deletion operation
 */
export const deleteImage = async (
  publicId: string
): Promise<{ result: string; message?: string }> => {
  if (!publicId) return { result: "skipped", message: "No public ID provided" };

  try {
    console.log(`Attempting to delete image with public_id: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary deletion result for ${publicId}: ${result.result}`);
    return result;
  } catch (error: any) {
    console.error(`Error deleting image from Cloudinary: ${error.message}`);
    throw error;
  }
};

/**
 * Delete multiple images from Cloudinary by their public IDs
 * @param publicIds - Array of public IDs to delete
 * @returns Results of the deletion operations
 */
export const deleteMultipleImages = async (
  publicIds: string[]
): Promise<PromiseSettledResult<any>[]> => {
  if (!publicIds || !publicIds.length) return [];

  try {
    const validPublicIds = publicIds.filter((id) => id);

    if (validPublicIds.length === 0) return [];

    console.log(`Deleting ${validPublicIds.length} images from Cloudinary`);

    // Use Promise.allSettled to handle partial failures
    const results = await Promise.allSettled(
      validPublicIds.map((id) => deleteImage(id))
    );

    return results;
  } catch (error: any) {
    console.error(`Error deleting multiple images: ${error.message}`);
    throw error;
  }
};

/**
 * Upload file buffer to Cloudinary
 * @param fileBuffer - The file buffer to upload
 * @param options - Upload options (folder, resource_type, etc.)
 * @returns Upload result with URL and public_id
 */
export const uploadBuffer = async (
  fileBuffer: Buffer,
  options: {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    public_id?: string;
    use_filename?: boolean;
    unique_filename?: boolean;
    timeout?: number;
  } = {}
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadTimeout = setTimeout(() => {
      reject(
        new Error(
          "Upload timed out. Server might be experiencing high load or connection issues."
        )
      );
    }, options.timeout || 60000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "hr-applications",
        resource_type: options.resource_type || "auto",
        public_id: options.public_id,
        use_filename: options.use_filename ?? true,
        unique_filename: options.unique_filename ?? false,
        timeout: options.timeout || 60000,
      },
      (error, result) => {
        clearTimeout(uploadTimeout);
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.on("error", (error) => {
      clearTimeout(uploadTimeout);
      reject(new Error(`Upload stream error: ${error.message}`));
    });

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload base64 image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param options - Upload options
 * @returns Upload result
 */
export const uploadBase64 = async (
  base64Image: string,
  options: {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    timeout?: number;
  } = {}
): Promise<any> => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: options.folder || "hr-applications",
      resource_type: options.resource_type || "image",
      timeout: options.timeout || 60000,
    });
    return result;
  } catch (error: any) {
    console.error("Base64 upload error:", error);
    throw error;
  }
};

/**
 * Get Cloudinary resource details
 * @param publicId - The public ID of the resource
 * @returns Resource details
 */
export const getResourceDetails = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error: any) {
    console.error("Error fetching resource details:", error);
    throw error;
  }
};

/**
 * List resources in a folder
 * @param folderPath - The folder path
 * @param options - List options
 * @returns List of resources
 */
export const listResources = async (
  folderPath: string,
  options: {
    max_results?: number;
    resource_type?: string;
  } = {}
): Promise<any> => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: options.max_results || 100,
      resource_type: options.resource_type || "image",
    });
    return result;
  } catch (error: any) {
    console.error("Error listing resources:", error);
    throw error;
  }
};
