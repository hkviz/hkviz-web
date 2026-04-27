import { Component } from 'solid-js';
import { FrameEndEventHollow } from '~/lib/parser/recording-files/events-hollow/frame-end-event-hollow';
import { FrameEndEventBase } from '~/lib/parser/recording-files/events-shared/frame-end-event-base';
import { FrameEndEventSilk } from '~/lib/parser/recording-files/events-silk/frame-end-event-silk';
import { ColorClasses } from '../../colors';
import { LocalizedString } from '../../store/localization-store';

export type NumberKeyOf<T> = keyof {
	[TField in keyof T as T[TField] extends number ? (TField extends string ? TField : never) : never]: number;
} &
	string;

export type LineChartVariableDescription = {
	name: LocalizedString;
	description: string;
	UnitIcon: Component<{ class?: string }>;
	order: number;
	color: ColorClasses;
	display: 'default-shown' | 'default-hidden' | 'never';
} & (
	| {
			game: 'hollow';
			key: NumberKeyOf<FrameEndEventHollow>;
	  }
	| {
			game: 'silk';
			key: NumberKeyOf<FrameEndEventSilk>;
	  }
);

export type LineChartVariableKey = LineChartVariableDescription['key'];

export function isShownInGraph(it: LineChartVariableDescription): boolean {
	return it.display !== 'never';
}

export function getChartVarValue(
	event: FrameEndEventBase | undefined | null,
	variable: LineChartVariableDescription,
): number {
	if (event == null) return 0;
	if (variable.game === 'hollow' && event instanceof FrameEndEventHollow) {
		return event[variable.key];
	} else if (variable.game === 'silk' && event instanceof FrameEndEventSilk) {
		return event[variable.key];
	}
	console.warn(`Event type does not match variable game type, event:`, event, `variable:`, variable);
	return 0;
}
