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
exports.generatePngBuffer = void 0;
const sharp_1 = __importDefault(require("sharp"));
const dotenv = __importStar(require("dotenv"));
const colorMap_1 = require("../utils/colorMap");
const mapFileParser_1 = require("../utils/mapFileParser");
const canvas_1 = require("canvas");
dotenv.config({ path: '.env.local' });
const generatePngBuffer = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filePath, buffer }) {
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
        imageBuffer = yield createPNGImageBuffer(wallArray, parsedData.biome);
        imageBufferCreated = true;
        imageCreated = true;
        return {
            status: true,
            parseDataSuccess,
            wallArrayGenerated,
            imageBufferCreated,
            imageCreated,
            imageBuffer,
        };
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
        return {
            status: false,
            parseDataSuccess,
            wallArrayGenerated,
            imageBufferCreated,
            imageCreated,
            errorDetails,
        };
    }
});
exports.generatePngBuffer = generatePngBuffer;
const createPNGImageBuffer = (wallArray_1, ...args_1) => __awaiter(void 0, [wallArray_1, ...args_1], void 0, function* (wallArray, biome = 'default') {
    const scale = 20;
    const height = wallArray.length;
    const width = wallArray[0].length;
    const borderTiles = 2;
    const canvasWidth = (width + borderTiles * 2) * scale;
    const canvasHeight = (height + borderTiles * 2) * scale;
    const canvas = (0, canvas_1.createCanvas)(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    // Draw the border
    ctx.fillStyle = getBiomeColor(biome);
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // Render the map tiles with the border
    yield renderMapTiles(ctx, wallArray, scale, borderTiles);
    const buffer = canvas.toBuffer('image/png');
    // Rotate the image to portrait mode if width is greater than height
    let finalBuffer = buffer;
    if (width > height) {
        finalBuffer = yield (0, sharp_1.default)(buffer)
            .rotate(90)
            .resize(1280, 1280, {
            fit: 'contain',
            background: getBiomeColorObject(biome),
        })
            .toBuffer();
    }
    else {
        finalBuffer = yield (0, sharp_1.default)(buffer)
            .resize(1280, 1280, {
            fit: 'contain',
            background: getBiomeColorObject(biome),
        })
            .toBuffer();
    }
    return finalBuffer;
});
const getBiomeColor = (biome) => {
    const color = colorMap_1.colors[biome.toLowerCase()] || colorMap_1.colors.default;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha || 1})`;
};
const getBiomeColorObject = (biome) => {
    const color = colorMap_1.colors[biome.toLowerCase()] || colorMap_1.colors.default;
    return {
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: color.alpha || 1,
    };
};
const renderMapTiles = (ctx, wallArray, scale, borderTiles) => __awaiter(void 0, void 0, void 0, function* () {
    const patterns = {};
    for (let y = 0; y < wallArray.length; y++) {
        for (let x = 0; x < wallArray[0].length; x++) {
            const tile = wallArray[y][x];
            const color = colorMap_1.colors[tile] || colorMap_1.colors.default;
            // Create and cache the pattern if it doesn't exist
            if (!patterns[tile]) {
                patterns[tile] = createTilePattern(scale, color, tile);
            }
            ctx.fillStyle = patterns[tile];
            ctx.fillRect((x + borderTiles) * scale, (y + borderTiles) * scale, scale, scale);
        }
    }
});
const createTilePattern = (scale, color, tile) => {
    const fallbackColor = { r: 255, g: 0, b: 0, alpha: 1 };
    const { r = fallbackColor.r, g = fallbackColor.g, b = fallbackColor.b, alpha = fallbackColor.alpha } = color || {};
    const patternCanvas = (0, canvas_1.createCanvas)(scale, scale);
    const patternCtx = patternCanvas.getContext('2d');
    const tileGradient = patternCtx.createLinearGradient(0, 0, scale, scale);
    tileGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    tileGradient.addColorStop(1, `rgba(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)}, ${alpha})`);
    patternCtx.fillStyle = tileGradient;
    patternCtx.fillRect(0, 0, scale, scale);
    patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    patternCtx.lineWidth = 1;
    for (let k = 0; k < scale; k += 5) {
        patternCtx.beginPath();
        patternCtx.moveTo(k, 0);
        patternCtx.lineTo(0, k);
        patternCtx.moveTo(scale, k);
        patternCtx.lineTo(k, scale);
        patternCtx.moveTo(k, scale);
        patternCtx.lineTo(scale, k);
        patternCtx.stroke();
    }
    return patternCtx.createPattern(patternCanvas, 'repeat');
};
const create2DArray = (data, width) => {
    const result = [];
    for (let i = 0; i < data.length; i += width) {
        result.push(data.slice(i, i + width));
    }
    return result;
};
//# sourceMappingURL=generatePngBuffer.js.map