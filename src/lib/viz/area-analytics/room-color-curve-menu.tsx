import { For } from 'solid-js';
import { ContextMenuItem } from '~/components/ui/context-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { cn } from '~/lib/utils';
import { roomColorCurveById, RoomColorCurveId, roomColorCurveIds, roomColorCurves } from '../color-curves';
import { useRoomColoringStore } from '../store';
import { AggregationVariable } from '../store/aggregations/aggregate-recording';

export function RoomColorCurveContextMenuItems(props: { variable: AggregationVariable }) {
	const roomColoringStore = useRoomColoringStore();
	return (
		<For each={roomColorCurves}>
			{(curve) => (
				<ContextMenuItem
					onClick={() => {
						roomColoringStore.setRoomColorVar1(props.variable);
						roomColoringStore.setRoomColorVar1Curve(curve);
					}}
				>
					{curve.name}
				</ContextMenuItem>
			)}
		</For>
	);
}

export function RoomColorCurveSelect(props: { variable: AggregationVariable; class?: string }) {
	const roomColoringStore = useRoomColoringStore();
	const roomColorVar1Curve = roomColoringStore.var1Curve;

	function handleValueChange(value: RoomColorCurveId | null): void {
		if (!value) return;
		const curve = roomColorCurveById.get(value);
		if (!curve) return;
		roomColoringStore.setRoomColorVar1(props.variable);
		roomColoringStore.setRoomColorVar1Curve(curve);
	}

	return (
		<Select
			onChange={handleValueChange}
			value={roomColorVar1Curve().id}
			multiple={false}
			options={roomColorCurveIds}
			optionTextValue={(id) => roomColorCurveById.get(id)?.name ?? id}
			itemComponent={(props) => (
				<SelectItem item={props.item}>{roomColorCurveById.get(props.item.rawValue)?.name}</SelectItem>
			)}
		>
			<SelectTrigger
				class={cn('h-8 w-fit border-0 py-1 pr-1 pl-2 text-[0.65rem]', props.class)}
				iconClass="size-3"
				aria-label="Curve"
			>
				<SelectValue<RoomColorCurveId>>
					{(state) => roomColorCurveById.get(state.selectedOption())?.shortName ?? ''}
				</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	);
}
