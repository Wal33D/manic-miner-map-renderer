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
exports.parseMapData = void 0;
const fs_1 = __importDefault(require("fs"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const chardet_1 = __importDefault(require("chardet"));
function parseMapData({ filePath, buffer }) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let data;
            let encoding;
            if (filePath) {
                encoding = chardet_1.default.detectFileSync(filePath) || 'utf8';
                data = yield fs_1.default.promises.readFile(filePath);
            }
            else if (buffer) {
                encoding = chardet_1.default.detect(buffer) || 'utf8';
                data = buffer;
            }
            else {
                throw new Error('Either filePath or buffer must be provided');
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
                    parsedData.tilesArray = parsedData.tilesArray.concat(numbers);
                }
            });
            parsedData.size = parsedData.rowcount * parsedData.colcount;
            resolve(parsedData);
        }
        catch (err) {
            console.error('Failed to read file or buffer', err);
            reject(err);
        }
    }));
}
exports.parseMapData = parseMapData;
//# sourceMappingURL=mapFileParser.js.map