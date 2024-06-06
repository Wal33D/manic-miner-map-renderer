/// <reference types="node" />
import { GenerateImageResult } from '../types';
export declare const generateThumbnailBuffer: ({ filePath, buffer }: {
    filePath?: string;
    buffer?: Buffer;
}) => Promise<GenerateImageResult>;
