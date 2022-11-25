const dotEnvExpand = require('dotenv-expand');

dotEnvExpand(require('dotenv').config());

require('babel-register')({
  presets: ['env', 'es2015'],
  plugins: ['transform-object-rest-spread'],
});
require('babel-polyfill');

module.exports = require('./uploadRemoteSspStat');
