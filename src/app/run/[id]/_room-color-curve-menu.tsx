import { ContextMenuItem } from '@/components/ui/context-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type AggregationVariable } from '~/lib/viz/recording-files/run-aggregation-store';
import { roomColorCurves } from './_room-color-curve';
import { type UseViewOptionsStore } from './_viewOptionsStore';

export function RoomColorCurveContextMenuItems({
    useViewOptionsStore,
    variable,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    variable: AggregationVariable;
}) {
    const setRoomColorVar1 = useViewOptionsStore((s) => s.setRoomColorVar1);
    const setRoomColorVar1Curve = useViewOptionsStore((s) => s.setRoomColorVar1Curve);

    return (
        <>
            {roomColorCurves.map((curve) => (
                <ContextMenuItem
                    key={curve.name}
                    onClick={() => {
                        setRoomColorVar1(variable);
                        setRoomColorVar1Curve(curve);
                    }}
                >
                    {curve.name}
                </ContextMenuItem>
            ))}
        </>
    );
}

export function RoomColorCurveSelect({
    useViewOptionsStore,
    variable,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    variable: AggregationVariable;
}) {
    const roomColorVar1Curve = useViewOptionsStore((s) => s.roomColorVar1Curve);
    const setRoomColorVar1 = useViewOptionsStore((s) => s.setRoomColorVar1);
    const setRoomColorVar1Curve = useViewOptionsStore((s) => s.setRoomColorVar1Curve);

    function handleValueChange(value: string): void {
        setRoomColorVar1(variable);
        setRoomColorVar1Curve(roomColorCurves.find((curve) => curve.name === value)!);
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
