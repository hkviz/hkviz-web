import { For } from 'solid-js';
import { ContextMenuItem } from '~/components/ui/context-menu';
import { roomColorCurves } from '../color-curves';
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
