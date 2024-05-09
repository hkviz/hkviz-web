import { type Component } from 'solid-js';
import { render } from 'solid-js/web';

export const RunSplits: Component = () => {
    return <></>;
};

export function renderRunSplits(wrapper: HTMLElement): () => void {
    return render(() => <RunSplits />, wrapper);
}
