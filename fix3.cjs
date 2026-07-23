const fs = require('fs');
let lines = fs.readFileSync('src/views/taker/MemberRequestPermissionView.vue', 'utf8').split(/\r?\n/);

let badLines = [56, 58, 62, 65]; // 0-indexed for 57, 59, 63, 66

let newLines = lines.filter((_, index) => !badLines.includes(index));

fs.writeFileSync('src/views/taker/MemberRequestPermissionView.vue', newLines.join('\n'), 'utf8');
