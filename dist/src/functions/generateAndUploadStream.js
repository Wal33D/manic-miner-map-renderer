"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndUploadStream = void 0;
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const cloudinary_1 = require("cloudinary");
const generatePngBuffer_1 = require("./generatePngBuffer");
const generateThumbnailBuffer_1 = require("./generateThumbnailBuffer");
dotenv.config({ path: '.env.local' });
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadBufferToCloudinary = (buffer, fileName, cloudinaryAssetFolder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: cloudinaryAssetFolder,
            public_id: fileName,
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result.secure_url);
            }
        });
        uploadStream.end(buffer);
    });
};
const generateAndUploadStream = (datFileBuffer, datFileName, cloudinaryAssetFolder) => __awaiter(void 0, void 0, void 0, function* () {
    const fileDirectoryName = path_1.default.basename(datFileName, path_1.default.extname(datFileName));
    const generatedScreenshotFileName = `${fileDirectoryName}_screenshot_render`;
    const generatedThumbnailFileName = `${fileDirectoryName}_thumbnail_render`;
    // Generate PNG screenshot and Thumbnail image concurrently
    const [pngResult, thumbnailResult] = yield Promise.all([
        (0, generatePngBuffer_1.generatePngBuffer)({ buffer: datFileBuffer }),
        (0, generateThumbnailBuffer_1.generateThumbnailBuffer)({ buffer: datFileBuffer }),
    ]);
    // Upload PNG screenshot and Thumbnail image concurrently
    const [screenshotUrl, thumbnailUrl] = yield Promise.all([
        pngResult.imageCreated
            ? uploadBufferToCloudinary(pngResult.imageBuffer, generatedScreenshotFileName, cloudinaryAssetFolder || 'manic-assets')
            : Promise.resolve(''),
        thumbnailResult.imageCreated
            ? uploadBufferToCloudinary(thumbnailResult.imageBuffer, generatedThumbnailFileName, cloudinaryAssetFolder || 'manic-assets')
            : Promise.resolve(''),
    ]);
    return {
        screenshotUrl,
        thumbnailUrl,
        screenshotExists: !!screenshotUrl,
        thumbnailExists: !!thumbnailUrl,
    };
});
exports.generateAndUploadStream = generateAndUploadStream;
//# sourceMappingURL=generateAndUploadStream.js.map