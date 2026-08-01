const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  console.log("Running build...");
  execSync('npm run build', { stdio: 'pipe' });
  console.log("Build succeeded!");
} catch (error) {
  const output = error.message + '\n' + (error.stdout ? error.stdout.toString() : '') + '\n' + (error.stderr ? error.stderr.toString() : '');
  
  const regex = /Can't resolve '@\/components\/([^']+)'/g;
  let match;
  const missing = new Set();
  while ((match = regex.exec(output)) !== null) {
    missing.add(match[1]);
  }
  
  console.log("Missing components found:", Array.from(missing).length);
  
  missing.forEach(comp => {
    const filePath = path.join('./components', comp + '.js');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (!fs.existsSync(filePath)) {
      const componentName = path.basename(comp);
      fs.writeFileSync(filePath, `export default function ${componentName}() { return null; }\n`);
      console.log(`Created ${filePath}`);
    }
  });
}
