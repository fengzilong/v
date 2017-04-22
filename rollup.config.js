import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default {
	moduleName: 'v',
	entry: './src/index.js',
	format: 'umd',
	dest: 'dist/v.js',
	plugins: [ commonjs(), buble(), uglify() ],
};
