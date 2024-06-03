import path from 'path';
import * as dotenv from 'dotenv';
import { generatePNGImage } from './generatePNGImage';
import { generateThumbnailImage } from './generateThumbnailImage';

dotenv.config({ path: '.env.local' });

export interface ImageGenerationResult {
    screenshotPath: string;
    thumbnailPath: string;
    screenshotExists: boolean;
    thumbnailExists: boolean;
}

export const generateMapImages = async (datFilePath: string): Promise<ImageGenerationResult> => {
    const fileDirectoryName = path.basename(path.dirname(datFilePath));
    let screenshotPath = '';
    let thumbnailPath = '';
    let screenshotExists = false;
    let thumbnailExists = false;

    // Generate PNG screenshot
    const generatedScreenshotFileName = `${fileDirectoryName}_screenshot_render.png`;
    const pngResult = await generatePNGImage({
        filePath: datFilePath,
        outputFileName: generatedScreenshotFileName,
    });

    if (pngResult.imageCreated) {
        screenshotPath = path.resolve(pngResult.filePath);
        screenshotExists = true;
    }

    // Generate Thumbnail image
    const generatedThumbnailFileName = `${fileDirectoryName}_thumbnail_render.png`;
    const thumbnailResult = await generateThumbnailImage({
        filePath: datFilePath,
        outputFileName: generatedThumbnailFileName,
    });

    if (thumbnailResult.imageCreated) {
        thumbnailPath = path.resolve(thumbnailResult.filePath);
        thumbnailExists = true;
    }

    return {
        screenshotPath,
        thumbnailPath,
        screenshotExists,
        thumbnailExists,
    };
};
