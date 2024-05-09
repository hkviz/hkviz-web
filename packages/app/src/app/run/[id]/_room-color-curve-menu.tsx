import { ContextMenuItem } from '@/components/ui/context-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type AggregationVariable, roomColorCurves } from '@hkviz/viz';
import { useSignals } from '@preact/signals-react/runtime';
import { roomColoringStore } from '~/lib/stores/room-coloring-store';

export function RoomColorCurveContextMenuItems({ variable }: { variable: AggregationVariable }) {
    return (
        <>
            {roomColorCurves.map((curve) => (
                <ContextMenuItem
                    key={curve.name}
                    onClick={() => {
                        roomColoringStore.setRoomColorVar1(variable);
                        roomColoringStore.setRoomColorVar1Curve(curve);
                    }}
                >
                    {curve.name}
                </ContextMenuItem>
            ))}
        </>
    );
}

export function RoomColorCurveSelect({ variable }: { variable: AggregationVariable }) {
    useSignals();
    const roomColorVar1Curve = roomColoringStore.var1Curve.valuePreact;

    function handleValueChange(value: string): void {
        roomColoringStore.setRoomColorVar1(variable);
        roomColoringStore.setRoomColorVar1Curve(roomColorCurves.find((curve) => curve.name === value)!);
    }

    return (
        <Select onValueChange={handleValueChange} value={roomColorVar1Curve.name}>
            <SelectTrigger className="h-8 w-fit py-1 pl-2 pr-1 text-[0.7rem]">
                <SelectValue placeholder="Theme">{roomColorVar1Curve.shortName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                {roomColorCurves.map((curve) => (
                    <SelectItem key={curve.name} value={curve.name}>
                        {curve.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
