import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { generatePNGImage } from './src/functions/generatePNGImage';
import { generateThumbnailImage } from './src/functions/generateThumbnailImage';
import { GenerateImageResult, GenerateMapImageParams, GenerateMapImageResult, ProcessDirectoryResult } from './src/types';
export { GenerateImageResult, GenerateMapImageResult } from './src/types';
export {generateMapImages} from './src/functions/generateMapImages';
dotenv.config({ path: '.env.local' });

const findDatFiles = async (dir: string): Promise<string[]> => {
    const results: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...(await findDatFiles(fullPath)));
        } else if (entry.isFile() && entry.name.endsWith('.dat')) {
            results.push(fullPath);
        }
    }

    return results;
};

const processDirectory = async (
    datDirectory: string,
    type: 'png' | 'thumbnail' | 'both',
    progressCallback?: (progress: { processedCount: number; totalCount: number }) => void,
    screenshotFileName?: string,
    thumbnailFileName?: string
): Promise<ProcessDirectoryResult> => {
    const datFiles = await findDatFiles(datDirectory);
    const totalCount = datFiles.length;
    const results: GenerateImageResult[] = [];
    let updateNeeded = false;
    let processedCount = 0;

    for (const filePath of datFiles) {
        const fileDirectoryName = path.basename(path.dirname(filePath));

        if (type === 'png' || type === 'both') {
            const generatedScreenshotFileName = screenshotFileName || `${fileDirectoryName}_screenshot_render.png`;
            const pngResult = await generatePNGImage({
                filePath,
                outputFileName: generatedScreenshotFileName,
            });
            results.push(pngResult);
            if (pngResult.imageCreated) {
                updateNeeded = true;
                processedCount += 1;
            }
        }

        if (type === 'thumbnail' || type === 'both') {
            const generatedThumbnailFileName = thumbnailFileName || `${fileDirectoryName}_thumbnail_render.png`;
            const thumbnailResult = await generateThumbnailImage({
                filePath,
                outputFileName: generatedThumbnailFileName,
            });
            results.push(thumbnailResult);
            if (thumbnailResult.imageCreated) {
                updateNeeded = true;
                processedCount += 1;
            }
        }

        if (progressCallback) {
            progressCallback({ processedCount, totalCount });
        }
    }

    return { results, processedCount, totalCount, updateNeeded };
};

export const generateMapImage = async ({
    type,
    directoryPath,
    screenshotFileName,
    thumbnailFileName,
    progressCallback,
}: GenerateMapImageParams & {
    progressCallback?: (progress: { processedCount: number; totalCount: number }) => void;
}): Promise<GenerateMapImageResult> => {
    const resolvedDirectoryPath = directoryPath || process.env.MMT_CATALOG_DIR;
    if (!resolvedDirectoryPath) {
        const message = 'MMT_CATALOG_DIR is not defined in .env.local and no directory path was provided.';
        console.error(message);
        return {
            updateNeeded: false,
            processedCount: 0,
            totalCount: 0,
            errors: true,
            message,
        };
    }

    try {
        const {
            updateNeeded,
            results: processingResults,
            processedCount,
            totalCount,
        } = await processDirectory(resolvedDirectoryPath, type, progressCallback, screenshotFileName, thumbnailFileName);
        const errors = processingResults.filter(result => !result.status);
        const errorCount = errors.length;

        const message = errorCount > 0 ? `Processing completed with ${errorCount} errors.` : 'Processing completed successfully.';

        return {
            updateNeeded,
            processedCount,
            totalCount,
            errors: errorCount > 0,
            message,
        };
    } catch (error: any) {
        const message = `Error processing directory: ${error.message}`;
        console.error(message);
        return {
            updateNeeded: false,
            processedCount: 0,
            totalCount: 0,
            errors: true,
            message,
        };
    }
};
