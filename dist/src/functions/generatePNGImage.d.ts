import { GenerateImageResult } from '../types';
export declare const generatePNGImage: ({ filePath, outputFileName, }: {
    filePath: string;
    outputFileName?: string;
}) => Promise<GenerateImageResult>;
