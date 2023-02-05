# v [![npm package][npm-package-image]][npm-package-url] [![size][size-image]][size-url]

> a tiny template engine

## Installation

```bash
$ npm i vtpl
```

## Template Syntax

### if / else

```js
{{if expr1}}
	expr1 is true
{{else if expr2}}
	expr1 is false and expr2 is true
{{else}}
	expr1 and expr2 are both false
{{/if}}
```

### each

```html
{{each arrayOrObject as v, k}}
	{{ v }}
{{/each}}
```

### interpolation

```js
{{ v }}
{{ v + 'tail' }}
{{ a || b }}
{{ a && b }}
{{ Date.now() }}
{{ Math.round( num ) }}
{{ boolean ? a : b }}
...
```

All interpolations will be escaped automatically by default, if you want to disable this feature, add `=` at the start of your interpolation

For example

```js
{{= expr}}
```

You can also disable this feature in global scope, by adding following code before compiling your template

```js
v.config( 'escape', false );
```

### filter

```js
{{ expr | filter1: param1, param2 | filter2 | ... }}
```

If you want to register your own filter, use `v.registerFilter`

Here is an example for filter1 above

```js
v.registerFilter( 'filter1', function( str, param1, param2 ) {
	return str + param1 + param2;
} );
```

## API

### v.compile( template, options )

#### template

Type: `string`

#### options

options here has priority over global config

key | value
------- | -----------
openTag | string
closeTag | string
escape | boolean

### v.registerFilter( name, fn )

#### name

Type: `string`

#### fn

Type: `function`

### v.config( key, value )

#### key

Type: `string`

#### value

Type: `string` or `boolean`

key | value
------- | -----------
openTag | string
closeTag | string
escape | boolean

## License

MIT © [fengzilong](https://github.com/fengzilong/v)

[size-image]: https://img.shields.io/bundlephobia/minzip/vtpl?color=%2322ce42&style=flat-square
[size-url]: https://unpkg.com/browse/vtpl/

[npm-package-image]: https://img.shields.io/npm/v/vtpl.svg?style=flat-square
[npm-package-url]: https://www.npmjs.org/package/vtpl
