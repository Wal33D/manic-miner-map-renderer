/// <reference types="node" />
export interface ImageGenerationStreamResult {
    thumbnailExists: boolean;
    screenshotExists: boolean;
    thumbnailUrl: string;
    screenshotUrl: string;
}
export declare const generateAndUploadStream: (datFileBuffer: Buffer, datFileName: string, cloudinaryAssetFolder: string) => Promise<ImageGenerationStreamResult>;
