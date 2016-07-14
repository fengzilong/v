'use strict';

const escapeMap = {
	"<": "&#60;",
	">": "&#62;",
	'"': "&#34;",
	"'": "&#39;",
	"&": "&#38;"
};

const escape = function( content ) {
	content += '';
	return content.replace(/&(?![\w#]+;)|[<>"']/g, function( v ) {
		return escapeMap[ v ];
	});
};

const OPEN_TAG = '{{';
const CLOSE_TAG = '}}';

const compile = function( template ) {
	let output = [];
	let counter = 1;

	let pieces = template.replace(/(\n|\r|\t)/g, '').split(/({{|}})/);

	let html = [];
	let code = [];
	let all = [];

	let logic = false;
	pieces.forEach(( v, i ) => {
		var tmp;
		switch( v ) {
			case '{{':
				logic = true;
				break;
			case '}}':
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
		var parts = v.content.split( ' ' );
		var first = parts[ 0 ];
		if( first === 'if' || first === 'each' ) {
			// 从末尾开始向前查找，查找到当前元素的下一个为止
			for( let j = code.length - 1; j > i; j-- ) {
				if( !code[ j ].binded && new RegExp( '^/' + first ).test( code[ j ].content ) ) {
					// 锁定当前/xxx为已绑定状态
					code[ j ].binded = true;
					v.bind = code[ j ].position;
					break;
				}
			}
		}
	});

	// find else belong
	code.forEach(( v, i ) => {
		var parts = v.content.split( ' ' );
		var first = parts[ 0 ];

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

	output.push( 'var $o = "";' );

	const makeExprWithData = function( expr, suffix ) {
		// 错误抑制
		return `
			${ suffix ? 'var $e' + suffix + ';': '' }
			with( $data ) {
				if( typeof ${expr} === 'undefined' ) {
					$e${suffix || ''} = '';
				} else {
					$e${suffix || ''} = ( ${expr} );
				}
			}
		`;
	};

	const makeEachExprWithData = function( expr, suffix ) {
		// 错误抑制
		return `
			${ suffix ? 'var $e' + suffix + ';': '' }
			with( $data ) {
				if( typeof ${expr} === 'undefined' ) {
					$e${suffix || ''} = [];
				} else {
					$e${suffix || ''} = ( ${expr} );
				}
			}
		`;
	};

	const parseEach = expr => {
		let tmp = expr.split( ' as ' );
		if( tmp.length === 2 ) {
			let tmp2 = tmp[ 1 ].split( ',' );
			let i = tmp2[ 1 ] || '$i';
			let v = tmp2[ 0 ] || '$v';
			return {
				items: tmp[ 0 ],
				v: v,
				i: i
			};
		}
	};

	const joinEachExpr = ( items, i ) => {
		return `var ${i} = 0, len = ${items}.length; ${i} < len; ${i}++`;
	}

	all.forEach(v => {
		if( v.type === 'html' ) {
			// TODO: shall escape
			// = not escape
			output.push( '$o += "' + escape( v.content ) + '";' );
		} else if( v.type === 'code' ) {
			let parts = v.content.split( ' ' );
			let rest = parts.splice( 1 );
			let first = parts[ 0 ];
			let matched;

			// TODO: support else if
			if( first === 'if' ) {
				v.declare = [];
				v.declare.push( makeExprWithData( rest.join( ' ' ), counter ) );
				output.push( v.declare );
				output.push( `if( $e${counter} ) {` );
				counter++;
			} else if( first === 'else' ) {
				if( rest[ 0 ] === 'if' ) {
					// 将makeExpr挪到if开始的地方
					all.forEach(function( v2 ) {
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
				// each items as item, i
				// =>
				// {
				// 	items: items,
				// 	v: v,
				// 	i: i
				// }
				let parsed = parseEach( rest.join( ' ' ) );
				output.push( makeEachExprWithData( parsed.items, counter ) );
				// TODO: 统一遍历方法，支持数组和对象
				output.push( 'for( ' + joinEachExpr( `$e${counter}`, parsed.i ) + ' ) {' );
				output.push( `${parsed.v} = $e${counter}[$i];` );
				counter++;
			} else if( first === '/if' || first === '/each' ) {
				output.push( '}' );
			} else {
				output.push( makeExprWithData( v.content, counter ) );
				output.push( `$o += $e${counter};` );
				counter++;
			}
		}
	});

	output.push( 'return $o;' );

	output = output.map(function( v ) {
		if( !Array.isArray( v ) ) {
			return v;
		} else {
			return v.join( '' );
		}
	});

	return new Function('$data', output.join('\n'));
}


module.exports = compile;
