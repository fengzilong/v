const _filters = {};

export const registerFilter = ( name, fn ) => {
	if( typeof fn === 'function' ) {
		_filters[ name ] = fn;
	}
};

export const applyFilter = ( name, str, ...args ) => {
	const f = _filters[ name ];

	if( !f ) {
		return str;
	}

	return f( str, ...args );
};

export default applyFilter;
