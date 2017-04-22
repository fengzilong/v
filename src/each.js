const hasOwn = Object.prototype.hasOwnProperty;

export default ( items, fn ) => {
	if( Array.isArray( items ) ) {
		for( let i = 0, len = items.length; i < len; i++ ) {
			fn( items[ i ], i, items );
		}
	// TODO: isPlainObject
	} else if( typeof items === 'object' ) {
		for( const i in items ) {
			if( hasOwn.call( items, i ) ) {
				fn( items[ i ], i, items );
			}
		}
	}
};
