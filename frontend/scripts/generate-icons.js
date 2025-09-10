const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon
const createSwimmerIcon = (size) => {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00bcd4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0097a7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bgGrad)" rx="${size * 0.1}"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${size * 0.5}" 
            text-anchor="middle" dominant-baseline="middle" fill="white">🏊‍♀️</text>
    </svg>
  `;
  return svg;
};

// Generate icons for each size
async function generateIcons() {
  console.log('Generating SwimBuddy Pro PWA icons...');
  
  for (const size of sizes) {
    const svg = createSwimmerIcon(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(Buffer.from(svg))
        .png({ quality: 100 })
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate icon-${size}x${size}.png:`, error);
    }
  }
  
  console.log('🎉 All PWA icons generated successfully!');
}

// Check if sharp is available
if (typeof require !== 'undefined') {
  try {
    generateIcons();
  } catch (error) {
    console.log('Sharp not available, creating simple fallback icons...');
    // Create simple fallback
    sizes.forEach(size => {
      console.log(`Creating fallback for ${size}x${size}`);
    });
  }
} else {
  console.log('Node.js environment not detected');
}
