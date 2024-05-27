"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMapDataFromFile = void 0;
const fs_1 = __importDefault(require("fs"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const chardet_1 = __importDefault(require("chardet"));
function parseMapDataFromFile({ filePath }) {
    return new Promise((resolve, reject) => {
        const encoding = chardet_1.default.detectFileSync(filePath) || 'utf8';
        fs_1.default.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Failed to read file', err);
                reject(err);
                return;
            }
            const levelFileData = iconv_lite_1.default.decode(data, encoding);
            const parsedData = {
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
                }
                else if (line.startsWith('}')) {
                    currentKey = '';
                }
                else if (currentKey === 'info') {
                    const keyValue = line.split(':');
                    const key = keyValue[0].trim().toLowerCase();
                    const value = keyValue[1].trim();
                    if (key === 'rowcount' || key === 'colcount') {
                        parsedData[key] = parseInt(value, 10);
                    }
                    else if (key === 'biome') {
                        parsedData[key] = value;
                    }
                }
                else if (currentKey === 'tiles') {
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
exports.parseMapDataFromFile = parseMapDataFromFile;
//# sourceMappingURL=mapFileParser.js.map