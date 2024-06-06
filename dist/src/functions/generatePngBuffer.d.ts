/// <reference types="node" />
import { GenerateImageResult } from '../types';
export declare const generatePngBuffer: ({ filePath, buffer }: {
    filePath?: string;
    buffer?: Buffer;
}) => Promise<GenerateImageResult>;
