const fs = require('fs');
const file = '/home/akshay/Desktop/Org-safety-app/mobile-app/src/app/_layout.tsx';
let code = fs.readFileSync(file, 'utf8');

const importReanimated = "import { ReanimatedLogLevel, configureReanimatedLogger } from 'react-native-reanimated';\n\nconfigureReanimatedLogger({\n  level: ReanimatedLogLevel.warn,\n  strict: false,\n});\n";

if (!code.includes('configureReanimatedLogger')) {
  code = code.replace("import { View, LogBox } from 'react-native';", "import { View, LogBox } from 'react-native';\n" + importReanimated);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Added configureReanimatedLogger');
} else {
  console.log('Already added');
}
