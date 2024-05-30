import { GenerateImageResult } from '../types';
export declare const generateThumbnailImage: ({ filePath, outputFileName, }: {
    filePath: string;
    outputFileName?: string;
}) => Promise<GenerateImageResult>;
