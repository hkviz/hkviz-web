import { createContext, useContext } from 'solid-js';
import type { createLayoutPanelContext } from './layout-panel-context-create';

export type LayoutPanelContext = ReturnType<typeof createLayoutPanelContext>;
export const LayoutPanelContext = createContext<LayoutPanelContext>();

export function useLayoutPanelContextOrNull() {
	const context = useContext(LayoutPanelContext);
	return context ?? null;
}

export function useLayoutPanelContext() {
	const context = useContext(LayoutPanelContext);
	if (!context) {
		throw new Error('useLayoutPanelContext must be used within a LayoutPanelContext.Provider');
	}
	return context;
}
