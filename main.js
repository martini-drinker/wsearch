function wsearch(valueRegexp, obj = window) {
	try {
		console.clear();
	} catch (e) { }

	console.log(`...searching...`);

	if (!window.wsearchObj?.v) {
		window.wsearchObj = {v: true};
	}

	let results = wsearchRecursion(valueRegexp, obj);

	window.wsearchObj.v = false;

	try {
		console.clear();
	} catch (e) { }

	return results
}

function wsearchRecursion(valueRegexp, obj, findPathArr = [], path = ``) {
	let curObj;
	let curGetKey = `[\`key\`]`;

	try {
		let type = Object.prototype.toString.call(obj).match(/^\[object\s(Window|Object|Array|Set|Map)\]$/);
		//let type = Object.prototype.toString.call(obj).match(/^\[object\s(.+)\]$/);

		if (obj?.wsearchWasHere?.v || !type) {
			return
		}

		obj.wsearchWasHere = window.wsearchObj;

		let iterable;

		switch (type[1]) {
		case `Set`:
			iterable = Array.from(obj);
			curGetKey = `.has(\`key\`)`;
			break;
		case `Map`:
			iterable = Object.fromEntries(obj);
			curGetKey = `.get(\`key\`)`;
			break;
		}

		curObj = iterable || obj;
	} catch (e) {
		return
	}

	for (let [key, value] of Object.entries(curObj).sort((a, b) => {
		let t1 = typeof a[1] === `object` ? -1 : 0;
		let t2 = typeof b[1] === `object` ? -1 : 0;

		return t2 - t1
	}).reverse()) {
		try {
			if (key === `wsearchWasHere` || key === `wsearchObj`) {
				continue
			}

			let curPath = path + curGetKey.replace(`key`, key);

			if (typeof curObj[key] === `string` || typeof curObj[key] === `number`) {
				if (`${curObj[key]}`.match(valueRegexp)) {
					findPathArr.push([curPath, curObj[key]]);
				}
			} else {
				wsearchRecursion(valueRegexp, curObj[key], findPathArr, curPath);
			}
		} catch (e) {
			continue
		}
	}

	return findPathArr
}
