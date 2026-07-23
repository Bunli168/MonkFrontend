const fs = require('fs');
let content = fs.readFileSync('src/views/taker/MemberRequestPermissionView.vue', 'utf8');

// The bad sed command inserted "</div>\n" right before every "</template>"
// It replaced "</template>" with "</div>\n</template>"

// Remove all occurrences of "</div>\n</template>"
content = content.replace(/<\/div>\n\s*<\/template>/g, '</template>');

// And add ONE </div> at the very end before the LAST </template>
const lastIndex = content.lastIndexOf('</template>');
if (lastIndex !== -1) {
    content = content.slice(0, lastIndex) + '</div>\n' + content.slice(lastIndex);
}

fs.writeFileSync('src/views/taker/MemberRequestPermissionView.vue', content, 'utf8');
