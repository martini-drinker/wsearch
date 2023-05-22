const DEFAULTTYPES = [`window`, `object`, `array`, `set`, `map`, `function`];

function wsearch(searchRegexp, target, options) {
	let targetName = Object.keys(target)[0];

	target = target[targetName];

	let params = {
		byKeys: !!options?.byKeys,
		functions: !!options?.functions,
		types: getTypes(options)
	};

	return wsearchRecursion(searchRegexp, target, params, targetName) || [];
}

function wsearchRecursion(searchRegexp, obj, params, path, findPathArr = [], set1 = new Set(), set2 = new Set()) {
	let arr = [];

	try {
		if (set1.has(obj)) {
			return;
		}

		set1.add(obj);

		let type = Object.prototype.toString.call(obj);

		addValueOf(obj, path, arr, type);

		if ((params.types && !type.match(params.types))) {
			if (arr.length) {
				addFindPathArr(searchRegexp, obj, params, findPathArr, set1, set2, arr);
			}

			return;
		}

		addAllProperties(obj, path, arr);

		addSetMapProperties(obj, path, arr);
	} catch {
		return;
	}

	addFindPathArr(searchRegexp, obj, params, findPathArr, set1, set2, arr, true);

	return findPathArr;
}

function getTypes(options) {
	let types = DEFAULTTYPES;

	if (options?.typesSet === `all`) {
		types = [`.+`];
	} else if (Array.isArray(options?.typesSet)) {
		types = [...new Set(options.typesSet)];
	} else if (Array.isArray(options?.typesAdd)) {
		types = [...new Set([...types, ...options.typesAdd])];
	}

	return new RegExp(`^\\[object\\s(?:${types.join(`|`)})\\]$`, `i`);
}

function isPrimitive(value) {
	if (value !== Object(value)) {
		return true;
	}
}

function addValueOf(obj, path, arr, type) {
	try {
		let match = type.match(/^\[object\s(.+)\]$/);

		if (!match) {
			return;
		}

		let valueParams = getValueParams(obj, path, match[1])

		let [value, valuePath] = valueParams;

		if (valueParams.length) {
			arr.push({
				key: ``,
				value: value,
				path: valuePath
			});
		}
	} catch { }
}

function getValueParams(obj, path, typeName) {
	switch (typeName.toLowerCase()) {
	case `number`:
		return [
			Number.prototype.valueOf.call(obj),
			obj.valueOf === Number.prototype.valueOf ? `${path}.valueOf()` : `Number.prototype.valueOf.call(${path})`
			];
	case `string`:
		return [
			String.prototype.valueOf.call(obj),
			obj.valueOf === String.prototype.valueOf ? `${path}.valueOf()` : `String.prototype.valueOf.call(${path})`
			];
	case `boolean`:
		return [
			Boolean.prototype.valueOf.call(obj),
			obj.valueOf === Boolean.prototype.valueOf ? `${path}.valueOf()` : `Boolean.prototype.valueOf.call(${path})`
			];
	}

	return [];
}

function addAllProperties(obj, path, arr, currObj = obj, currPath = path, set = new Set()) {
	addPropertyNames(obj, path, arr, currObj, set);

	addPropertySymbols(obj, path, arr, currObj, currPath, set);

	let proto = Object.getPrototypeOf(currObj);

	if (proto) {
		addAllProperties(obj, path, arr, proto, `Object.getPrototypeOf(${path})`, set);
	}
}

function addPropertyNames(obj, path, arr, currObj, set) {
	Object.getOwnPropertyNames(currObj).forEach(item => {
		try {
			if (!set.has(item)) {
				arr.push({
					key: item,
					value: obj[item],
					path: `${path}[\`${item}\`]`
				});

				set.add(item);
			}
		} catch { }
	});
}

function addPropertySymbols(obj, path, arr, currObj, currPath, set) {
	Object.getOwnPropertySymbols(currObj).forEach((item, i) => {
		try {
			if (!set.has(item)) {
				arr.push({
					key: item,
					value: obj[item],
					path: `${path}[Object.getOwnPropertySymbols(${currPath})[${i}]]`
				});

				set.add(item);
			}
		} catch { }
	});
}

function addSetMapProperties(obj, path, arr) {
	try {
		if (obj instanceof Set) {
			[...obj].forEach((item, i) => {
				arr.push({
					key: item,
					value: item,
					path: `[...${path}][${i}]`
				});
			});
		} else if (obj instanceof Map) {
			[...obj.entries()].forEach((item, i) => {
				if (!isPrimitive(item[0])) {
					arr.push({
						key: item[0],
						value: item[0],
						path: obj.keys === Map.prototype.keys ? `[...${path}.keys()][${i}]` : `[...Map.prototype.keys.call(${path})][${i}]`
					});
				}

				arr.push({
					key: item[0],
					value: item[1],
					path: obj.values === Map.prototype.values ? `[...${path}.values()][${i}]` : `[...Map.prototype.values.call(${path})][${i}]`
				});
			});
		}
	} catch { }
}

function addFindPathArr(searchRegexp, obj, params, findPathArr, set1, set2, arr, isRecursion) {
	for (let elem of arr) {
		try {
			if (params.byKeys) {
				if (isPrimitive(elem.key)) {
					pathCheckAdd(searchRegexp, obj, findPathArr, elem.key, elem);
				} else if (params.functions && typeof elem.key === `function` && !set2.has(elem.key)) {
					set2.add(elem.key);

					pathCheckAdd(searchRegexp, obj, findPathArr, elem.key, elem);
				}
			}

			if (isPrimitive(elem.value)) {
				if (!params.byKeys) {
					pathCheckAdd(searchRegexp, obj, findPathArr, elem.value, elem);
				}

				continue;
			}

			if (!params.byKeys && params.functions && typeof elem.value === `function` && !set2.has(elem.value)) {
				set2.add(elem.value);

				pathCheckAdd(searchRegexp, obj, findPathArr, elem.value, elem);
			}

			if (isRecursion) {
				wsearchRecursion(searchRegexp, elem.value, params, elem.path, findPathArr, set1, set2);
			}
		} catch { }
	}
}

function pathCheckAdd(searchRegexp, obj, findPathArr, value, elem) {
	try {
		let match = `${typeof value === `symbol` ? value.description : value}`.match(searchRegexp);

		if (match) {
			findPathArr.push({
				path: elem.path,
				match: match,
				object: obj,
				key: elem.key,
				value: elem.value
			});
		}
	} catch { }
}

module.exports = wsearch;
