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
exports.generateThumbnailBuffer = void 0;
const sharp_1 = __importDefault(require("sharp"));
const dotenv = __importStar(require("dotenv"));
const colorMap_1 = require("../utils/colorMap");
const mapFileParser_1 = require("../utils/mapFileParser");
const canvas_1 = require("canvas");
dotenv.config({ path: '.env.local' });
const generateThumbnailBuffer = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filePath, buffer }) {
    let status = false;
    let parseDataSuccess = false;
    let wallArrayGenerated = false;
    let imageBufferCreated = false;
    let imageCreated = false;
    const errorDetails = {};
    let imageBuffer;
    try {
        const parsedData = filePath
            ? yield (0, mapFileParser_1.parseMapData)({ filePath })
            : buffer
                ? yield (0, mapFileParser_1.parseMapData)({ buffer })
                : (() => {
                    throw new Error('Either filePath or buffer must be provided');
                })();
        parseDataSuccess = true;
        const wallArray = create2DArray(parsedData.tilesArray, parsedData.colcount);
        wallArrayGenerated = true;
        imageBuffer = yield createThumbnailBuffer(wallArray);
        imageBufferCreated = true;
        imageCreated = true;
        status = true;
    }
    catch (error) {
        if (!parseDataSuccess)
            errorDetails.parseError = error.message;
        else if (!wallArrayGenerated)
            errorDetails.bufferError = error.message;
        else if (!imageBufferCreated)
            errorDetails.bufferError = error.message;
        else
            errorDetails.saveError = error.message;
    }
    return {
        status,
        parseDataSuccess,
        wallArrayGenerated,
        imageBuffer,
        imageBufferCreated,
        imageCreated,
        errorDetails,
    };
});
exports.generateThumbnailBuffer = generateThumbnailBuffer;
const createThumbnailBuffer = (wallArray) => __awaiter(void 0, void 0, void 0, function* () {
    const scale = 10;
    const height = wallArray.length;
    const width = wallArray[0].length;
    const canvas = (0, canvas_1.createCanvas)(width * scale, height * scale);
    const ctx = canvas.getContext('2d');
    yield renderThumbnailTiles(ctx, wallArray, scale);
    const buffer = canvas.toBuffer('image/png');
    // Rotate the image to portrait mode if width is greater than height
    let finalBuffer = buffer;
    if (width > height) {
        finalBuffer = yield (0, sharp_1.default)(buffer)
            .rotate(90)
            .resize(320, 320, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
            .toBuffer();
    }
    else {
        finalBuffer = yield (0, sharp_1.default)(buffer)
            .resize(320, 320, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
            .toBuffer();
    }
    return finalBuffer;
});
const renderThumbnailTiles = (ctx, wallArray, scale) => __awaiter(void 0, void 0, void 0, function* () {
    for (let y = 0; y < wallArray.length; y++) {
        for (let x = 0; x < wallArray[0].length; x++) {
            const tile = wallArray[y][x];
            const color = colorMap_1.colors[tile] || { r: 255, g: 255, b: 255, a: 1 };
            drawThumbnailTile(ctx, x, y, scale, color);
        }
    }
});
const drawThumbnailTile = (ctx, x, y, scale, color) => {
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.fillRect(x * scale, y * scale, scale, scale);
};
const create2DArray = (data, width) => {
    const result = [];
    for (let i = 0; i < data.length; i += width) {
        result.push(data.slice(i, i + width));
    }
    return result;
};
//# sourceMappingURL=generateThumbnailBuffer.js.map