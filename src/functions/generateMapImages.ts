import path from 'path';
import * as dotenv from 'dotenv';
import { generatePNGImage } from './generatePNGImage';
import { generateThumbnailImage } from './generateThumbnailImage';

dotenv.config({ path: '.env.local' });

export interface ImageGenerationResult {
    thumbnailExists: boolean;
    screenshotExists: boolean;
    thumbnailCreated: boolean;
    screenshotCreated: boolean;
    thumbnailPath: string;
    screenshotPath: string;
}

export const generateMapImages = async (datFilePath: string): Promise<ImageGenerationResult> => {
    const imageDestinationPath = path.dirname(datFilePath);

    const fileDirectoryName = path.basename(path.dirname(datFilePath));
    let screenshotPath = '';
    let thumbnailPath = '';
    let screenshotExists = false;
    let thumbnailExists = false;
    let screenshotCreated = false;
    let thumbnailCreated = false;

    // Generate PNG screenshot
    const generatedScreenshotFileName = `${fileDirectoryName}_screenshot_render.png`;
    const pngResult = await generatePNGImage({
        filePath: datFilePath,
        outputFileName: generatedScreenshotFileName,
    });

    if (pngResult.imageCreated) {
        screenshotPath = path.resolve(pngResult.filePath);
        screenshotCreated = true;
        screenshotExists = true;
    } else {
        screenshotPath = path.resolve(imageDestinationPath, generatedScreenshotFileName);
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
        thumbnailCreated = true;
    } else {
        thumbnailPath = path.resolve(imageDestinationPath, generatedThumbnailFileName);
        thumbnailExists = true;
    }

    return {
        screenshotPath,
        thumbnailPath,
        screenshotExists,
        thumbnailExists,
        thumbnailCreated,
        screenshotCreated,
    };
};
