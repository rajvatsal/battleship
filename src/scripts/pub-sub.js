const eventsDefined = {};

export const on = (eventName, fn, pubsubId) => {
	//subscriber function
	if (pubsubId) fn.psId = pubsubId;
	eventsDefined[eventName] = eventsDefined[eventName] || [];
	if (Object.getPrototypeOf(fn).constructor === Array)
		fn.forEach((callback) => eventsDefined[eventName].push(callback));
	else eventsDefined[eventName].push(fn);
};

export const off = (eventName, fn) => {
	//remover function
	if (eventsDefined[eventName]) {
		for (var i = 0; i < eventsDefined[eventName].length; i++) {
			if (eventsDefined[eventName][i] === fn) {
				eventsDefined[eventName].splice(i, 1);
				break;
			}
		}
	}
};

export const emit = (eventName, data, fnName) => {
	//publish function
	let returnValue = null;
	if (eventsDefined[eventName]) {
		eventsDefined[eventName].forEach(function (fn) {
			if (fn.psId === fnName) returnValue = fn(data);
			else fn(data);
		});
	}
	return returnValue;
};
