import { registerFilter } from './lib/filter';
import compile from './lib/compile';
import config from './lib/config';

export default {
	config: config,
	compile,
	registerFilter,
	version: '0.0.0'
};
