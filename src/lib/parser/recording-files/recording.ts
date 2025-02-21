import { createSignal, Signal } from 'solid-js';
import { type HeroStateField } from '../hero-state/hero-states';
import { type PlayerDataField } from '../player-data/player-data';
import { type RecordingFileVersion } from '../recording-file-version';
import { binarySearchLastIndexBefore, raise } from '../util';
import {
	AppendOnlyOrArray,
	AppendOnlySignalArray,
	createAppendOnlyReactiveArray,
	isAppendOnlyReactiveArray,
} from '../util/array/append-only-signal-array';
import { FrameEndEvent } from './events/frame-end-event';
import { type HKVizModVersionEvent } from './events/hkviz-mod-version-event';
import { type ModdingInfoEvent, type ModInfo } from './events/modding-info-event';
import { PlayerDataEvent } from './events/player-data-event';
import { PlayerPositionEvent } from './events/player-position-event';
import { RecordingEventBase, type RecordingEventBaseOptions } from './events/recording-event-base';
import { SceneEvent } from './events/scene-event';
import { ParseRecordingFileContext } from './recording-file-parser';
import { createRecordingSplits, type RecordingSplit } from './recording-splits';
import { CombineRecordingsContext } from './combine-recording-context';

type RecordingFileVersionEventOptions = RecordingEventBaseOptions & Pick<RecordingFileVersionEvent, 'version'>;
export class RecordingFileVersionEvent extends RecordingEventBase {
	public version: RecordingFileVersion;

	constructor(options: RecordingFileVersionEventOptions) {
		super(options);
		this.version = options.version;
	}
}

export function isPlayerDataEventOfField<TField extends PlayerDataField>(
	event: RecordingEvent,
	field: TField,
): event is PlayerDataEvent<TField> {
	return event instanceof PlayerDataEvent && event.field === field;
}

export function isPlayerDataEventWithFieldType<FieldType extends PlayerDataField['type']>(
	event: RecordingEvent,
	type: FieldType,
): event is PlayerDataEvent<Extract<PlayerDataField, { type: FieldType }>> {
	return event instanceof PlayerDataEvent && event.field.type === type;
}

type HeroStateEventOptions = RecordingEventBaseOptions &
	Pick<HeroStateEvent, 'field' | 'value' | 'previousPlayerPositionEvent'>;
export class HeroStateEvent extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null = null;
	public readonly field: HeroStateField;
	public readonly value: boolean;

	constructor(options: HeroStateEventOptions) {
		super(options);
		this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
		this.field = options.field;
		this.value = options.value;
	}
}

type SpellFireballEventOptions = RecordingEventBaseOptions & Pick<SpellFireballEvent, 'previousPlayerPositionEvent'>;
export class SpellFireballEvent extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

	constructor(options: SpellFireballEventOptions) {
		super(options);
		this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
	}
}

type SpellUpEventOptions = RecordingEventBaseOptions & Pick<SpellUpEvent, 'previousPlayerPositionEvent'>;
export class SpellUpEvent extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

	constructor(options: SpellUpEventOptions) {
		super(options);
		this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
	}
}

type SpellDownEventOptions = RecordingEventBaseOptions & Pick<SpellDownEvent, 'previousPlayerPositionEvent'>;
export class SpellDownEvent extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

	constructor(options: SpellDownEventOptions) {
		super(options);
		this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
	}
}

export type RecordingEvent =
	| SceneEvent
	| PlayerPositionEvent
	| PlayerDataEvent<PlayerDataField>
	| RecordingFileVersionEvent
	| HeroStateEvent
	| SpellFireballEvent
	| SpellDownEvent
	| SpellUpEvent
	| FrameEndEvent
	| ModdingInfoEvent
	| HKVizModVersionEvent;

export class ParsedRecording {
	events: readonly RecordingEvent[] | AppendOnlySignalArray<RecordingEvent>;
	#isLive: boolean;
	isLive(): this is ParsedRecording & { events: AppendOnlySignalArray<RecordingEvent> } {
		return this.#isLive;
	}

	constructor(
		events: RecordingEvent[],
		public unknownEvents: number,
		public parsingErrors: number,
		public readonly combinedPartNumber: number | null,
		isLive: boolean = false,
	) {
		this.events = isLive ? createAppendOnlyReactiveArray(events) : events;
		this.#isLive = isLive;
	}

	lastEvent() {
		return (
			this.events[this.events.length - 1] ??
			raise(new Error(`Recording file ${this.combinedPartNumber} does not contain any events`))
		);
	}
	firstEvent() {
		return (
			this.events[0] ?? raise(new Error(`Recording file ${this.combinedPartNumber} does not contain any events`))
		);
	}
	makeUnlive() {
		this.#isLive = false;
		if (isAppendOnlyReactiveArray(this.events)) {
			this.events = this.events.unwrap();
		}
	}
	append(events: RecordingEvent[], currentParsingContext: ParseRecordingFileContext) {
		if (!this.isLive()) {
			throw new Error('Cannot append to non-live recording');
		}
		this.events.push(...events);
		this.unknownEvents += currentParsingContext.unknownEvents;
		this.parsingErrors += currentParsingContext.parsingErrors;
	}
}

export class CombinedRecording {
	public events: AppendOnlyOrArray<RecordingEvent>;

	public playerDataEventsPerField = new Map<PlayerDataField, AppendOnlyOrArray<PlayerDataEvent<PlayerDataField>>>();
	private lastPlayerDataEventsByField = new Map<PlayerDataField, Signal<PlayerDataEvent<PlayerDataField> | null>>();

	public frameEndEvents: AppendOnlyOrArray<FrameEndEvent>;
	public sceneEvents: AppendOnlyOrArray<SceneEvent>;
	public splits: AppendOnlyOrArray<RecordingSplit>;
	public playerPositionEventsWithTracePosition: AppendOnlyOrArray<PlayerPositionEvent>;

	#isLive: boolean;
	isLive(): this is CombinedRecording & { events: AppendOnlySignalArray<RecordingEvent> } {
		return this.#isLive;
	}

	constructor(
		events: RecordingEvent[],
		public unknownEvents: number,
		public parsingErrors: number,
		// TODO fix all
		public readonly allModVersions: ModInfo[],
		public readonly allHkVizModVersions: string[],
		public readonly combiningContext: CombineRecordingsContext,
		isLive: boolean = false,
	) {
		this.#isLive = isLive;

		this.events = isLive ? createAppendOnlyReactiveArray(events) : events;
		this.frameEndEvents = isLive ? createAppendOnlyReactiveArray<FrameEndEvent>([]) : [];
		this.sceneEvents = isLive ? createAppendOnlyReactiveArray<SceneEvent>([]) : [];
		this.splits = isLive ? createAppendOnlyReactiveArray<RecordingSplit>([]) : [];
		this.playerPositionEventsWithTracePosition = isLive
			? createAppendOnlyReactiveArray<PlayerPositionEvent>([])
			: [];

		this.#processAddedEvents(events);

		this.splits = createRecordingSplits(this);
	}

	append(events: RecordingEvent[]) {
		if (!this.isLive()) {
			throw new Error('Cannot append to non-live recording');
		}
		this.events.push(...events);
		this.#processAddedEvents(events);
	}

	#processAddedEvents(events: RecordingEvent[]) {
		for (const event of events) {
			if (event instanceof PlayerDataEvent) {
				const eventsOfField = this.playerDataEventsPerField.get(event.field) ?? [];
				eventsOfField.push(event);
				this.playerDataEventsPerField.set(event.field, eventsOfField);
				this.#getLastPlayerDataEventSignal(event.field)[1](event);
			} else if (event instanceof SceneEvent) {
				this.sceneEvents.push(event);
			} else if (event instanceof FrameEndEvent) {
				this.frameEndEvents.push(event);
			} else if (event instanceof PlayerPositionEvent) {
				if (
					event.mapPosition != null &&
					event.previousPlayerPositionEventWithMapPosition?.mapPosition != null &&
					!event.previousPlayerPositionEventWithMapPosition.mapPosition.equals(event.mapPosition)
				) {
					this.playerPositionEventsWithTracePosition.push(event);
				}
			}
		}
	}

	#getLastPlayerDataEventSignal<TField extends PlayerDataField>(field: TField): Signal<PlayerDataEvent<TField>> {
		const signal = this.lastPlayerDataEventsByField.get(field);
		if (signal == null) {
			// eslint-disable-next-line solid/reactivity
			const newSignal = createSignal<PlayerDataEvent<PlayerDataField> | null>(null);
			this.lastPlayerDataEventsByField.set(field, newSignal);
			return newSignal as unknown as Signal<PlayerDataEvent<TField>>;
		}
		return signal as unknown as Signal<PlayerDataEvent<TField>>;
	}

	lastPlayerDataEventOfField<TField extends PlayerDataField>(field: TField): PlayerDataEvent<TField> | null {
		const signal = this.#getLastPlayerDataEventSignal(field);
		return signal[0]();
	}

	allPlayerDataEventsOfField<TField extends PlayerDataField>(field: TField): PlayerDataEvent<TField>[] {
		return (this.playerDataEventsPerField.get(field) as any) ?? [];
	}

	sceneEventIndexFromMs(ms: number): number {
		return binarySearchLastIndexBefore(this.sceneEvents, ms, (it) => it.msIntoGame);
	}

	sceneEventFromMs(ms: number): SceneEvent | null {
		const index = this.sceneEventIndexFromMs(ms);
		return this.sceneEvents[index] ?? null;
	}

	frameEndEventIndexFromMs(ms: number): number {
		return binarySearchLastIndexBefore(this.frameEndEvents, ms, (it) => it.msIntoGame);
	}
	frameEndEventFromMs(ms: number): FrameEndEvent | null {
		const index = this.frameEndEventIndexFromMs(ms);
		return this.frameEndEvents[index] ?? null;
	}

	lastEvent() {
		return this.events.at(-1) ?? raise(new Error('CombinedRecording does not contain any events'));
	}

	firstEvent() {
		return this.events[0] ?? raise(new Error('CombinedRecording does not contain any events'));
	}
}
