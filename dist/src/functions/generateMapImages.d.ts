interface ImageGenerationResult {
    screenshotPath: string;
    thumbnailPath: string;
}
export declare const generateMapImages: (datFilePath: string) => Promise<ImageGenerationResult>;
export {};
