import { Accessor, createSignal, Setter } from 'solid-js';

const frozenSetter = () => {
	throw new Error('Cannot set value of frozen signal');
};

const frozenFrozen = () => {
	return;
};

export interface FreezableSignal<T> {
	get: Accessor<T>;
	set: Setter<T>;
	freeze(): void;
}

/**
 * A signal that can be frozen. When frozen, the value is fixed and cannot be changed.
 * Therefore, will not contribute to the reactive graph.
 *
 * If already frozen when created, the signal will never be created.
 */
export function createFreezableSignal<T>(value: T, frozen: boolean) {
	if (frozen) {
		return { get: () => value, set: frozenSetter, freeze: frozenFrozen };
	}

	let _frozen = false;
	let _value = value;
	const [_get, _set] = createSignal<T>(value);

	function get(): T {
		if (_frozen) {
			return value;
		}
		return _get();
	}
	const set: Setter<T> = ((v: any) => {
		if (_frozen) {
			throw new Error('Cannot set value of frozen signal');
		}
		return _set(v);
	}) as any;

	function freeze() {
		if (_frozen) {
			return;
		}
		_frozen = true;
		_value = _get();
	}

	return { get, set, freeze };
}
