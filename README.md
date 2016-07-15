# v [![stability][0]][1]

> :rabbit: a tiny template engine

## Install

not published yet

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


## License

MIT © [fengzilong](https://github.com/fengzilong/v)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
