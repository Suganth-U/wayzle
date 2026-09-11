const fs = require('fs');
const files = [
  'node_modules/react-native-web/dist/index.js',
  'node_modules/react-native-web/dist/cjs/index.js'
];
files.forEach(file => {
  try {
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('codegenNativeComponent')) {
      if (file.includes('cjs')) {
        fs.appendFileSync(file, '\nexports.codegenNativeComponent = function(name) { return name; };\nexports.codegenNativeCommands = function(options) { return {}; };\n');
      } else {
        fs.appendFileSync(file, '\nexport const codegenNativeComponent = function(name) { return name; };\nexport const codegenNativeCommands = function(options) { return {}; };\n');
      }
      console.log('Patched', file);
    } else {
      console.log('Already patched', file);
    }
  } catch (e) {
    console.log('Error', file, e);
  }
});
