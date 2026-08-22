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

  // Try direct Cloudinary upload if valid credentials exist
  try {
    if (cloudName && cloudName !== 'demo' && uploadPreset && uploadPreset !== 'unsigned_preset') {
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

      return await new Promise((resolve, reject) => {
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
  } catch (directErr) {
    console.warn('Direct Cloudinary upload failed, trying Backend upload API...', directErr);
  }

  // Fallback: Try Backend Upload API (using CLOUDINARY_API_KEY & API_SECRET)
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${apiUrl}/upload/cloudinary`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const res = data.data || data;
      return {
        public_id: res.public_id || `bg_${Date.now()}`,
        secure_url: res.secure_url || res.url,
        url: res.url || res.secure_url,
        format: res.format || file.type.split('/')[1] || 'png',
        bytes: res.bytes || file.size,
        original_filename: file.name,
        resource_type: 'image',
      };
    }
  } catch (bgErr) {
    console.warn('Backend Cloudinary upload API failed, falling back to local Object URL preview', bgErr);
  }

  // Fallback: Create Object URL preview
  const localUrl = URL.createObjectURL(file);
  return {
    public_id: `local_${Date.now()}`,
    secure_url: localUrl,
    url: localUrl,
    format: file.type.split('/')[1] || 'png',
    bytes: file.size,
    original_filename: file.name,
    resource_type: 'image',
  };
}
