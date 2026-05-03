import { TimerIcon } from 'lucide-solid';
import type { Component } from 'solid-js';

export const SplitIcon: Component<{ class?: string }> = (props) => {
	return <TimerIcon class={props.class} />;
};
