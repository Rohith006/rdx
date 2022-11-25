const fs = require('fs');
const dotEnvExpand = require('dotenv-expand');
dotEnvExpand(require('dotenv').config());
require('babel-register')({
  presets: ['env', 'es2015'],
  plugins: ['transform-object-rest-spread'],
});
require('babel-polyfill');

(function() {
  try {
    const title = process.env.CLIENT_TITLE || '';
    const wlid = process.env.WLID || 0;

    fs.readFile('./dist/index.html', 'utf8', (err, data) => {
      if (err) throw err;
      data = data.replace('Rebid Media', title).replace(/\{WLID}/g, wlid);
      console.log('postbuild');
      fs.copyFileSync(`./assets/logo/wl/${wlid}/logo.png`, `./dist/assets/images/logo.png`);
      fs.copyFileSync(`./assets/logo/wl/${wlid}/icon.png`, `./dist/assets/images/icon.png`);
      fs.copyFileSync(`./assets/help-center/helpcenter.bundle.js`, `./dist/helpcenter.bundle.js`);
      fs.writeFile('./dist/index.html', data, 'utf8', (err) => {
        if (err) throw err;
        console.log('index.html replaced!');
      });
    });
  } catch (e) {
    console.error(e);
  }
}());

