'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { useSignals } from '@preact/signals-react/runtime';
import { LayoutDashboard, Palette, Spline, Text } from 'lucide-react';
import { useId } from 'react';
import { roomColoringStore } from '~/lib/stores/room-coloring-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { traceStore } from '~/lib/stores/trace-store';
import { uiStore } from '~/lib/stores/ui-store';

export function ViewOptions() {
    useSignals();
    const id = useId();

    const isV1 = uiStore.isV1.value;

    const roomVisibility = roomDisplayStore.roomVisibility.value;
    const traceVisibility = traceStore.visibility.value;
    const roomColorMode = roomColoringStore.colorMode.value;

    const showAreaNames = roomDisplayStore.showAreaNames.value;
    const showSubAreaNames = roomDisplayStore.showSubAreaNames.value;

    return (
        <Table className="w-full">
            <TableBody>
                <TableRow>
                    <TableHead>
                        <Label className="flex items-center" htmlFor="visibleRoomSelectTrigger">
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            Visible rooms
                        </Label>
                    </TableHead>
                    <TableCell className={isV1 ? '' : 'p-1'}>
                        <Select
                            value={roomVisibility}
                            onValueChange={(v) => {
                                roomDisplayStore.roomVisibility.value = v as any;
                            }}
                        >
                            <SelectTrigger id="visibleRoomSelectTrigger">
                                <SelectValue placeholder="Room visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All (Spoilers)</SelectItem>
                                <SelectItem value="visited-animated">Animated</SelectItem>
                                <SelectItem value="visited">Visited</SelectItem>
                            </SelectContent>
                        </Select>
                    </TableCell>
                    {/* {!isV1 && (
                        <TableCell className="p-0 pr-1">
                            <HelpButton href={analyticsGuideUrl('room-visibility')} />
                        </TableCell>
                    )} */}
                </TableRow>
                <TableRow>
                    <TableHead>
                        <Label className="flex items-center" htmlFor="traceVisibilitySelectTrigger">
                            <Spline className="mr-2 h-5 w-5" />
                            Traces
                        </Label>
                    </TableHead>
                    <TableCell className={isV1 ? '' : 'p-1'}>
                        <Select
                            value={traceVisibility}
                            onValueChange={(v) => {
                                traceStore.visibility.value = v as any;
                            }}
                        >
                            <SelectTrigger id="traceVisibilitySelectTrigger">
                                <SelectValue placeholder="Trace visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="animated">Animated</SelectItem>
                                <SelectItem value="hide">Hidden</SelectItem>
                            </SelectContent>
                        </Select>
                    </TableCell>
                    {/* {!isV1 && (
                        <TableCell className="p-0 pr-1">
                            <HelpButton href={analyticsGuideUrl('player-movement-and-traces')} />
                        </TableCell>
                    )} */}
                </TableRow>
                {isV1 && (
                    <TableRow>
                        <TableHead>
                            <Label className="flex items-center" htmlFor="roomColorSelectTrigger">
                                <Palette className="mr-2 h-5 w-5" />
                                Room colors
                            </Label>
                        </TableHead>
                        <TableCell className={isV1 ? '' : 'p-2'}>
                            <Select
                                value={roomColorMode}
                                onValueChange={(m) => {
                                    roomColoringStore.setRoomColorMode(m as any);
                                }}
                            >
                                <SelectTrigger id="roomColorSelectTrigger">
                                    <SelectValue placeholder="Room colors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="area">Area</SelectItem>
                                    <SelectItem value="1-var">1 variable</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                        {/* {!isV1 && (
                        <TableCell className="p-0 pr-1">
                            <HelpButton href={analyticsGuideUrl('map-coloring-by-variables')} />
                        </TableCell>
                    )} */}
                    </TableRow>
                )}
                {!isV1 && (
                    <TableRow>
                        <TableHead>
                            <Label className="flex items-center">
                                <Text className="mr-2 h-5 w-5" />
                                Area names
                            </Label>
                        </TableHead>
                        <td className="p-2 py-1.5 pr-2">
                            <div className="flex flex-col">
                                <div className="flex flex-row items-center">
                                    <label
                                        htmlFor={id + 'show_area_names'}
                                        className="grow py-1.5 pr-2 text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Main areas
                                    </label>
                                    <Checkbox
                                        id={id + 'show_area_names'}
                                        checked={showAreaNames}
                                        onCheckedChange={(c) => (roomDisplayStore.showAreaNames.value = c === true)}
                                    />
                                </div>
                                <div className="flex flex-row items-center">
                                    <label
                                        htmlFor={id + 'show_sub_area_names'}
                                        className="grow py-1.5 pr-2 text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Sub areas
                                    </label>
                                    <Checkbox
                                        id={id + 'show_sub_area_names'}
                                        checked={showSubAreaNames}
                                        onCheckedChange={(c) => (roomDisplayStore.showSubAreaNames.value = c === true)}
                                    />
                                </div>
                            </div>
                        </td>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
