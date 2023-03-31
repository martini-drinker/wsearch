function wsearch(valueRegexp, target, options) {
	let targetName = Object.keys(target)[0];

	target = target[targetName];

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

	return results || [];

	function wsearchRecursion(obj, findPathArr = [], path = targetName) {
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
					keyArr.push({
						value: keys[i],
						path: `[...${path}][${i}]`
					});
				}
			} else if (type === `map`) {
				let keys = [...obj.entries()];

				for (let i = 0; i < keys.length; ++i) {
					keyArr.push({
						value: keys[i][0],
						path: `[...${path}.keys()][${i}]`
					});

					keyArr.push({
						value: keys[i][1],
						path: `[...${path}.values()][${i}]`
					});
				}
			} else {
				for (let key in obj) {
					keyArr.push({
						value: obj[key],
						path: type === `array` ? `${path}[${key}]` : `${path}[\`${key}\`]`
					});
				}
			}

			keyArr.sort((a, b) => {
				let t1 = typeof a.value === `object` ? -1 : 0;
				let t2 = typeof b.value === `object` ? -1 : 0;

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

				if ((typeof key.value).match(new RegExp(`^(?:string|number|boolean${params.functions ? `|function` : ``})$`))) {
					let match = `${key.value}`.match(valueRegexp);

					if (match) {
						findPathArr.push([key.path, match]);
					}
				} else {
					wsearchRecursion(key.value, findPathArr, key.path);
				}
			} catch (e) { }
		}

		return findPathArr
	}
}

module.exports = wsearch;
