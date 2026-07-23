const fs = require('fs');
const file = 'src/views/auth/SelfRegisterView.vue';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let newLines = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '</div>') {
        // If the next line is </template> AND we are not at the very end
        if (i + 1 < lines.length && lines[i + 1].trim() === '</template>') {
            // Check if this is the last </template> in the file
            let isLastTemplate = true;
            for (let j = i + 2; j < lines.length; j++) {
                if (lines[j].trim() === '</template>') {
                    isLastTemplate = false;
                    break;
                }
            }
            if (!isLastTemplate) {
                // Skip adding this </div>
                continue;
            }
        }
    }
    newLines.push(lines[i]);
}

fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log('Fixed SelfRegisterView');
