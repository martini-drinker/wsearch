# wsearch
Simple function to search values (or properties) in objects by RegExp.
## Installation
- from package manager
```
npm i wsearch
```
and import into your file:
```js
const wsearch = require(`wsearch`);
```
- from browser DevTools
```
Put function code from package.js to the target page console.
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
	- `byProp` \<boolean\> Default: `false`
		> Change the mode to search by property name.
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
		> ***WARNING!*** Use parameter "all" very carefully. With this parameter search will be performed in all prototypes that are found and will take a very long time. Most of the time this option value is not needed.
	
- Returns: \<Array\>

For example:
```js
wsearch(/Hello\sworld/, {window});
```
Output:
```
[
	{
		path: <string path to value>,
		match: <array of matches>,
		object: <object>
		key: <key>,
		value: <value>
	},
	...
]
```
## Info
If the found path includes Map/Set object, access to the properties of these objects will be performed through an array with index valid at the time of the search.
