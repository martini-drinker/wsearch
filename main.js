function wsearch(valueRegexp, options) {
	try {
		console.clear();
	} catch (e) { }

	console.log(`...searching...`);

	if (options?.types === `all`) {
		options.types = [`.+`];
	}

	let params = {
		target: options?.target || window,
		types: options?.types ? new RegExp(`^\\[object\\s(${options.types.join(`|`)})\\]$`, `i`) : /^\[object\s(Window|Object|Array|Set|Map)\]$/,
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

	try {
		console.clear();
	} catch (e) { }

	return results

	function wsearchRecursion(valueRegexp, obj, findPathArr = [], path = ``) {
		let currLevel = {
			obj: obj,
			key: `[\`key\`]`
		};

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
		} catch (e) {
			return
		}

		for (let [key] of Object.entries(currLevel.obj).sort((a, b) => {
			let t1 = typeof a[1] === `object` ? -1 : 0;
			let t2 = typeof b[1] === `object` ? -1 : 0;

			return t1 - t2
		})) {
			try {
				if (key === `wsearchWasHere` || key === `wsearchObj`) {
					continue
				}

				let curPath = path + currLevel.key.replace(`key`, key);

				if (typeof currLevel.obj[key] === `string` || typeof currLevel.obj[key] === `number` || (params.functions && typeof currLevel.obj[key] === `function`)) {
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
