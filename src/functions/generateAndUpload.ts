import path from 'path';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { generatePNGImage } from './generatePNGImage';
import { generateThumbnailImage } from './generateThumbnailImage';

dotenv.config({ path: '.env.local' });

export interface ImageGenerationUploadResult {
    thumbnailExists: boolean;
    screenshotExists: boolean;
    thumbnailUrl: string;
    screenshotUrl: string;
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath: string, folder: string): Promise<string> => {
    const fileName = path.basename(filePath, path.extname(filePath));
    const result = await cloudinary.uploader.upload(filePath, {
        folder,
        public_id: fileName,
    });
    return result.secure_url;
};

export const generateAndUpload = async (datFilePath: string): Promise<ImageGenerationUploadResult> => {
    const fileDirectoryName = path.basename(path.dirname(datFilePath));
    const generatedScreenshotFileName = `${fileDirectoryName}_screenshot_render.png`;
    const generatedThumbnailFileName = `${fileDirectoryName}_thumbnail_render.png`;

    // Generate PNG screenshot and Thumbnail image concurrently
    const [pngResult, thumbnailResult] = await Promise.all([
        generatePNGImage({
            filePath: datFilePath,
            outputFileName: generatedScreenshotFileName,
        }),
        generateThumbnailImage({
            filePath: datFilePath,
            outputFileName: generatedThumbnailFileName,
        }),
    ]);

    // Upload PNG screenshot and Thumbnail image concurrently
    const [screenshotUrl, thumbnailUrl] = await Promise.all([
        pngResult.imageCreated ? uploadToCloudinary(pngResult.filePath, process.env.CATALOG_NAME as string) : Promise.resolve(''),
        thumbnailResult.imageCreated ? uploadToCloudinary(thumbnailResult.filePath, process.env.CATALOG_NAME as string) : Promise.resolve(''),
    ]);

    return {
        screenshotUrl,
        thumbnailUrl,
        screenshotExists: !!screenshotUrl,
        thumbnailExists: !!thumbnailUrl,
    };
};
