const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Could not find', indexPath);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Convert any absolute root asset references to relative paths so the site can be served from a subpath (e.g. GitHub Pages).
html = html.replace(/(href|src)=["']\//g, '$1="./');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Patched asset paths in', indexPath);
