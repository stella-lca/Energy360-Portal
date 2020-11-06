exports.findNestedObj = (entireObj, keyToFind) => {
	let foundObj;
	JSON.stringify(entireObj, (_, nestedValue) => {
		if (nestedValue && nestedValue[keyToFind]) {
			foundObj = nestedValue[keyToFind];
		}
		return nestedValue;
	});
	return foundObj;
};

