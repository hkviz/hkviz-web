'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { useSignals } from '@preact/signals-react/runtime';
import { LayoutDashboard, Palette, Spline } from 'lucide-react';
import { roomColoringStore } from '~/lib/stores/room-coloring-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { traceStore } from '~/lib/stores/trace-store';
import { uiStore } from '~/lib/stores/ui-store';

export function ViewOptions() {
    useSignals();
    const isV1 = uiStore.isV1.value;

    const roomVisibility = roomDisplayStore.roomVisibility.value;
    const traceVisibility = traceStore.visibility.value;
    const roomColorMode = roomColoringStore.colorMode.value;

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
                    <TableCell className={isV1 ? '' : 'px-1 py-2'}>
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
            </TableBody>
        </Table>
    );
}
