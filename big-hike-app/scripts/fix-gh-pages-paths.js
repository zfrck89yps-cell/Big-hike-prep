const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Could not find', distDir);
  process.exit(1);
}

const replacements = [
  // HTML assets (links/scripts) should be relative inside GitHub Pages subpaths
  {regex: /(href|src)=["']\//g, replace: '$1="./'},
  // Expo web assets inside JS bundles
  {regex: /["']\/_expo\//g, replace: '"./_expo/'},
  {regex: /["']\/assets\//g, replace: '"./assets/'},
];

function patchFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = content;

  for (const {regex, replace} of replacements) {
    updated = updated.replace(regex, replace);
  }

  // Ensure the HTML base path is relative, so assets load from the current folder.
  if (filePath.endsWith('index.html') && !updated.includes('<base href="./">')) {
    updated = updated.replace('<head>', '<head>\n    <base href="./">');
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

// Provide a SPA-friendly 404 fallback so client-side routing works on GitHub Pages.
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(notFoundPath, indexHtml, 'utf8');
  console.log('Created 404.html from index.html');
}
