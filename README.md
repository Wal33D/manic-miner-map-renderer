# Manic Miners Map Renderer

## Description

Manic Miners Map Renderer is a tool designed to generate PNG images of 2D map tiles with a brushstroke effect for the game Manic Miners. This tool converts tile arrays into visually appealing images with custom biome colors and patterns, and includes functionalities for generating thumbnails as well.

## Features

-   Converts 2D tile arrays into PNG images.
-   Generates both full-sized screenshots and thumbnails.
-   Processes entire directories of map files.

## Installation

To install the dependencies, run:

```bash
npm install
```

## Usage

### Generating a PNG Image

To generate a PNG image from a map file:

```typescript
import { generatePNGImage } from 'manic-miners-map-renderer';

const result = await generatePNGImage({
    filePath: 'path/to/mapfile.dat',
    outputFileName: 'output_image.png',
});
```

### Generating Map Images for an Entire Directory

To generate images for all map files in a directory:

```typescript
import { generateMapImage } from 'manic-miners-map-renderer';

const result = await generateMapImage({
    type: 'both', // 'png', 'thumbnail', or 'both'
    directoryPath: 'path/to/map/files',
    progressCallback: progress => {
        console.log(`Processed ${progress.processedCount} of ${progress.totalCount}`);
    },
});
```

## Configuration

Ensure you have a `.env.local` file with the following configuration:

```plaintext
MMT_CATALOG_DIR=path/to/your/map/files
```

## Scripts

-   `resetdist`: Removes the `dist` directory.
-   `build`: Compiles the TypeScript code.
-   `start`: Compiles the TypeScript code and starts the application.

## Dependencies

-   `canvas`: Used for rendering the map tiles.
-   `chardet`: For detecting the character encoding of map files.
-   `dotenv`: For loading environment variables.
-   `sharp`: For image processing.

## Dev Dependencies

-   `@types/chardet`: Type definitions for `chardet`.
-   `@types/dotenv`: Type definitions for `dotenv`.
-   `@types/node`: Type definitions for Node.js.

## Author

Waleed Judah

## License

MIT
