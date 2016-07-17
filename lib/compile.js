import escape from './escape';
import filter from './filter';
import each from './each';
import config from './config';

const util = { escape, filter, each };

export default template => {
	const OPEN_TAG = config( 'openTag' );
	const CLOSE_TAG = config( 'closeTag' );
	const ESCAPE = config( 'escape' );

	let output = [];
	let counter = 1;

	let pieces = template
		.replace( /\s+/g, ' ' )
		.split( new RegExp( `(${OPEN_TAG}|${CLOSE_TAG})`, 'g' ) );

	let html = [];
	let code = [];
	let all = [];

	let logic = false;
	pieces.forEach(( v, i ) => {
		let tmp;
		switch( v ) {
			case OPEN_TAG:
				logic = true;
				break;
			case CLOSE_TAG:
				logic = false;
				break;
			default:
				tmp = {
					content: v,
					position: i
				};

				// all是按片段顺序来的，最后拼装使用all
				// code负责提供必要的信息
				all.push({
					content: v,
					position: i,
					type: logic ? 'code' : 'html',
					refer: tmp
				});

				if( logic ) {
					code.push( tmp );
				} else {
					html.push( tmp );
				}
		}
	});

	// parse code

	code.forEach(( v, i ) => {
		let parts = v.content.split( ' ' );
		let first = parts[ 0 ];

		if( first === 'if' || first === 'each' ) {
			// 从末尾开始向前查找，查找到当前元素的下一个为止
			for( let j = code.length - 1; j > i; j-- ) {
				if( !code[ j ].binded && new RegExp( '^/' + first ).test( code[ j ].content ) ) {
					// set current status to binded
					code[ j ].binded = true;
					v.bind = code[ j ].position;
					break;
				}
			}
		}
	});

	// find else belong
	code.forEach(( v, i ) => {
		let parts = v.content.split( ' ' );
		let first = parts[ 0 ];

		if( first === 'else' ) {
			// 向前查找，查到第一个为止
			for( let j = i - 1; j >= 0; j-- ) {
				if(
					code[ j ].bind && // 存在bind
					( code[ j ].bind > v.position ) && // 绑定的结尾符在当前else之后，即包裹当前else
					/^if\s+/.test( code[ j ].content ) // if
				) {
					v.belong = code[ j ].position;
					break;
				}
			}
		}
	});

	const makeExprWithData = function( expr, suffix ) {
		// throw `x is undefined` error
		return `
			${ suffix ? 'var $e' + suffix + ';': '' }
			with( $data ) {
				$e${suffix || ''} = ${expr};
			}
		`;
	};

	const parseEach = expr => {
		let parts = expr.split( ' as ' );
		if( parts.length === 2 ) {
			let tmp = parts[ 1 ].split( ',' );
			let i = tmp[ 1 ] || '$i';
			let v = tmp[ 0 ] || '$v';
			return {
				items: parts[ 0 ],
				v: v,
				i: i
			};
		}
	};

	const joinEachExpr = ( items, i ) => {
		return `var ${i} = 0, len = ${items}.length; ${i} < len; ${i}++`;
	}

	output.push( 'var $o = "";' );
	output.push( 'var $util = this;' );
	output.push( 'var $escape = $util.escape;' );
	output.push( 'var $filter = $util.filter;' );
	output.push( 'var $each = $util.each;' );

	all.forEach(v => {
		if( v.type === 'html' ) {
			output.push( '$o += "' + v.content + '";' );
		} else if( v.type === 'code' ) {
			let content = v.content.trim();
			let parts = content.split( ' ' );
			let first = parts[ 0 ];
			let rest = parts.slice( 1 );

			if( first === 'if' ) {
				v.declare = [];
				v.declare.push( makeExprWithData( rest.join( ' ' ), counter ) );
				output.push( v.declare );
				output.push( `if( $e${counter} ) {` );
				counter++;
			} else if( first === 'else' ) {
				let matched;
				if( rest[ 0 ] === 'if' ) {
					// move declaration to the top of matched `if`
					all.forEach(v2 => {
						if( v2.position === v.refer.belong ) {
							matched = v2;
							return false;
						}
					});
					matched.declare.push( makeExprWithData( rest.splice( 1 ).join( ' ' ), counter ) );
					output.push( `} else if( $e${counter} ) {` );
					counter++;
				} else {
					output.push( '} else {' );
				}
			} else if( first === 'each' ) {
				// convert
				// `each items as item, i`
				// into
				// {
				// 	items: items,
				// 	v: v,
				// 	i: i
				// }
				let parsed = parseEach( rest.join( ' ' ) );
				output.push( makeExprWithData( parsed.items, counter ) );
				output.push( `$each($e${counter}, function(${parsed.v}, ${parsed.i}) {
				`);
				counter++;
			} else if( first === '/if' ) {
				output.push( '}' );
			} else if( first === '/each' ) {
				output.push( `});` );
			} else {
				let parts = content.split( '|' );
				let expr = parts[ 0 ];
				let filters = parts.slice( 1 );

				if( expr[ 0 ] !== '=' ) {
					output.push( makeExprWithData( expr, counter ) );

					expr = `$e${counter}`;
					for( let i = 0, len = filters.length; i < len; i++ ) {
						let nameAndArgs = filters[ i ].split( ':' );
						let name = nameAndArgs[ 0 ].trim();
						let args = nameAndArgs.slice( 1 ).join( '' );
						expr = `$filter( ${JSON.stringify(name)}, ${expr} ${args ? ',' + args : ''} )`;
					}

					if( ESCAPE ) {
						output.push( `$o += $escape(${expr});` );
					} else {
						output.push( `$o += ${expr};` );
					}
					counter++;
				} else {
					// no escape
					output.push( makeExprWithData( expr.slice( 1 ), counter ) );
					output.push( `$o += $e${counter};` );
					counter++;
				}
			}
		}
	});

	output.push( 'return $o;' );

	// extract declaration out
	output = output.map(function( v ) {
		if( !Array.isArray( v ) ) {
			return v;
		} else {
			return v.join( '' );
		}
	});

	return new Function('$data', output.join('\n')).bind( util );
};
