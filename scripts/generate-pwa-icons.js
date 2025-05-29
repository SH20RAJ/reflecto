const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const LOGO_PATH = path.join(__dirname, '../public/reflecto-logo.svg');

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
    try {
        console.log('Loading source image...');
        const image = await loadImage(LOGO_PATH);

        const sizes = [192, 384, 512];

        for (const size of sizes) {
            console.log(`Generating ${size}x${size} icon...`);

            // Create canvas with desired size
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');

            // Fill background with a color that matches your app's theme
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);

            // Calculate dimensions to maintain aspect ratio
            const scale = Math.min(size / image.width, size / image.height) * 0.8;
            const width = image.width * scale;
            const height = image.height * scale;

            // Center the image
            const x = (size - width) / 2;
            const y = (size - height) / 2;

            // Draw the image
            ctx.drawImage(image, x, y, width, height);

            // Save as PNG
            const buffer = canvas.toBuffer('image/png');
            const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
            fs.writeFileSync(outputPath, buffer);

            console.log(`Icon saved to ${outputPath}`);
        }

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
