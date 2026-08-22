export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  original_filename: string;
  resource_type: string;
}

export interface UploadOptions {
  folder?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  onProgress?: (progress: number) => void;
}

const getCloudName = (): string => {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
};

const getUploadPreset = (): string => {
  return process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';
};

export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResponse> {
  const { folder = 'hrms', allowedTypes, maxSizeMB = 10, onProgress } = options;

  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some((type) => file.type.includes(type));
    if (!isAllowed) {
      throw new Error(`File type ${file.type} is not supported. Allowed: ${allowedTypes.join(', ')}`);
    }
  }

  const cloudName = getCloudName();
  const uploadPreset = getUploadPreset();
  const resourceType = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
    ? 'video'
    : 'raw';

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response as CloudinaryUploadResponse);
        } catch (e) {
          reject(new Error('Invalid response from Cloudinary upload server'));
        }
      } else {
        try {
          const errorResp = JSON.parse(xhr.responseText);
          reject(new Error(errorResp.error?.message || 'Cloudinary upload failed'));
        } catch (e) {
          reject(new Error(`Upload failed with status code ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during file upload'));
    xhr.send(formData);
  });
}
