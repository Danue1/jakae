export interface ImagePort {
  saveImageFile(file: Blob): Promise<string>;
  copyImage(imageId: string): Promise<string | null>;
  getImageUrl(imageId: string): Promise<string | null>;
}
