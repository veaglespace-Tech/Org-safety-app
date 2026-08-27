const Jimp = require('jimp');
const path = require('path');

async function processImage() {
  try {
    const inputPath = path.join(__dirname, 'public/images/tich-surksha-woman.jpg');
    const outputPath = path.join(__dirname, 'public/images/tich-surksha-woman-transparent.png');
    
    console.log(`Reading image from ${inputPath}...`);
    const image = await Jimp.read(inputPath);
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Get background color from top-left pixel
    const bgIdx = image.getPixelIndex(0, 0);
    const bgR = image.bitmap.data[bgIdx];
    const bgG = image.bitmap.data[bgIdx + 1];
    const bgB = image.bitmap.data[bgIdx + 2];
    
    console.log(`Detected background color: RGB(${bgR}, ${bgG}, ${bgB})`);
    
    // Flood fill queue
    const queue = [[0, 0]];
    const visited = new Uint8Array(width * height);
    
    const tolerance = 40; // Tolerance for color matching
    
    function isMatch(r, g, b) {
      return Math.abs(r - bgR) < tolerance && 
             Math.abs(g - bgG) < tolerance && 
             Math.abs(b - bgB) < tolerance;
    }
    
    console.log("Flood filling background...");
    
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const idx1D = y * width + x;
      if (visited[idx1D]) continue;
      
      visited[idx1D] = 1;
      
      const pxIdx = image.getPixelIndex(x, y);
      const r = image.bitmap.data[pxIdx];
      const g = image.bitmap.data[pxIdx + 1];
      const b = image.bitmap.data[pxIdx + 2];
      
      if (isMatch(r, g, b)) {
        // Change to pure white
        image.bitmap.data[pxIdx] = 255;
        image.bitmap.data[pxIdx + 1] = 255;
        image.bitmap.data[pxIdx + 2] = 255;
        image.bitmap.data[pxIdx + 3] = 255;
        
        // Add neighbors
        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }
    
    console.log(`Writing image to ${outputPath}...`);
    await image.writeAsync(outputPath);
    console.log("Image processed! Background is now pure white and character is intact.");
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

processImage();
