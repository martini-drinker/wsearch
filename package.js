function wsearch(valueRegexp, target, options) {
	let targetName = Object.keys(target)[0];

	target = target[targetName];

	if (!target) {
		return
	}

	let wsearchObj = {v: true};

	let types = [`Window`, `Object`, `Array`, `Set`, `Map`];

	if (options?.typesSet === `all`) {
		types = [`.+`];
	} else if (Array.isArray(options?.typesSet)) {
		types = [...options.typesSet]
	} else if (Array.isArray(options?.typesAdd)) {
		types = [...types, ...options.typesAdd]
	}

	let params = {
		types: new RegExp(`^\\[object\\s(${types.join(`|`)})\\]$`, `i`),
		functions: options?.functions ? true : false,
		varName: options?.varName || `wsearchWasHere`
	};

	let results;

	try {
		results = wsearchRecursion(target);
	} catch (e) { }

	wsearchObj.v = false;

	return results;

	function wsearchRecursion(obj, findPathArr = [], path = targetName) {
		let currLevelMap = new Map();

		let keyArr = [];

		try {
			let type = Object.prototype.toString.call(obj).match(params.types);

			if (!type || (obj[params.varName] && obj[params.varName].v)) {
				return
			}

			obj[params.varName] = wsearchObj;

			type = type[1].toLowerCase();

			if (type === `set`) {
				let keys = [...obj];

				for (let i = 0; i < keys.length; ++i) {
					keyArr.push(i);

					currLevelMap.set(i, {
						value: keys[i],
						path: `[...${path}][${i}]`
					});
				}
			} else if (type === `map`) {
				let keys = [...obj.keys()];

				for (let i = 0; i < keys.length; ++i) {
					keyArr.push(keys[i]);

					currLevelMap.set(keys[i], {
						value: obj.get(keys[i]),
						path: `[...${path}.values()][${i}]`
					});
				}
			} else {
				for (let key in obj) {
					keyArr.push(key);

					currLevelMap.set(key, {
						value: obj[key],
						path: type === `array` ? `${path}[${key}]` : `${path}[\`${key}\`]`
					});
				}
			}

			keyArr.sort((a, b) => {
				let t1 = typeof currLevelMap.get(a).value === `object` ? -1 : 0;
				let t2 = typeof currLevelMap.get(b).value === `object` ? -1 : 0;

				return t1 - t2
			});
		} catch (e) {
			return
		}

		for (let key of keyArr) {
			try {
				if (key === params.varName) {
					continue
				}

				let keyObj = currLevelMap.get(key);

				if ((typeof keyObj.value).match(new RegExp(`^(?:string|number|boolean${params.functions ? `|function` : ``})$`))) {
					let match = `${keyObj.value}`.match(valueRegexp);

					if (match) {
						findPathArr.push([keyObj.path, match]);
					}
				} else {
					wsearchRecursion(keyObj.value, findPathArr, keyObj.path);
				}
			} catch (e) { }
		}

		return findPathArr
	}
}

module.exports = wsearch;
