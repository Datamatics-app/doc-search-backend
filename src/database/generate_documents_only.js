const fs = require('fs');
const path = require('path');

const DOCUMENTS_DIR = path.resolve(__dirname, '../documents');
const count = parseInt(process.argv[2], 10) || 498;

const pad = (v, len = 4) => String(v).padStart(len, '0');

if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
  console.log(`Created directory: ${DOCUMENTS_DIR}`);
}

console.log(`Generating ${count} dummy .pdf files into ${DOCUMENTS_DIR} ...`);
for (let i = 1; i <= count; i++) {
  const filename = `dummy-doc-${pad(i)}.pdf`;
  const filePath = path.join(DOCUMENTS_DIR, filename);
  const content = `Dummy PDF placeholder file #${i}\nThis is a text placeholder saved with .pdf extension.\n`;
  try {
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (err) {
    console.error(`Failed to write ${filePath}:`, err.message);
    process.exit(1);
  }
  if (i % 100 === 0) process.stdout.write(` ${i}`);
}
console.log('\nDone.');
console.log('Files available in documents/');
