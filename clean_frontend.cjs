const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
    if (!filePath.endsWith('.vue') && !filePath.endsWith('.js')) return;
    if (filePath.includes('router/index.js') || filePath.includes('stores/auth.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace logic
    let original = content;
    
    content = content.replace(/authStore\.isAdmin\s*\|\|\s*authStore\.isSuperAdmin/g, "authStore.isAdmin");
    content = content.replace(/authStore\.isSuperAdmin\s*\|\|\s*authStore\.isAdmin/g, "authStore.isAdmin");
    content = content.replace(/!authStore\.isAdmin\s*&&\s*!authStore\.isSuperAdmin/g, "!authStore.isAdmin");
    content = content.replace(/!authStore\.isSuperAdmin\s*&&\s*!authStore\.isAdmin/g, "!authStore.isAdmin");
    
    content = content.replace(/authStore\.isSuperAdmin\s*\|\|/g, "");
    content = content.replace(/\|\|\s*authStore\.isSuperAdmin/g, "");
    
    content = content.replace(/authStore\.isSuperAdmin/g, "false");

    // Fix up any `v-if="false && ` or similar if they occur, though `false` is fine.
    
    if (original !== content) {
        fs.writeFileSync(filePath, content);
        console.log('Updated', filePath);
    }
});
