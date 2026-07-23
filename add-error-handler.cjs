const fs = require('fs');
const path = require('path');
const mainPath = path.join('/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/main.js');
let content = fs.readFileSync(mainPath, 'utf8');

if (!content.includes('app.config.errorHandler')) {
  const handlerCode = `
app.config.errorHandler = (err, instance, info) => {
    console.error(err, info);
    document.body.innerHTML = '<div style="color:red;padding:20px;z-index:9999;position:fixed;top:0;left:0;background:white;"><h1>Vue Error</h1><p>' + err.message + '</p><pre>' + err.stack + '</pre><p>Info: ' + info + '</p></div>';
};
`;
  content = content.replace('const app = createApp(App);', 'const app = createApp(App);' + handlerCode);
  fs.writeFileSync(mainPath, content, 'utf8');
}
