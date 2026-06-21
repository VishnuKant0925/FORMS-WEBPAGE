const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

// Copy templates
const srcTemplates = path.join(__dirname, 'src', 'templates');
const destTemplates = path.join(__dirname, 'dist', 'templates');
console.log(`Copying templates from ${srcTemplates} to ${destTemplates}...`);
copyFolderSync(srcTemplates, destTemplates);

// Copy fonts
const srcFonts = path.join(__dirname, 'src', 'fonts');
const destFonts = path.join(__dirname, 'dist', 'fonts');
console.log(`Copying fonts from ${srcFonts} to ${destFonts}...`);
copyFolderSync(srcFonts, destFonts);

console.log('Assets copied successfully!');
