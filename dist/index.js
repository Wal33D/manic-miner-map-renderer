"use strict";
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
exports.generateMapImage = exports.generateAndUploadStream = exports.generateAndUpload = exports.generateThumbnailBuffer = exports.generateMapImages = exports.generatePngBuffer = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const generatePNGImage_1 = require("./src/functions/generatePNGImage");
var generatePngBuffer_1 = require("./src/functions/generatePngBuffer");
Object.defineProperty(exports, "generatePngBuffer", { enumerable: true, get: function () { return generatePngBuffer_1.generatePngBuffer; } });
var generateMapImages_1 = require("./src/functions/generateMapImages");
Object.defineProperty(exports, "generateMapImages", { enumerable: true, get: function () { return generateMapImages_1.generateMapImages; } });
const generateThumbnailImage_1 = require("./src/functions/generateThumbnailImage");
var generateThumbnailBuffer_1 = require("./src/functions/generateThumbnailBuffer");
Object.defineProperty(exports, "generateThumbnailBuffer", { enumerable: true, get: function () { return generateThumbnailBuffer_1.generateThumbnailBuffer; } });
var generateAndUpload_1 = require("./src/functions/generateAndUpload");
Object.defineProperty(exports, "generateAndUpload", { enumerable: true, get: function () { return generateAndUpload_1.generateAndUpload; } });
var generateAndUploadStream_1 = require("./src/functions/generateAndUploadStream");
Object.defineProperty(exports, "generateAndUploadStream", { enumerable: true, get: function () { return generateAndUploadStream_1.generateAndUploadStream; } });
const findDatFiles = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    const entries = yield promises_1.default.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path_1.default.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...(yield findDatFiles(fullPath)));
        }
        else if (entry.isFile() && entry.name.endsWith('.dat')) {
            results.push(fullPath);
        }
    }
    return results;
});
const processDirectory = (datDirectory, type, progressCallback, screenshotFileName, thumbnailFileName) => __awaiter(void 0, void 0, void 0, function* () {
    const datFiles = yield findDatFiles(datDirectory);
    const totalCount = datFiles.length;
    const results = [];
    let updateNeeded = false;
    let processedCount = 0;
    for (const filePath of datFiles) {
        const fileDirectoryName = path_1.default.basename(path_1.default.dirname(filePath));
        if (type === 'png' || type === 'both') {
            const generatedScreenshotFileName = screenshotFileName || `${fileDirectoryName}_screenshot_render.png`;
            const pngResult = yield (0, generatePNGImage_1.generatePNGImage)({
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
            const thumbnailResult = yield (0, generateThumbnailImage_1.generateThumbnailImage)({
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
});
const generateMapImage = (_a) => __awaiter(void 0, [_a], void 0, function* ({ type, directoryPath, screenshotFileName, thumbnailFileName, progressCallback, }) {
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
        const { updateNeeded, results: processingResults, processedCount, totalCount, } = yield processDirectory(resolvedDirectoryPath, type, progressCallback, screenshotFileName, thumbnailFileName);
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
    }
    catch (error) {
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
});
exports.generateMapImage = generateMapImage;
//# sourceMappingURL=index.js.map