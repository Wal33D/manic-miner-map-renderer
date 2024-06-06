export { generatePngBuffer } from './src/functions/generatePngBuffer';
export { generateMapImages } from './src/functions/generateMapImages';
export { generateThumbnailBuffer } from './src/functions/generateThumbnailBuffer';
export { GenerateImageResult, GenerateMapImageResult } from './src/types';
export { generateAndUpload, ImageGenerationUploadResult } from './src/functions/generateAndUpload';
export { generateAndUploadStream, ImageGenerationStreamResult } from './src/functions/generateAndUploadStream';
import { GenerateMapImageParams, GenerateMapImageResult } from './src/types';
export declare const generateMapImage: ({ type, directoryPath, screenshotFileName, thumbnailFileName, progressCallback, }: GenerateMapImageParams & {
    progressCallback?: (progress: {
        processedCount: number;
        totalCount: number;
    }) => void;
}) => Promise<GenerateMapImageResult>;
