const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /@\/components\/CountryPhoneField/g, replace: "@/components/ui/CountryPhoneField" },
  { search: /@\/components\/GlobalErrorToast/g, replace: "@/components/ui/GlobalErrorToast" },
  { search: /@\/components\/PasswordInput/g, replace: "@/components/ui/PasswordInput" },
  { search: /@\/components\/SectionEyebrow/g, replace: "@/components/ui/SectionEyebrow" },
  { search: /@\/components\/UserAvatar/g, replace: "@/components/ui/UserAvatar" },
  { search: /@\/components\/SessionSync/g, replace: "@/components/providers/SessionSync" },
  { search: /@\/components\/StoreProvider/g, replace: "@/components/providers/StoreProvider" },
  { search: /@\/components\/ThemeProvider/g, replace: "@/components/providers/ThemeProvider" },
  { search: /@\/components\/TichSurkshaPage/g, replace: "@/components/tich-surksha/TichSurkshaPage" },
  { search: /@\/components\/TichSurkshaDrawer/g, replace: "@/components/tich-surksha/TichSurkshaDrawer" },
  { search: /@\/components\/AttyWidget/g, replace: "@/components/widgets/AttyWidget" }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walkDir(file));
      }
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'client'));
let updatedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(r => {
    content = content.replace(r.search, r.replace);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated imports in', file);
    updatedFiles++;
  }
});

console.log(`Finished updating imports in ${updatedFiles} files.`);
