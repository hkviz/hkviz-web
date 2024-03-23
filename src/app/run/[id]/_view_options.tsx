'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { LayoutDashboard, Palette, Spline } from 'lucide-react';
import { type UseViewOptionsStore } from './_viewOptionsStore';

export function ViewOptions({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const isV1 = useViewOptionsStore((s) => s.isV1());

    const roomVisibility = useViewOptionsStore((s) => s.roomVisibility);
    const setRoomVisibility = useViewOptionsStore((s) => s.setRoomVisibility);

    const traceVisibility = useViewOptionsStore((s) => s.traceVisibility);
    const setTraceVisibility = useViewOptionsStore((s) => s.setTraceVisibility);

    const roomColors = useViewOptionsStore((s) => s.roomColorMode);
    const setRoomColors = useViewOptionsStore((s) => s.setRoomColors);

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
                        <Select value={roomVisibility} onValueChange={setRoomVisibility}>
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
                        <Select value={traceVisibility} onValueChange={setTraceVisibility}>
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
                        <Select value={roomColors} onValueChange={setRoomColors}>
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
