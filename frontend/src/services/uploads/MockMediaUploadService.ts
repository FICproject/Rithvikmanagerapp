/**
 * Mock Media Upload Service Implementation
 */
import { IMediaUploadService, UploadProgressCallback } from './IMediaUploadService';

export class MockMediaUploadService implements IMediaUploadService {
  async uploadAudioReport(
    filePath: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    if (onProgress) {
      onProgress(50);
      onProgress(100);
    }
    return `https://storage.forgeindia.in/audio/reports/${Date.now()}.m4a`;
  }

  async uploadShopPhoto(
    localUri: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    if (onProgress) {
      onProgress(50);
      onProgress(100);
    }
    return localUri || `file:///data/user/0/com.ficmanager/cache/photo_${Date.now()}.jpg`;
  }
}
