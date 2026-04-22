import { Accessor, createContext, createSignal, onCleanup, useContext } from 'solid-js';

export function createFocusContext() {
	const [focusBools, setFocusBools] = createSignal<Accessor<boolean>[]>([]);

	function createFocusSource() {
		const [isFocused, _setIsFocused] = createSignal(false);
		setFocusBools((prev) => [...prev, isFocused]);

		let unfocusTimeout: ReturnType<typeof setTimeout> | null = null;

		function setIsFocused(focused: boolean, options?: { delayUnfocus?: number }) {
			if (unfocusTimeout) {
				clearTimeout(unfocusTimeout);
			}
			if (focused) {
				_setIsFocused(true);
			} else {
				if (options?.delayUnfocus != null && options?.delayUnfocus > 0) {
					unfocusTimeout = setTimeout(() => {
						_setIsFocused(false);
					}, options.delayUnfocus);
				} else {
					_setIsFocused(false);
				}
			}
		}

		const unregister = () => {
			setFocusBools((prev) => prev.filter((it) => it !== isFocused));
		};

		onCleanup(unregister);

		return { isFocused, setIsFocused, unregister };
	}

	function hasFocus() {
		return focusBools().some((isFocused) => isFocused());
	}

	function focusedAttributes() {
		return {
			'data-focus-context': hasFocus() ? '' : undefined,
		};
	}

	return { createFocusSource, hasFocus, focusedAttributes };
}
export type FocusContextType = ReturnType<typeof createFocusContext>;
export const FocusContext = createContext<FocusContextType>();

export function useFocusContextOrNull() {
	return useContext(FocusContext) ?? null;
}

export function useFocusContext() {
	const context = useFocusContextOrNull();
	if (!context) {
		throw new Error('useFocusContext must be used within a FocusContext.Provider');
	}
	return context;
}
