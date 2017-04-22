const defaultConfig = {
	openTag: '{{',
	closeTag: '}}',
	escape: true
};

const keys = Object.keys( defaultConfig );

let config = Object.assign( {}, defaultConfig );

export default ( k, v ) => {
	if( typeof v === 'undefined' ) {
		return config[ k ];
	} else {
		if( !~keys.indexOf( k ) ) {
			return;
		}

		config = Object.assign(config, {
			[ k ]: v
		});

		return config;
	}
};
