const fs = require('fs');
const path = require('path');

const yogaDir = path.join(__dirname, '..', 'assets', 'yoga');
const outputFile = path.join(__dirname, '..', 'src', 'data', 'poseImageMap.ts');

const files = fs.existsSync(yogaDir)
  ? fs.readdirSync(yogaDir).filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file)).sort()
  : [];

const lines = [];
lines.push('const poseImageMap: Record<string, any> = {');
for (const file of files) {
  lines.push(`  ${JSON.stringify(file)}: require('../../assets/yoga/${file}'),`);
}
lines.push('};');
lines.push('');
lines.push('export default poseImageMap;');
lines.push('');

fs.writeFileSync(outputFile, lines.join('\n'));
console.log(`Wrote ${files.length} pose image mappings to ${outputFile}`);
