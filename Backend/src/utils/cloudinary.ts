import cloudinary from '../config/cloudinary.config';
import { ApiError } from './apiError';

export interface CloudinaryResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
}

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder = 'dayflow_hrms'
): Promise<CloudinaryResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) {
          return reject(new ApiError(500, error?.message || 'Cloudinary upload failed'));
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(buffer);
  });
};
