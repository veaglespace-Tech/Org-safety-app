const { Jimp } = require('jimp');
const path = require('path');

async function removeBackground() {
  try {
    const inputPath = path.join(__dirname, 'public/images/tich-surksha-woman.jpg');
    const outputPath = path.join(__dirname, 'public/images/tich-surksha-woman-transparent.png');
    
    console.log(`Reading image from ${inputPath}...`);
    const image = await Jimp.read(inputPath);
    
    console.log("Processing pixels...");
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      const dr = 255 - red;
      const dg = 255 - green;
      const db = 255 - blue;
      
      const distance = Math.sqrt(dr*dr + dg*dg + db*db);
      
      let alpha = 255;
      
      if (distance < 30) {
        alpha = 0;
      } else if (distance < 150) {
        alpha = ((distance - 30) / (150 - 30)) * 255;
      }
      
      this.bitmap.data[idx + 3] = alpha;
    });
    
    console.log(`Writing image to ${outputPath}...`);
    await image.write(outputPath);
    console.log("Image saved as PNG with transparency!");
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

removeBackground();
