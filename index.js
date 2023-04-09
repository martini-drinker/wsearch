function wsearch(searchRegexp, target, options) {
	let targetName = Object.keys(target)[0];

	target = target[targetName];

	let params = {
		byKeys: !!options?.byKeys,
		functions: !!options?.functions,
		types: options?.types ? new RegExp(`^\\[object\\s(?:${options.types.join(`|`)})\\]$`, `i`) : false
	};

	let set = new Set();
	let set2 = new Set();

	let results;

	try {
		results = wsearchRecursion(target);
	} catch { }

	return results || [];

	function wsearchRecursion(obj, findPathArr = [], path = targetName) {
		let arr = [];

		try {
			let type = Object.prototype.toString.call(obj);

			if ((params.types && !type.match(params.types)) || set.has(obj)) {
				return;
			}

			set.add(obj);

			getAllProperties(obj, path, arr);

			getValueOf(obj, type, arr, path);

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
		} catch {
			return;
		}

		for (let elem of arr) {
			try {
				if (params.byKeys) {
					if (isPrimitive(elem.key)) {
						pathCheckPush(elem.key, elem, obj, findPathArr);
					} else if (params.functions && typeof elem.key === `function` && !set2.has(elem.key)) {
						set2.add(elem.key);

						pathCheckPush(elem.key, elem, obj, findPathArr);
					}
				}

				if (isPrimitive(elem.value)) {
					if (!params.byKeys) {
						pathCheckPush(elem.value, elem, obj, findPathArr);
					}

					continue
				}

				if (!params.byKeys && params.functions && typeof elem.value === `function` && !set2.has(elem.value)) {
					set2.add(elem.value);

					pathCheckPush(elem.value, elem, obj, findPathArr);
				}

				wsearchRecursion(elem.value, findPathArr, elem.path);
			} catch { }
		}

		return findPathArr;
	}

	function isPrimitive(value) {
		if (value !== Object(value)) {
			return true;
		}
	}

	function pathCheckPush(value, elem, obj, findPathArr) {
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

	function getAllProperties(obj, path, arr, currObj = obj, currPath = path) {
		Object.getOwnPropertyNames(currObj).forEach(item => {
			try {
				arr.push({
					key: item,
					value: obj[item],
					path: `${path}[\`${item}\`]`
				});
			} catch { }
		});

		Object.getOwnPropertySymbols(currObj).forEach((item, i) => {
			try {
				arr.push({
					key: item,
					value: obj[item],
					path: `${path}[Object.getOwnPropertySymbols(${currPath})[${i}]]`
				});
			} catch { }
		});

		let proto = Object.getPrototypeOf(currObj);

		if (proto) {
			getAllProperties(obj, path, arr, proto, `Object.getPrototypeOf(${path})`);
		}
	}

	function getValueOf(obj, type, arr, path) {
		try {
			let value, valuePath;

			if (/^\[object\snumber\]$/i.test(type)) {
				value = Number.prototype.valueOf.call(obj);

				valuePath = obj.valueOf === Number.prototype.valueOf ? `${path}.valueOf()` : `Number.prototype.valueOf.call(${path})`;
			} else if (/^\[object\sstring\]$/i.test(type)) {
				value = String.prototype.valueOf.call(obj);

				valuePath = obj.valueOf === String.prototype.valueOf ? `${path}.valueOf()` : `String.prototype.valueOf.call(${path})`;
			} else if (/^\[object\sboolean\]$/i.test(type)) {
				value = Boolean.prototype.valueOf.call(obj);

				valuePath = obj.valueOf === Boolean.prototype.valueOf ? `${path}.valueOf()` : `Boolean.prototype.valueOf.call(${path})`;
			}

			if (valuePath) {
				arr.push({
					key: ``,
					value: value,
					path: valuePath
				});
			}
		} catch { }
	}
}

module.exports = wsearch;
