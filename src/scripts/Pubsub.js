const _events = {};

const on = (eventName, fn, pubsubId) => {
	//subscriber function
	if (pubsubId) fn.psId = pubsubId;
	_events[eventName] = _events[eventName] || [];
	if (Object.getPrototypeOf(fn).constructor === Array) {
		for (const callback of fn) {
			_events[eventName].push(callback);
		}
	} else _events[eventName].push(fn);
};

const off = (eventName, fn) => {
	//remover function
	if (_events[eventName]) {
		for (let i = 0; i < _events[eventName].length; i++) {
			if (_events[eventName][i] === fn) {
				_events[eventName].splice(i, 1);
				break;
			}
		}
	}
};

const emit = (eventName, data, fnName) => {
	//publish function
	let returnValue = null;
	if (_events[eventName]) {
		for (const fn of _events[eventName]) {
			if (fn.psId === fnName) returnValue = fn(data);
			else fn(data);
		}
	}
	return returnValue;
};

export default { on, off, emit };
