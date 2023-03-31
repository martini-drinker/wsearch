function wsearch(searchRegexp, target, options) {
	let targetName = Object.keys(target)[0];

	target = target[targetName];

	let wsearchObj = [true];

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
		varName: options?.varName || `wsearchWasHere`,
		byProp: options?.byProp ? true : false
	};

	let results;

	try {
		results = wsearchRecursion(target);
	} catch (e) { }

	wsearchObj[0] = false;

	return results || [];

	function wsearchRecursion(obj, findPathArr = [], path = targetName) {
		let arr = [];

		try {
			let type = Object.prototype.toString.call(obj).match(params.types);

			if (!type || (obj[params.varName] && obj[params.varName][0])) {
				return
			}

			obj[params.varName] = wsearchObj;

			type = type[1].toLowerCase();

			if (type === `set`) {
				let keys = [...obj];

				for (let i = 0; i < keys.length; ++i) {
					arr.push({
						key: keys[i],
						value: keys[i],
						path: `[...${path}][${i}]`
					});
				}
			} else if (type === `map`) {
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
						path: type === `array` ? `${path}[${key}]` : `${path}[\`${key}\`]`
					});
				}
			}
		} catch (e) {
			return
		}

		for (let elem of arr) {
			try {
				if (params.byProp && isPrimitive(elem.key)) {
					if (elem.key === params.varName) {
						continue
					}
					
					let match = `${elem.key}`.match(searchRegexp);

					if (match) {
						findPathArr.push([elem.path, match]);
					}
				}

				if (isPrimitive(elem.value)) {
					if (!params.byProp) {
						let match = `${elem.value}`.match(searchRegexp);

						if (match) {
							findPathArr.push([elem.path, match]);
						}
					}
				} else {
					wsearchRecursion(elem.value, findPathArr, elem.path);
				}
			} catch (e) { }
		}

		return findPathArr
	}

	function isPrimitive(value) {
		if ( (params.functions && typeof value === `function`) || value !== Object(value) ) {
			return true
		}
	}
}

module.exports = wsearch;
