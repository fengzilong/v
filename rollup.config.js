import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default {
	moduleName: 'v',
	entry: './index.js',
	format: 'umd',
	dest: 'dist/v.js',
	// sourceMap: true,
	plugins: [
		commonjs(),
		babel({
			exclude: 'node_modules/**'
		}),
		uglify(),
	]
};
