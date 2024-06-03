interface ImageGenerationResult {
    screenshotPath: string;
    thumbnailPath: string;
    screenshotExists: boolean;
    thumbnailExists: boolean;
}
export declare const generateMapImages: (datFilePath: string) => Promise<ImageGenerationResult>;
export {};
