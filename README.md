# v [![stability][0]][1]

> :rabbit: a tiny template engine

## Install

```bash
$ npm i vtpl
```

## API

### v.compile( template )

#### template

Type: `string`

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


## Template Syntax

- if / else

```html
{{if expr1}}
	expr1 is true
{{else if expr2}}
	expr2 is true
{{else}}
	expr1 and expr2 are both false
{{/if}}
```

- each

```html
{{each arrayOrObject as v, k}}
	{{ v + 'tail' }}
{{/each}}
```

- filter

{{ v | filter1: param1, param2 | filter2 | ... }}


## License

MIT © [fengzilong](https://github.com/fengzilong/v)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
