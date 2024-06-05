export interface ImageGenerationUploadResult {
    thumbnailExists: boolean;
    screenshotExists: boolean;
    thumbnailUrl: string;
    screenshotUrl: string;
}
export declare const generateAndUpload: (datFilePath: string) => Promise<ImageGenerationUploadResult>;
