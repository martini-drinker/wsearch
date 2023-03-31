# wsearch
Simple JS function to search values (or properties) in objects by RegExp.
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
Put JS function code from package.js to the target page console.
```
## Basic usage
```
wsearch(query, {target}[, options])
```
> Nesting target in the object with a single property is ***required*** for valid path in output.
>
> Default search prototypes: `["Window", "Object", "Array", "Set", "Map"]`
- `query` \<RegExp\> Search query
- `target` \<Object\> | \<Array\> | etc. Object with any prototype to search
- `options` \<Object\>
	- `byProp` \<boolean\> Default: `false`
		> Searching by properties name.
	- `functions` \<boolean\> Default: `false`
		> Add functions body to search.
	- `varName` \<string\> Default: `"wsearchWasHere"`
		> The property name to be added to the objects in search.
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
	[<string path to value>, <array of matches>],
	...
]
```
## Info
In the course of work, new properties will be added to the objects in the search.
Сlone the object to prevent this before searching.

If the found path includes Map/Set object, access to the properties of these objects will be performed through an array with index valid at the time of the search.
