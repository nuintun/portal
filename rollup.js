/**
 * @module rollup
 * @license MIT
 * @version 2017/12/18
 */

const fs = require('fs');
const rollup = require('rollup');
const uglify = require('uglify-es');
const pkg = require('./package.json');

const banner = `/**
* @module ${pkg.name}
* @author ${pkg.author.name}
* @license ${pkg.license}
* @version ${pkg.version}
* @description ${pkg.description}
* @see ${pkg.homepage}
*/
`;

rollup
  .rollup({
    input: 'src/portal.js'
  })
  .then(function(bundle) {
    let stat;
    const name = 'portal';
    const filename = name + '.js';
    const map = filename + '.map';
    const src = 'dist/' + filename;
    const min = 'dist/' + name + '.min.js';

    try {
      stat = fs.statSync('dist');
    } catch (e) {
      // No such file or directory
    }

    if (!stat) {
      fs.mkdirSync('dist');
    }

    bundle
      .generate({
        format: 'umd',
        indent: true,
        strict: true,
        banner: banner,
        amd: { id: 'portal' },
        name: 'Portal'
      })
      .then(function(result) {
        fs.writeFileSync(src, result.code);
        console.log(`  Build ${src} success!`);

        var source = {};

        source[filename] = result.code;

        result = uglify.minify(source, {
          ecma: 5,
          ie8: true,
          mangle: { eval: true },
          sourceMap: { url: map }
        });

        fs.writeFileSync(min, result.code);
        console.log(`  Build ${min} success!`);
        fs.writeFileSync(src + '.map', result.map);
        console.log(`  Build ${src + '.map'} success!`);
      })
      .catch(function(error) {
        console.error(error);
      });
  })
  .catch(function(error) {
    console.error(error);
  });
