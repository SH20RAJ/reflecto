const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const PRIMARY_COLOR = '#7b1fa2'; // Purple from theme

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
    try {
        // Sizes needed for PWA icons
        const sizes = [192, 384, 512];

        for (const size of sizes) {
            console.log(`Generating ${size}x${size} icon...`);

            // Create a simple colored square with text
            const svgIcon = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${PRIMARY_COLOR}"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial" 
          font-size="${size * 0.5}"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          dominant-baseline="middle">R</text>
      </svg>
      `;

            // Convert SVG to PNG with sharp
            await sharp(Buffer.from(svgIcon))
                .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));

            console.log(`Icon saved to ${path.join(OUTPUT_DIR, `icon-${size}x${size}.png`)}`);
        }

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
