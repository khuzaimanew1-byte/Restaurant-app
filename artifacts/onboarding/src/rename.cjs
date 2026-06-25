const fs = require('fs');
const path = require('path');

const classes = fs.readFileSync('classes_long.txt', 'utf8').split('\n').map(l => l.trim()).filter(Boolean);

const shorten = (cls) => {
    // some manual overrides to ensure uniqueness and readability
    if (cls === 'adm-card-absent') return 'ad-cab';
    if (cls === 'adm-card-editing') return 'ad-ced';
    if (cls === 'adm-card-info') return 'ad-cin';
    if (cls === 'adm-card-left') return 'ad-clf';
    if (cls === 'adm-card-right') return 'ad-crt';
    if (cls === 'adm-desktop-stats') return 'ad-dks';
    if (cls === 'adm-mobile-stats') return 'ad-mbs';
    if (cls.startsWith('adm-')) {
        let suffix = cls.slice(4).replace(/-/g, '').replace(/_/g, '');
        return ('ad-' + suffix).substring(0, 6);
    }
    if (cls.startsWith('ae-')) {
        let suffix = cls.slice(3).replace(/-/g, '').replace(/_/g, '');
        return ('ae-' + suffix).substring(0, 6);
    }
    if (cls.startsWith('login__')) {
        let suffix = cls.slice(7).replace(/-/g, '').replace(/_/g, '');
        return ('lg-' + suffix).substring(0, 6);
    }
    if (cls.startsWith('otp-')) {
        let suffix = cls.slice(4).replace(/-/g, '').replace(/_/g, '');
        return ('o-' + suffix).substring(0, 6);
    }
    
    // Generic fallback
    let p = cls.split(/[-_]+/).filter(Boolean);
    if (p.length === 1) return p[0].substring(0, 6);
    let out = p[0].substring(0, 2) + '-' + p.slice(1).map(x => x[0]).join('');
    return out.substring(0, 6).toLowerCase();
};

const map = {};
let seen = new Set();
for (let c of classes) {
    let sh = shorten(c);
    // resolve collisions by adding numbers
    if (seen.has(sh)) {
        let i = 1;
        while(seen.has(sh.substring(0, 5) + i)) i++;
        sh = sh.substring(0, 5) + i;
    }
    seen.add(sh);
    map[c] = sh;
}

// Ensure length <= 6
for (let k in map) {
    if (map[k].length > 6) {
        console.log("WARN too long", map[k]);
    }
}

// now recursively replace in all tsx, css files
function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fp = path.join(dir, file);
        if (fs.statSync(fp).isDirectory()) {
            walk(fp);
        } else if (fp.endsWith('.tsx') || fp.endsWith('.ts') || fp.endsWith('.css')) {
            let content = fs.readFileSync(fp, 'utf8');
            let newContent = content;
            
            // replace class names
            // For CSS: \.classname(?=[^a-zA-Z0-9_-])
            // For TSX: \bclassname\b or "classname" or 'classname'
            
            // Sort keys by length descending to avoid partial replacements
            let keys = Object.keys(map).sort((a,b) => b.length - a.length);
            
            for (let k of keys) {
                let v = map[k];
                // In CSS files, we want to replace .className
                // In TSX files, we want to replace className string
                // We use a regex with word boundaries. Wait, word boundaries \b doesn't work for hyphen.
                // We can use RegExp(`(?<![a-zA-Z0-9_-])` + k + `(?![a-zA-Z0-9_-])`, 'g')
                let re = new RegExp(`(?<![a-zA-Z0-9_-])` + k + `(?![a-zA-Z0-9_-])`, 'g');
                newContent = newContent.replace(re, v);
            }
            
            if (newContent !== content) {
                fs.writeFileSync(fp, newContent, 'utf8');
                console.log("Updated", fp);
            }
        }
    });
}

walk(__dirname);
console.log("Done renaming classes");
