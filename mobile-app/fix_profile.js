const fs = require('fs');
const file = '/home/akshay/Desktop/Org-safety-app/mobile-app/src/app/(drawer)/profile.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add imports
code = code.replace(
  "  Alert,\n} from 'react-native';",
  "  Alert,\n  KeyboardAvoidingView,\n  Platform,\n} from 'react-native';"
);

// 2. Wrap return (
const searchTarget = "  return (\n    <View className=\"flex-1 bg-slate-50 dark:bg-slate-950\">\n      {/* Tabs Header */}";
const replaceTarget = "  return (\n    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>\n      <View className=\"flex-1 bg-slate-50 dark:bg-slate-950\">\n        {/* Tabs Header */}";
code = code.replace(searchTarget, replaceTarget);

// 3. Wrap end
const endSearch = "      </ActionModal>\n    </View>\n  );\n}";
const endReplace = "      </ActionModal>\n    </View>\n    </KeyboardAvoidingView>\n  );\n}";
code = code.replace(endSearch, endReplace);

fs.writeFileSync(file, code, 'utf8');
console.log('Fixed profile.tsx');
