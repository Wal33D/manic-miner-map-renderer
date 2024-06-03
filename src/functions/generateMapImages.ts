import path from 'path';
import * as dotenv from 'dotenv';
import { generatePNGImage } from './generatePNGImage';
import { generateThumbnailImage } from './generateThumbnailImage';


dotenv.config({ path: '.env.local' });

export const generateMapImages = async (datFilePath: string): Promise<{}> => {
    const fileDirectoryName = path.basename(path.dirname(datFilePath));
    const results: { thumbnailCreated: boolean; screenshotCreated: boolean; thumbnailPath: string; screenshotPath: string } = {
        thumbnailCreated: false,
        screenshotCreated: false,
        thumbnailPath: '',
        screenshotPath: ''
    };

    // Generate PNG screenshot
    const generatedScreenshotFileName = `${fileDirectoryName}_screenshot_render.png`;
    const pngResult = await generatePNGImage({
        filePath: datFilePath,
        outputFileName: generatedScreenshotFileName,
    });

    if (pngResult.imageCreated) {
        results.screenshotCreated = true;
        results.screenshotPath = path.resolve(pngResult.filePath);
    }

    // Generate Thumbnail image
    const generatedThumbnailFileName = `${fileDirectoryName}_thumbnail_render.png`;
    const thumbnailResult = await generateThumbnailImage({
        filePath: datFilePath,
        outputFileName: generatedThumbnailFileName,
    });

    if (thumbnailResult.imageCreated) {
        results.thumbnailCreated = true;
        results.thumbnailPath = path.resolve(thumbnailResult.filePath);
    }

    return {
        updateNeeded: results.thumbnailCreated || results.screenshotCreated,
        processedCount: Number(results.thumbnailCreated) + Number(results.screenshotCreated),
        totalCount: 2, // One for thumbnail and one for screenshot
        errors: !(results.thumbnailCreated && results.screenshotCreated),
        message: 'Image generation completed',
        results
    };
};
