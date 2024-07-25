const _events = {};

const on = (eventName, ...fns) => {
	_events[eventName] = _events[eventName] || [];
	// biome-ignore lint/complexity/noForEach: <explanation>
	fns.forEach((fn) => _events[eventName].push(fn));
};

const off = (eventName, fn) => {
	if (_events[eventName]) {
		for (let i = 0; i < _events[eventName].length; i++) {
			if (_events[eventName][i] === fn) {
				_events[eventName].splice(i, 1);
				break;
			}
		}
	}
};

const emit = (eventName, data) => {
	if (_events[eventName])
		// biome-ignore lint/complexity/noForEach: <explanation>
		_events[eventName].forEach((fn) => fn(data));
};

export default { on, off, emit };
