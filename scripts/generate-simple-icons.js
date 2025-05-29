const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to generate a simple icon with text
function generateSimpleIcon(size, text) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#7b1fa2');  // Primary purple color from manifest.json theme_color
    gradient.addColorStop(1, '#4a148c');  // Darker purple
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add text
    const fontSize = size * 0.5;  // Font size relative to icon size
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, size / 2, size / 2);

    return canvas.toBuffer('image/png');
}

async function generateIcons() {
    try {
        const sizes = [192, 384, 512];

        for (const size of sizes) {
            console.log(`Generating ${size}x${size} icon...`);

            // Generate a simple icon with the letter 'R' for Reflecto
            const buffer = generateSimpleIcon(size, 'R');

            // Save as PNG
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
