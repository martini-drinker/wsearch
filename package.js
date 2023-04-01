function wsearch(searchRegexp, target, options) {
	let targetName = Object.keys(target)[0];

	target = target[targetName];

	let set = new Set();
	let setFunc = new Set();

	let types = [`Window`, `Object`, `Array`, `Set`, `Map`, `Function`];

	if (options?.typesSet === `all`) {
		types = [`.+`];
	} else if (Array.isArray(options?.typesSet)) {
		types = [...options.typesSet]
	} else if (Array.isArray(options?.typesAdd)) {
		types = [...types, ...options.typesAdd]
	}

	let params = {
		types: new RegExp(`^\\[object\\s(?:${types.join(`|`)})\\]$`, `i`),
		functions: options?.functions ? true : false,
		byProp: options?.byProp ? true : false
	};

	let results;

	try {
		results = wsearchRecursion(target);
	} catch (e) { }

	return results || []

	function wsearchRecursion(obj, findPathArr = [], path = targetName) {
		let arr = [];

		try {
			if (!Object.prototype.toString.call(obj).match(params.types) || set.has(obj)) {
				return
			}

			set.add(obj);

			if (obj instanceof Set) {
				let keys = [...obj];

				for (let i = 0; i < keys.length; ++i) {
					arr.push({
						key: keys[i],
						value: keys[i],
						path: `[...${path}][${i}]`
					});
				}
			} else if (obj instanceof Map) {
				let entries = [...obj.entries()];

				for (let i = 0; i < entries.length; ++i) {
					if (!isPrimitive(entries[i][0])) {
						arr.push({
							key: entries[i][0],
							value: entries[i][0],
							path: `[...${path}.keys()][${i}]`
						});
					}

					arr.push({
						key: entries[i][0],
						value: entries[i][1],
						path: `[...${path}.values()][${i}]`
					});
				}
			} else {
				for (let key in obj) {
					arr.push({
						key: key,
						value: obj[key],
						path: obj instanceof Array ? `${path}[${key}]` : `${path}[\`${key}\`]`
					});
				}
			}
		} catch (e) {
			return
		}

		for (let elem of arr) {
			try {
				if (params.byProp) {
					if (isPrimitive(elem.key)) {
						pathCheckPush(elem.key, elem, findPathArr);
					} else if (params.functions && typeof elem.key === `function` && !setFunc.has(elem.key)) {
						setFunc.add(elem.key);

						pathCheckPush(elem.key, elem, findPathArr);
					}
				}

				if (isPrimitive(elem.value)) {
					if (!params.byProp) {
						pathCheckPush(elem.value, elem, findPathArr);
					}

					continue
				}

				if (!params.byProp && params.functions && typeof elem.value === `function` && !setFunc.has(elem.value)) {
					setFunc.add(elem.value);

					pathCheckPush(elem.value, elem, findPathArr);
				}

				wsearchRecursion(elem.value, findPathArr, elem.path);
			} catch (e) { }
		}

		return findPathArr
	}

	function isPrimitive(value) {
		if (value !== Object(value)) {
			return true
		}
	}

	function pathCheckPush(value, elem, findPathArr) {
		let match = `${value}`.match(searchRegexp);

		if (match) {
			findPathArr.push({
				path: elem.path,
				match: match,
				key: elem.key,
				value: elem.value
			});
		}
	}
}

module.exports = wsearch;
