import sharp from 'sharp';
import * as dotenv from 'dotenv';
import { colors } from '../utils/colorMap';
import { parseMapData } from '../utils/mapFileParser';
import { Color, GenerateImageResult } from '../types';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

dotenv.config({ path: '.env.local' });

export const generatePngBuffer = async ({ filePath, buffer }: { filePath?: string; buffer?: Buffer }): Promise<GenerateImageResult> => {
    let parseDataSuccess = false;
    let wallArrayGenerated = false;
    let imageBufferCreated = false;
    let imageCreated = false;
    const errorDetails: GenerateImageResult['errorDetails'] = {};
    let imageBuffer: Buffer | undefined;

    try {
        const parsedData = filePath
            ? await parseMapData({ filePath })
            : buffer
            ? await parseMapData({ buffer })
            : (() => {
                  throw new Error('Either filePath or buffer must be provided');
              })();

        parseDataSuccess = true;
        const wallArray = create2DArray(parsedData.tilesArray, parsedData.colcount);
        wallArrayGenerated = true;
        imageBuffer = await createPNGImageBuffer(wallArray, parsedData.biome);
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
    } catch (error: any) {
        if (!parseDataSuccess) errorDetails.parseError = error.message;
        else if (!wallArrayGenerated) errorDetails.bufferError = error.message;
        else if (!imageBufferCreated) errorDetails.bufferError = error.message;
        else errorDetails.saveError = error.message;

        return {
            status: false,
            parseDataSuccess,
            wallArrayGenerated,
            imageBufferCreated,
            imageCreated,
            errorDetails,
        };
    }
};

const createPNGImageBuffer = async (wallArray: number[][], biome = 'default'): Promise<Buffer> => {
    const scale = 20;
    const height = wallArray.length;
    const width = wallArray[0].length;

    const borderTiles = 2;
    const canvasWidth = (width + borderTiles * 2) * scale;
    const canvasHeight = (height + borderTiles * 2) * scale;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw the border
    ctx.fillStyle = getBiomeColor(biome);
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render the map tiles with the border
    await renderMapTiles(ctx, wallArray, scale, borderTiles);

    const buffer = canvas.toBuffer('image/png');

    // Rotate the image to portrait mode if width is greater than height
    let finalBuffer = buffer;
    if (width > height) {
        finalBuffer = await sharp(buffer)
            .rotate(90)
            .resize(1280, 1280, {
                fit: 'contain',
                background: getBiomeColorObject(biome),
            })
            .toBuffer();
    } else {
        finalBuffer = await sharp(buffer)
            .resize(1280, 1280, {
                fit: 'contain',
                background: getBiomeColorObject(biome),
            })
            .toBuffer();
    }

    return finalBuffer;
};

const getBiomeColor = (biome: string): string => {
    const color = colors[biome.toLowerCase()] || colors.default;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha || 1})`;
};

const getBiomeColorObject = (biome: string) => {
    const color = colors[biome.toLowerCase()] || colors.default;
    return {
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: color.alpha || 1,
    };
};

const renderMapTiles = async (ctx: CanvasRenderingContext2D, wallArray: number[][], scale: number, borderTiles: number) => {
    const patterns: { [key: string]: CanvasPattern } = {};

    for (let y = 0; y < wallArray.length; y++) {
        for (let x = 0; x < wallArray[0].length; x++) {
            const tile = wallArray[y][x];
            const color = colors[tile] || colors.default;

            // Create and cache the pattern if it doesn't exist
            if (!patterns[tile]) {
                patterns[tile] = createTilePattern(scale, color, tile);
            }

            ctx.fillStyle = patterns[tile];
            ctx.fillRect((x + borderTiles) * scale, (y + borderTiles) * scale, scale, scale);
        }
    }
};

const createTilePattern = (scale: number, color: Color, tile: number): CanvasPattern => {
    const fallbackColor: Color = { r: 255, g: 0, b: 0, alpha: 1 };
    const { r = fallbackColor.r, g = fallbackColor.g, b = fallbackColor.b, alpha = fallbackColor.alpha } = color || {};

    const patternCanvas = createCanvas(scale, scale);
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

    return patternCtx.createPattern(patternCanvas, 'repeat')!;
};

const create2DArray = (data: number[], width: number): number[][] => {
    const result: number[][] = [];
    for (let i = 0; i < data.length; i += width) {
        result.push(data.slice(i, i + width));
    }
    return result;
};
