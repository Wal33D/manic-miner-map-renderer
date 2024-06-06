import path from 'path';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { generatePngBuffer } from './generatePngBuffer';
import { generateThumbnailBuffer } from './generateThumbnailBuffer';

dotenv.config({ path: '.env.local' });

export interface ImageGenerationStreamResult {
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

const uploadBufferToCloudinary = (buffer: Buffer, fileName: string, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: fileName,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        uploadStream.end(buffer);
    });
};

export const generateAndUploadStream = async (datFileBuffer: Buffer, datFileName: string): Promise<ImageGenerationStreamResult> => {
    const fileDirectoryName = path.basename(datFileName, path.extname(datFileName));
    const generatedScreenshotFileName = `${fileDirectoryName}_screenshot_render`;
    const generatedThumbnailFileName = `${fileDirectoryName}_thumbnail_render`;

    // Generate PNG screenshot and Thumbnail image concurrently
    const [pngResult, thumbnailResult] = await Promise.all([
        generatePngBuffer({ buffer: datFileBuffer as Buffer }),
        generateThumbnailBuffer({ buffer: datFileBuffer }),
    ]);

    // Upload PNG screenshot and Thumbnail image concurrently
    const [screenshotUrl, thumbnailUrl] = await Promise.all([
        pngResult.imageCreated
            ? uploadBufferToCloudinary(pngResult.imageBuffer!, generatedScreenshotFileName, process.env.CATALOG_NAME as string)
            : Promise.resolve(''),
        thumbnailResult.imageCreated
            ? uploadBufferToCloudinary(thumbnailResult.imageBuffer!, generatedThumbnailFileName, process.env.CATALOG_NAME as string)
            : Promise.resolve(''),
    ]);

    return {
        screenshotUrl,
        thumbnailUrl,
        screenshotExists: !!screenshotUrl,
        thumbnailExists: !!thumbnailUrl,
    };
};
