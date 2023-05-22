# wsearch
Function to search values (or keys) in objects by RegExp.
## Installation
- from package manager
```
npm i wsearch
```
and import into your file:
```js
const wsearch = require('wsearch');
//or
import wsearch from 'wsearch';
```
- from browser DevTools
```
Put code from "wsearch.min.js" to the target page console.
```
## Basic usage
```
wsearch(query, {target}[, options])
```
> Nesting target in the object with a single property is ***required*** for valid path in output.
>
> Default search prototypes: `["Window", "Object", "Array", "Set", "Map", "Function"]`
- `query` \<RegExp\> Search query
- `target` \<Object\> | \<Array\> | etc. Object with any prototype to search
- `options` \<Object\>
	- `byKeys` \<boolean\> Default: `false`
		> Change the mode to search by property names.
	- `functions` \<boolean\> Default: `false`
		> Add functions body to search.
	- `typesAdd` \<Array\>
		> Add prototypes to defaults (like "Location", "Navigator" etc.). You can get type of any object:
		```js
		Object.prototype.toString.call(object);
		```
	- `typesSet` \<Array\> | "all"
		> Replace defaults prototypes.
		>
		> With parameter "all" search will be performed in all prototypes in target object that are found and maybe will take a lot of time.
- Returns: \<Array\>

For example:
```js
wsearch(/Hello\sworld/, {window}, {functions: true});
```
Output:
```
[
	{
		path: <string path to value>,
		match: <array of matches>,
		object: <object>,
		key: <key>,
		value: <value>
	},
	...
]
```
## Info
If the found path includes Map/Set object or Symbol, access to the keys will be performed through an array with index valid at the time of the search.
