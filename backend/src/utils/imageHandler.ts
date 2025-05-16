// import { Settings } from "@/settings";
// import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
// import path from "path";
// import sharp from "sharp";
// import { Readable } from "stream";

// cloudinary.config({
//   cloud_name: Settings.CLOUDINARY_CONFIG.CLOUDINARY_CLOUD_NAME,
//   api_key: Settings.CLOUDINARY_CONFIG.CLOUDINARY_API_KEY,
//   api_secret: Settings.CLOUDINARY_CONFIG.CLOUDINARY_API_SECRET,
// });

// export interface UploadedFile {
//   buffer: Buffer;
//   originalname: string;
// }

// export class CloudinaryImageHandler {
//   private defaultFolder: string;
//   public uploadedResults: UploadApiResponse[] = [];

//   constructor(defaultFolder = "uploads") {
//     this.defaultFolder = defaultFolder;
//   }

//   private bufferToStream(buffer: Buffer): Readable {
//     const stream = new Readable();
//     stream.push(buffer);
//     stream.push(null);
//     return stream;
//   }

//   public async uploadImage(
//     file: UploadedFile,
//     folder: string = this.defaultFolder
//   ): Promise<UploadApiResponse> {
//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder,
//           public_id: file.originalname.split(".")[0], // optional: customize this
//         },
//         (error, result) => {
//           if (error || !result) return reject(error);
//           this.uploadedResults.push(result); // track uploaded image
//           resolve(result);
//         }
//       );
//       this.bufferToStream(file.buffer).pipe(uploadStream);
//     });
//   }
//   public async resizeImage(
//     file: UploadedFile,
//     width: number,
//     height: number,
//     folder: string = this.defaultFolder
//   ) {
//     const buffer = await sharp(file.buffer)
//       .resize(width, height)
//       .webp({ quality: 60 })
//       .toBuffer();
//     return buffer;
//   }

//   public async uploadImages(
//     files: UploadedFile[],
//     folder: string = this.defaultFolder
//   ): Promise<UploadApiResponse[]> {
//     const uploads = await Promise.all(
//       files.map((file) => this.uploadImage(file, folder))
//     );
//     return uploads;
//   }

//   public async deleteImage(publicId: string): Promise<any> {
//     return publicId ? cloudinary.uploader.destroy(publicId) : null;
//   }

//   public async deleteMany(publicIds: string[]): Promise<any[]> {
//     const deletions = publicIds.map((id) => this.deleteImage(id));
//     return Promise.all(deletions);
//   }

//   public getImageUrl(publicId: string, secure: boolean = true): string {
//     return cloudinary.url(publicId, { secure });
//   }

//   public async updateImage(
//     publicId: string,
//     newFile: UploadedFile,
//     folder: string = this.defaultFolder
//   ): Promise<UploadApiResponse> {
//     if (publicId) {
//       await this.deleteImage(publicId);
//     }
//     return this.uploadImage(newFile, folder);
//   }
// }

import { Settings } from "@/settings";
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import sharp from "sharp";
import { Readable } from "stream";

// Configure Cloudinary once at module level
cloudinary.config({
  cloud_name: Settings.CLOUDINARY_CONFIG.CLOUDINARY_CLOUD_NAME,
  api_key: Settings.CLOUDINARY_CONFIG.CLOUDINARY_API_KEY,
  api_secret: Settings.CLOUDINARY_CONFIG.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
});

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
}

export class CloudinaryImageHandler {
  private readonly defaultFolder: string;
  private readonly uploadedResults: UploadApiResponse[] = [];
  private readonly concurrencyLimit: number;

  constructor(defaultFolder = "uploads", concurrencyLimit = 5) {
    this.defaultFolder = defaultFolder;
    this.concurrencyLimit = concurrencyLimit;
  }

  // Convert buffer to stream efficiently
  private bufferToStream(buffer: Buffer): Readable {
    return Readable.from(buffer);
  }

  // Core upload method with proper typing
  private async uploadToCloudinary(
    stream: Readable,
    options: {
      folder: string;
      public_id?: string;
      transformation?: any[];
    }
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) {
            return reject(
              new Error(`Cloudinary upload failed: ${error.message}`)
            );
          }
          if (!result) {
            return reject(new Error("Cloudinary upload returned no result"));
          }
          this.uploadedResults.push(result);
          resolve(result);
        }
      );

      stream.pipe(uploadStream).on("error", reject);
    });
  }

  // Optimized image processing with sharp
  public async processImage(
    file: UploadedFile,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: keyof sharp.FormatEnum;
    } = {}
  ): Promise<Buffer> {
    const { width, height, quality = 80, format = "webp" } = options;

    const pipeline = sharp(file.buffer);

    if (width || height) {
      pipeline.resize(width, height, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      });
    }

    return pipeline.toFormat(format, { quality }).toBuffer();
  }

  // Main upload method with processing
  public async uploadImage(
    file: UploadedFile,
    options: {
      folder?: string;
      transformations?: any[];
      processOptions?: Parameters<typeof this.processImage>[1];
    } = {}
  ): Promise<UploadApiResponse> {
    try {
      const processedBuffer = options.processOptions
        ? await this.processImage(file, options.processOptions)
        : file.buffer;

      const stream = this.bufferToStream(processedBuffer);

      return this.uploadToCloudinary(stream, {
        folder: options.folder || this.defaultFolder,
        public_id: file.originalname.replace(/\.[^/.]+$/, ""), // Remove extension
        transformation: options.transformations,
      });
    } catch (error) {
      throw new Error(
        `Image upload failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Batch upload with concurrency control
  public async uploadImages(
    files: UploadedFile[],
    options?: {
      folder?: string;
      concurrency?: number;
    }
  ): Promise<UploadApiResponse[]> {
    const concurrency = options?.concurrency || this.concurrencyLimit;
    const results: UploadApiResponse[] = [];
    const errors: Error[] = [];

    // Process in batches to avoid memory overload
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);

      const batchResults = await Promise.all(
        batch.map((file) =>
          this.uploadImage(file, { folder: options?.folder }).catch((error) => {
            errors.push(error);
            return null;
          })
        )
      );

      results.push(...(batchResults.filter(Boolean) as UploadApiResponse[]));

      if (errors.length > 0) {
        console.warn(
          `Batch ${i / concurrency + 1} had ${errors.length} failures`
        );
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error("All image uploads failed");
      // throw new AggregateError(errors, "All image uploads failed");
    }

    return results;
  }

  // Improved deletion methods
  public async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;

    try {
      return await cloudinary.uploader.destroy(publicId, {
        invalidate: true, // Also purge CDN cache
      });
    } catch (error) {
      throw new Error(
        `Failed to delete image ${publicId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  public async deleteImages(publicIds: string[]): Promise<void> {
    const validIds = publicIds.filter((id) => id);
    if (validIds.length === 0) return;

    // Cloudinary supports batch deletion
    try {
      await cloudinary.api.delete_resources(validIds, {
        invalidate: true,
      });
    } catch (error) {
      throw new Error(
        `Batch deletion failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // URL generation with transformations
  public getImageUrl(
    publicId: string,
    options: {
      transformations?: any[];
      format?: string;
      secure?: boolean;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      secure: options.secure ?? true,
      format: options.format,
      transformation: options.transformations,
    });
  }

  // Update with atomic operations
  public async updateImage(
    publicId: string,
    newFile: UploadedFile,
    options: {
      folder?: string;
      transformations?: any[];
    } = {}
  ): Promise<UploadApiResponse> {
    // Upload new image first (in case deletion fails)
    const uploadResult = await this.uploadImage(newFile, {
      folder: options.folder,
      transformations: options.transformations,
    });

    // Then delete old image if needed
    if (publicId) {
      try {
        await this.deleteImage(publicId);
      } catch (error) {
        console.error(`Failed to delete old image ${publicId}:`, error);
        // Continue anyway - we don't want to roll back the new upload
      }
    }

    return uploadResult;
  }

  // Getter for uploaded results
  public getUploadedResults(): Readonly<UploadApiResponse[]> {
    return this.uploadedResults;
  }
}
