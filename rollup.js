const fs = require('fs');
const rollup = require('rollup');
const uglify = require('uglify-js');

rollup.rollup({
  legacy: true,
  entry: 'src/portal.js',
}).then(function(bundle) {
  let stat;
  const name = 'portal';
  const filename = name + '.js';
  const map = filename + '.map';
  const src = 'dist/' + filename;
  const min = 'dist/' + name + '.min.js';

  try {
    stat = fs.statSync('dist')
  } catch (e) {
    // no such file or directory
  }

  if (!stat) {
    fs.mkdirSync('dist');
  }

  let result = bundle.generate({
    format: 'umd',
    indent: true,
    useStrict: true,
    moduleId: 'portal',
    moduleName: 'Portal'
  });

  fs.writeFileSync(src, result.code);
  console.log(`  Build ${ src } success!`);

  var source = {};

  source[filename] = result.code;

  result = uglify.minify(source, {
    compress: { ie8: true },
    mangle: { ie8: true },
    output: { ie8: true },
    sourceMap: { url: map }
  });

  fs.writeFileSync(min, result.code);
  console.log(`  Build ${ min } success!`);
  fs.writeFileSync(src + '.map', result.map);
  console.log(`  Build ${ src + '.map' } success!`);
}).catch(function(error) {
  console.error(error);
});
