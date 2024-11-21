import { For } from 'solid-js';
import { ContextMenuItem } from '~/components/ui/context-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { roomColorCurves } from '../color-curves';
import { AggregationVariable, roomColoringStore } from '../store';

export function RoomColorCurveContextMenuItems(props: { variable: AggregationVariable }) {
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

export function RoomColorCurveSelect(props: { variable: AggregationVariable }) {
	const roomColorVar1Curve = roomColoringStore.var1Curve;

	function handleValueChange(value: string | null): void {
		roomColoringStore.setRoomColorVar1(props.variable);
		roomColoringStore.setRoomColorVar1Curve(roomColorCurves.find((curve) => curve.name === value)!);
	}

	return (
		<Select
			onChange={handleValueChange}
			value={roomColorVar1Curve().name}
			multiple={false}
			options={roomColorCurves.map((curve) => curve.name)}
			itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
		>
			<SelectTrigger class="h-8 w-fit py-1 pl-2 pr-1 text-[0.7rem]" aria-label="Curve">
				<SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	);
}
