const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Could not find', distDir);
  process.exit(1);
}

const replacements = [
  // HTML assets
  {regex: /(href|src)=["']\//g, replace: '$1="./'},
  // Expo web assets in JS bundles
  {regex: /["']\/_expo\//g, replace: '"./_expo/'},
  {regex: /["']\/assets\//g, replace: '"./assets/'},
];

function patchFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = content;

  for (const {regex, replace} of replacements) {
    updated = updated.replace(regex, replace);
  }

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Patched asset paths in', filePath);
  }
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath);
      continue;
    }

    if (/\.(html|js|css|json)$/.test(entry.name)) {
      patchFile(fullPath);
    }
  }
}

walkDir(distDir);
