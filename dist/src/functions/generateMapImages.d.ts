export interface ImageGenerationResult {
    thumbnailExists: boolean;
    screenshotExists: boolean;
    thumbnailCreated: boolean;
    screenshotCreated: boolean;
    thumbnailPath: string;
    screenshotPath: string;
}
export declare const generateMapImages: (datFilePath: string) => Promise<ImageGenerationResult>;
