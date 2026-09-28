/**
 * Replaceable Media Upload Service Interface
 */

export interface UploadProgressCallback {
  (percentage: number): void;
}

export interface IMediaUploadService {
  uploadAudioReport(
    filePath: string,
    onProgress?: UploadProgressCallback
  ): Promise<string>; // Returns remote URL

  uploadShopPhoto(
    localUri: string,
    onProgress?: UploadProgressCallback
  ): Promise<string>; // Returns remote URL
}
