const fs = require('fs');
const path = require('path');

const processed = new Set();

function replaceInFile(fp) {
  let c = fs.readFileSync(fp, 'utf8');
  let newC = c;
  
  if (fp.endsWith('.tsx') || fp.endsWith('.ts')) {
    // remove JS comments. Single line // and multi-line /* ... */
    // but keep some that are short. Let's just remove ALL comments except eslint directives
    newC = newC.replace(/\/\*[\s\S]*?\*\//g, (match) => {
        if (match.includes('eslint')) return match;
        // count words
        let words = match.replace(/[\/\*]/g, '').trim().split(/\s+/).filter(Boolean);
        if (words.length <= 3) return match;
        return '';
    });
    newC = newC.replace(/\/\/[^\n]*/g, (match) => {
        if (match.includes('eslint')) return match;
        let words = match.replace(/\/\//g, '').trim().split(/\s+/).filter(Boolean);
        if (words.length <= 3) return match;
        return '';
    });
  } else if (fp.endsWith('.css')) {
    // remove CSS comments
    newC = newC.replace(/\/\*[\s\S]*?\*\//g, (match) => {
        let words = match.replace(/[\/\*]/g, '').trim().split(/\s+/).filter(Boolean);
        if (words.length <= 3) return match;
        return '';
    });
  }
  
  // clean up extra empty lines created by comment removal
  newC = newC.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (newC !== c) {
    fs.writeFileSync(fp, newC, 'utf8');
    processed.add(fp);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) {
      walk(fp);
    } else if (fp.endsWith('.tsx') || fp.endsWith('.ts') || fp.endsWith('.css')) {
      replaceInFile(fp);
    }
  });
}

walk(__dirname);
console.log(`Cleaned comments in ${processed.size} files.`);
