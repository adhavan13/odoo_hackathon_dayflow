import { uploadBufferToCloudinary, CloudinaryResult } from '../utils/cloudinary';
import { ApiError } from '../utils/apiError';

export class CloudinaryService {
  static async uploadFile(file: Express.Multer.File, folder = 'dayflow_uploads'): Promise<CloudinaryResult> {
    if (!file || !file.buffer) {
      throw new ApiError(400, 'No file buffer provided for upload');
    }
    return await uploadBufferToCloudinary(file.buffer, folder);
  }
}
