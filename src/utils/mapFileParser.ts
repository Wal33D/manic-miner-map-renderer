import fs from 'fs';
import iconv from 'iconv-lite';
import chardet from 'chardet';
import { ParsedMapData } from '../types';

export function parseMapDataFromFile({ filePath }: { filePath: string }): Promise<ParsedMapData> {
    return new Promise((resolve, reject) => {
        const encoding = chardet.detectFileSync(filePath) || 'utf8';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Failed to read file', err);
                reject(err);
                return;
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
                    if (currentKey === 'tiles') {
                        parsedData.tilesArray = parsedData.tilesArray.concat(numbers);
                    }
                }
            });

            parsedData.size = parsedData.rowcount * parsedData.colcount;

            resolve(parsedData);
        });
    });
}
