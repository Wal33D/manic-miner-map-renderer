import path from 'path';
import * as dotenv from 'dotenv';
import { generatePNGImage } from './generatePNGImage';
import { generateThumbnailImage } from './generateThumbnailImage';

dotenv.config({ path: '.env.local' });

interface ImageGenerationResult {
    screenshotPath: string;
    thumbnailPath: string;
}

export const generateMapImages = async (datFilePath: string): Promise<ImageGenerationResult> => {
    const fileDirectoryName = path.basename(path.dirname(datFilePath));
    let screenshotPath = '';
    let thumbnailPath = '';

    // Generate PNG screenshot
    const generatedScreenshotFileName = `${fileDirectoryName}_screenshot_render.png`;
    const pngResult = await generatePNGImage({
        filePath: datFilePath,
        outputFileName: generatedScreenshotFileName,
    });

    if (pngResult.imageCreated) {
        screenshotPath = path.resolve(pngResult.filePath);
    }

    // Generate Thumbnail image
    const generatedThumbnailFileName = `${fileDirectoryName}_thumbnail_render.png`;
    const thumbnailResult = await generateThumbnailImage({
        filePath: datFilePath,
        outputFileName: generatedThumbnailFileName,
    });

    if (thumbnailResult.imageCreated) {
        thumbnailPath = path.resolve(thumbnailResult.filePath);
    }

    return {
        screenshotPath,
        thumbnailPath,
    };
};
