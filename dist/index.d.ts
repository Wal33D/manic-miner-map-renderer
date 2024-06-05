import { GenerateMapImageParams, GenerateMapImageResult } from './src/types';
export { GenerateImageResult, GenerateMapImageResult } from './src/types';
export { generateMapImages } from './src/functions/generateMapImages';
export { generateAndUpload, ImageGenerationUploadResult } from './src/functions/generateAndUpload';
export declare const generateMapImage: ({ type, directoryPath, screenshotFileName, thumbnailFileName, progressCallback, }: GenerateMapImageParams & {
    progressCallback?: (progress: {
        processedCount: number;
        totalCount: number;
    }) => void;
}) => Promise<GenerateMapImageResult>;
