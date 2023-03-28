function wsearch(valueRegexp, options) {
	console.log(`...searching...`);

	let types = [`Window`, `Object`, `Array`, `Set`, `Map`];

	if (options?.types === `all`) {
		types = [`.+`];
	} else if (Array.isArray(options?.types)) {
		types = [...types, ...options?.types]
	}

	let params = {
		target: options?.target || window,
		types: new RegExp(`^\\[object\\s(${types.join(`|`)})\\]$`, `i`),
		functions: options?.functions ? true : false
	};

	if (!window.wsearchObj?.v) {
		window.wsearchObj = {v: true};
	}

	let results;

	try {
		results = wsearchRecursion(valueRegexp, params.target);
	} catch (e) { }

	window.wsearchObj.v = false;

	return results;

	function wsearchRecursion(valueRegexp, obj, findPathArr = [], path = ``) {
		let currLevel = {
			obj: obj,
			key: `[\`key\`]`
		};

		let keyArr = [];

		try {
			let type = Object.prototype.toString.call(obj).match(params.types);

			if (!type || obj?.wsearchWasHere?.v) {
				return
			}

			obj.wsearchWasHere = window.wsearchObj;

			switch (type[1]) {
			case `Set`:
				currLevel = {
					obj: Array.from(obj),
					key: `.has(\`key\`)`
				};

				break;
			case `Map`:
				currLevel = {
					obj: Object.fromEntries(obj),
					key: `.get(\`key\`)`
				};

				break;
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
				if (key === `wsearchWasHere` || key === `wsearchObj`) {
					continue
				}

				let curPath = path + currLevel.key.replace(`key`, key);

				if (
					typeof currLevel.obj[key] === `string`
					|| typeof currLevel.obj[key] === `number`
					|| (params.functions && typeof currLevel.obj[key] === `function`)
				) {
					if (`${currLevel.obj[key]}`.match(valueRegexp)) {
						findPathArr.push([curPath, currLevel.obj[key]]);
					}
				} else {
					wsearchRecursion(valueRegexp, currLevel.obj[key], findPathArr, curPath);
				}
			} catch (e) {
				continue
			}
		}

		return findPathArr
	}
}
