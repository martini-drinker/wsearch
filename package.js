function wsearch(valueRegexp, target, options) {
	if (!target) {
		console.log(`manual: https://github.com/martini-drinker/wsearch`);

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

	function wsearchRecursion(obj, findPathArr = [], path = ``) {
		let currLevel;

		let keyArr = [];

		try {
			let type = Object.prototype.toString.call(obj).match(params.types);

			if (!type || (obj[params.varName] && obj[params.varName].v)) {
				return
			}

			obj[params.varName] = wsearchObj;

			switch (type[1]) {
			case `Set`:
				currLevel = {
					obj: Array.from(obj),
					key: `.has(\`key\`)`
				};

				break;
			case `Map`:
				let objFromMap = {};
				let counter = {};

				for (let i of obj.entries()) {
					if (!objFromMap[i[0]]) {
						objFromMap[i[0]] = i[1];
					} else {
						if (!counter[i[0]]) {
							counter[i[0]] = 0;
						}

						objFromMap[`${i[0]}#${++counter[i[0]]}`] = i[1];
					}
				}

				currLevel = {
					obj: objFromMap,
					key: `.get(\`key\`)`
				};

				break;
			default:
				currLevel = {
					obj: obj,
					key: `[\`key\`]`
				};
			}

			for (let key in currLevel.obj) {
				keyArr.push(key);
			}

			keyArr.sort((a, b) => {
				let t1 = typeof currLevel.obj[a] === `object` ? -1 : 0;
				let t2 = typeof currLevel.obj[b] === `object` ? -1 : 0;

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

				let curPath = path + currLevel.key.replace(`key`, key);

				if (
					typeof currLevel.obj[key] === `string`
					|| typeof currLevel.obj[key] === `number`
					|| (params.functions && typeof currLevel.obj[key] === `function`)
				) {
					let match = `${currLevel.obj[key]}`.match(valueRegexp);

					if (match) {
						findPathArr.push([curPath, match]);
					}
				} else {
					wsearchRecursion(currLevel.obj[key], findPathArr, curPath);
				}
			} catch (e) {
				continue
			}
		}

		return findPathArr
	}
}

module.exports = wsearch;
