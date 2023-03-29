# wsearch
Simple JS function to find closest values in objects.
## Installation
- from package manager
```
npm install wsearch
```
- from browser
```
Put JS code from browser.js to target page.
```
## Basic usage
Use RegExp to search.
```js
wsearch(/Hello\sworld/, {target: window});
```
Output:
```
[
	[*string path to value*, *array of matches*]
	...
]
```
## Info
In the course of work, new properties will be added to the objects in the search.
Сlone the object to prevent this before searching.
## Customizing
You can add custom options to searching in second argument of function.
List of options:
- `target`: object (default: `window` (in browser version))
```
	Search by custom object (any object supporting for ... in loop iterates)
```
- `functions`: true OR false (default)
```
	Add functions body to search.
```
- `typesAdd`: array of string (default: `["Window", "Object", "Array", "Set", "Map"]`)
```
	Add custom types to defaults (like "Location", "Navigator" etc.). You can get type of any object:
```

```js
	Object.prototype.toString.call(object);
```
- `typesSet`: array of string OR "all"
```
	Replace defaults types with custom.

	***WARNING*** Use value "all" very carefully.
	With this parameter search will be performed in all prototypes that are found and will take a very long time.
	Most of the time this option value is not needed.
```
- `varName`: string (default: `"wsearchWasHere"`)
```
	The property name to be added to the objects in search.
```
## Output
```
If path to value includes Map object, property of this object transform to string.
If the properties match, at the end of the property name adding hash and unique number: `#(n > 0)`
```
