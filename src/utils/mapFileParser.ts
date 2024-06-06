import fs from 'fs';
import iconv from 'iconv-lite';
import chardet from 'chardet';
import { ParseMapDataParams, ParsedMapData } from '../types';

export function parseMapData({ filePath, buffer }: ParseMapDataParams): Promise<ParsedMapData> {
    return new Promise(async (resolve, reject) => {
        try {
            let data: Buffer;
            let encoding: string;

            if (filePath) {
                encoding = chardet.detectFileSync(filePath) || 'utf8';
                data = await fs.promises.readFile(filePath);
            } else if (buffer) {
                encoding = chardet.detect(buffer) || 'utf8';
                data = buffer;
            } else {
                throw new Error('Either filePath or buffer must be provided');
            }

            const levelFileData = iconv.decode(data, encoding);

            const parsedData: ParsedMapData = {
                rowcount: 0,
                colcount: 0,
                tilesArray: [],
                biome: '',
                size: 0,
            };

            const lines = levelFileData
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            let currentKey = '';

            lines.forEach(line => {
                if (line.endsWith('{')) {
                    currentKey = line.replace('{', '').trim();
                } else if (line.startsWith('}')) {
                    currentKey = '';
                } else if (currentKey === 'info') {
                    const keyValue = line.split(':');
                    const key = keyValue[0].trim().toLowerCase();
                    const value = keyValue[1].trim();
                    if (key === 'rowcount' || key === 'colcount') {
                        parsedData[key] = parseInt(value, 10);
                    } else if (key === 'biome') {
                        parsedData[key] = value;
                    }
                } else if (currentKey === 'tiles') {
                    const numbers = line
                        .split(',')
                        .filter(n => n.trim() !== '')
                        .map(n => parseInt(n, 10))
                        .filter(n => !isNaN(n));
                    parsedData.tilesArray = parsedData.tilesArray.concat(numbers);
                }
            });

            parsedData.size = parsedData.rowcount * parsedData.colcount;

            resolve(parsedData);
        } catch (err) {
            console.error('Failed to read file or buffer', err);
            reject(err);
        }
    });
}
