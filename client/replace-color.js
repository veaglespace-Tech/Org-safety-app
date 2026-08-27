const Jimp = require('jimp');
const path = require('path');

async function processImage() {
  try {
    const inputPath = path.join(__dirname, 'public/images/tich-surksha-woman.jpg');
    const outputPath = path.join(__dirname, 'public/images/tich-surksha-woman-transparent.png'); // Saving as the same name used in the app
    
    console.log(`Reading image from ${inputPath}...`);
    const image = await Jimp.read(inputPath);
    
    console.log("Replacing dark background with pure white...");
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // Target color is approximately #0f172a (15, 23, 42) or similar dark slate/black
      // Let's check distance to this dark color (or just dark colors in general)
      const isDarkSlate = red < 45 && green < 55 && blue < 70;
      
      if (isDarkSlate) {
        // Change to pure white
        this.bitmap.data[idx + 0] = 255;
        this.bitmap.data[idx + 1] = 255;
        this.bitmap.data[idx + 2] = 255;
        this.bitmap.data[idx + 3] = 255; // Fully opaque
      }
    });
    
    console.log(`Writing image to ${outputPath}...`);
    await image.write(outputPath);
    console.log("Image processed! Dark background is now pure white.");
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

processImage();
