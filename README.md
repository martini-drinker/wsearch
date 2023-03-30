# wsearch
Simple JS function to find closest values in objects.
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
Put JS function code from package.js to target page console.
```
## Basic usage
Default search types: `["Window", "Object", "Array", "Set", "Map"]`
```
wsearch(query, target[, options])
```
- `query` \<RegExp\> Search query
- `target` \<Object\> Object to search supporting for ... in loop iterates
- `options` \<Object\>
	- `functions` \<boolean\> Default: `false`
		> Add functions body to search.
	- `typesAdd` \<Array\>
		> Add custom types to defaults (like "Location", "Navigator" etc.). You can get type of any object:
		```js
		Object.prototype.toString.call(object);
		```
	- `typesSet` \<Array\> | "all"
		> Replace defaults types with custom.
		>
		> ***WARNING!*** Use parameter "all" very carefully. With this parameter search will be performed in all prototypes that are found and will take a very long time. Most of the time this option value is not needed.
	- `varName` \<string\> Default: `"wsearchWasHere"`
		> The property name to be added to the objects in search.
- Returns: \<Array\>

For example:
```js
wsearch(/Hello\sworld/, window);
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
If the found path includes Map object, property of this object transform to string and at the end adding hash with unique number: `#(n >= 0)`
