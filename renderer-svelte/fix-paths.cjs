// 由于 svelte-kit 的限制，暂时没找到办法让打包出来的 index.html 中的路径使用相对路径，所以这里需要手动修复

// fix-paths.js
const fs = require('fs')
const path = require('path')

const indexPath = path.resolve(__dirname, '../plugins/renderer/index.html'); // path to the built index.html file

fs.readFile(indexPath, 'utf8', function (err, data) {
  if (err) {
    console.log(err);
    return;
  }

  const result = data.replace(/\/_app/g, './_app'); // replace root-relative paths

  fs.writeFile(indexPath, result, 'utf8', function (err) {
    if (err) console.log(err);
    else console.log('Paths have been updated.');
  });
});