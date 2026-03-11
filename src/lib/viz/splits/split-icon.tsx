import { Timer } from 'lucide-solid';
import { Component } from 'solid-js';

export const SplitIcon: Component<{ class?: string }> = (props) => {
	return <Timer class={props.class} />;
};
