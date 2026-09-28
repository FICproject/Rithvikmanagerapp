/**
 * HTTP Implementation of IMediaUploadService
 */
import { IMediaUploadService, UploadProgressCallback } from './IMediaUploadService';
import { apiClient } from '../api/ApiClient';
import { services } from '../index';

interface UploadResponse {
  url: string;
}

export class HttpMediaUploadService implements IMediaUploadService {
  async uploadAudioReport(
    filePath: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const token = await services.storageService.getAuthToken();
    const formData = new FormData();
    const filename = filePath.split('/').pop() || `voice_${Date.now()}.m4a`;

    formData.append('file', {
      uri: filePath,
      name: filename,
      type: 'audio/m4a',
    } as any);

    if (onProgress) onProgress(30);

    const response = await apiClient.uploadMultipart<UploadResponse>(
      '/uploads/audio',
      formData,
      token || undefined
    );

    if (onProgress) onProgress(100);
    return response.data.url;
  }

  async uploadShopPhoto(
    localUri: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const token = await services.storageService.getAuthToken();
    const formData = new FormData();
    const filename = localUri.split('/').pop() || `photo_${Date.now()}.jpg`;

    formData.append('file', {
      uri: localUri,
      name: filename,
      type: 'image/jpeg',
    } as any);

    if (onProgress) onProgress(30);

    const response = await apiClient.uploadMultipart<UploadResponse>(
      '/uploads/image',
      formData,
      token || undefined
    );

    if (onProgress) onProgress(100);
    return response.data.url;
  }
}
