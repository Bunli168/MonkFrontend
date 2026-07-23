const fs = require('fs');
let lines = fs.readFileSync('src/views/taker/MemberRequestPermissionView.vue', 'utf8').split(/\r?\n/);

let newLines = [];
for (let i = 0; i < lines.length; i++) {
    // If this line is exactly "</div>" and the next line is exactly or contains "</template>" (with optional spaces)
    if (lines[i].trim() === '</div>' && i + 1 < lines.length && lines[i + 1].trim() === '</template>') {
        // Skip adding this "</div>"
    } else {
        newLines.push(lines[i]);
    }
}

let content = newLines.join('\n');

// Now add one </div> at the end, right before the LAST </template>
const lastIndex = content.lastIndexOf('</template>');
if (lastIndex !== -1) {
    content = content.slice(0, lastIndex) + '</div>\n' + content.slice(lastIndex);
}

fs.writeFileSync('src/views/taker/MemberRequestPermissionView.vue', content, 'utf8');
