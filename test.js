'use strict';
import test from 'ava'
import v from './dist/index.js'

test.before(() => {
	v.registerFilter('append', ( str, p ) => {
		return str + '' + p;
	});

	v.registerFilter('trim', ( str, p ) => {
		return ( str + '' ).trim();
	});

	v.registerFilter('lowerCase', ( str, p ) => {
		return ( str + '' ).toLowerCase();
	});

	v.registerFilter('firstToUpperCase', ( str, p ) => {
		str = str + '';
		return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
	});
});

const defaultOpenTag = v.config( 'openTag' );
const defaultCloseTag = v.config( 'closeTag' );
const defaultEscape = v.config( 'escape' );

test.beforeEach(() => {
	v.config( 'openTag', defaultOpenTag );
	v.config( 'closeTag', defaultCloseTag );
	v.config( 'escape', defaultEscape );
});

test(`defaultOpenTag is {{`, t => {
	t.is( defaultOpenTag, '{{' );
});

test(`defaultCloseTag is }}`, t => {
	t.is( defaultCloseTag, '}}' );
});

test(`defaultEscape is true`, t => {
	t.is( defaultEscape, true );
});

test(`v`, t => {
	const o = v.compile( '{{ v }}' )({
		v: 123
	});

	t.is( o, '123' );
});

test(`Date.now()`, t => {
	const o = v.compile( '{{ Date.now() }}' )();
	if( /^\d+$/.test( o ) ) {
		t.pass();
	} else {
		t.fail();
	}
});

test(`+new Date()`, t => {
	const o = v.compile( '{{ +new Date() }}' )();
	if( /^\d+$/.test( o ) ) {
		t.pass();
	} else {
		t.fail();
	}
});

test(`a ? b : c`, t => {
	const o = v.compile( '{{ a ? b : c }}' )({
		a: false,
		b: 1,
		c: 2
	});
	t.is( o, '2' );
});

test(`a + b`, t => {
	const o = v.compile( '{{ a + b }}' )({
		a: '1',
		b: '2'
	});
	t.is( o, '12' );
});

test(`a - b`, t => {
	const o = v.compile( '{{ a - b }}' )({
		a: 6,
		b: 1
	});
	t.is( o, '5' );
});

test(`a * b`, t => {
	const o = v.compile( '{{ a * b }}' )({
		a: 6,
		b: 3
	});
	t.is( o, '18' );
});

test(`a / b`, t => {
	const o = v.compile( '{{ a / b }}' )({
		a: 6,
		b: 3
	});
	t.is( o, '2' );
});

test(`escape`, t => {
	const o = v.compile( '{{ v }}' )({
		v: '<span>text</span>'
	});
	t.is( o, '&#60;span&#62;text&#60;/span&#62;' );
});

test(`no escape`, t => {
	const o = v.compile( '{{= v }}' )({
		v: '<span>text</span>'
	});
	t.is( o, '<span>text</span>' );
});

test(`no escape globally`, t => {
	v.config( 'escape', false );
	const o = v.compile( '{{ v }}' )({
		v: '<span>text</span>'
	});
	t.is( o, '<span>text</span>' );
});

test(`no escape locally`, t => {
	const o = v.compile( '{{ v }}', {
		escape: false
	} )({
		v: '<span>text</span>'
	});
	t.is( o, '<span>text</span>' );
});

test(`custom openTag and closeTag`, t => {
	v.config( 'openTag', '{' );
	v.config( 'closeTag', '}' );
	const o = v.compile( '{if true}{ v1 }{else}{ v2 }{/if}' )({
		v1: 'v1',
		v2: 'v2'
	});
	t.is( o, 'v1' );
});

test(`custom openTag and closeTag locally`, t => {
	const o = v.compile( '{if true}{ v1 }{else}{ v2 }{/if}', {
		openTag: '{',
		closeTag: '}'
	} )({
		v1: 'v1',
		v2: 'v2'
	});
	t.is( o, 'v1' );
});

test(`if`, t => {
	const o = v.compile( '{{if true}}true{{/if}}' )();
	t.is( o, 'true' );
});

test(`if && else`, t => {
	const o = v.compile( '{{if a === 1}}a === 1{{else}}a !== 1{{/if}}' )({
		a: 1
	});
	t.is( o, 'a === 1' );
});

test(`if && else if`, t => {
	const o = v.compile( '{{if a === 1}}a === 1{{else if a === 2}}a === 2{{/if}}' )({
		a: 2
	});
	t.is( o, 'a === 2' );
});

test(`if && else if && else`, t => {
	const o = v.compile( '{{if a === 1}}a === 1{{else if a === 2}}a === 2{{else}}a !== 1 && a !== 2{{/if}}' )({
		a: 3
	});
	t.is( o, 'a !== 1 && a !== 2' );
});

test(`each for array`, t => {
	const o = v.compile( '{{each arr as v, k}}{{k}}{{v}}{{/each}}' )({
		arr: [ 'a', 'b', 'c' ]
	});
	t.is( o, `0a1b2c` );
});

test(`each for object`, t => {
	const o = v.compile( '{{each arr as v, k}}{{k}}{{v}}{{/each}}' )({
		arr: {
			a: '1',
			b: '2',
			c: '3'
		}
	});
	t.is( o, `a1b2c3` );
});

test(`if in each`, t => {
	const o = v.compile( `{{each arr as v, k}}{{if v === 1}}1{{else}}not 1{{/if}}{{/each}}` )({
		arr: [1,2,1]
	}).trim();
	t.is( o, `1not 11` );
});

test(`nested if`, t => {
	const o = v.compile( `
		{{if a === 1}}
			{{if b === 2}}
				1
			{{else}}
				2
			{{/if}}
		{{else}}
			3
		{{/if}}
	` )({
		a: 1,
		b: 3,
	}).trim();
	t.is( o, `2` );
});

test(`filter`, t => {
	const o = v.compile(`{{ v | append : 'x' }}`)({
		v: 1
	});

	t.is( o, '1x' );
});

test(`filters`, t => {
	const o = v.compile(`{{ v | trim | lowerCase | firstToUpperCase | append: ' World' }}`)({
		v: '	HELLO '
	});

	t.is( o, 'Hello World' );
});

test(`preserve whitespace`, t => {
	const o = v.compile(`hello\nfriend, {{ data }}!!!`)({
		data: 'world'
	});

	t.is( o, `hello\nfriend, world!!!` );
})
