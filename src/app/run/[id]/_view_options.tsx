'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { LayoutDashboard, Palette, Spline } from 'lucide-react';
import { type UseViewOptionsStore } from './_viewOptionsStore';

export function ViewOptions({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
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
                    <TableCell>
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
                </TableRow>
                <TableRow>
                    <TableHead>
                        <Label className="flex items-center" htmlFor="traceVisibilitySelectTrigger">
                            <Spline className="mr-2 h-5 w-5" />
                            Traces
                        </Label>
                    </TableHead>
                    <TableCell>
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
                </TableRow>
                <TableRow>
                    <TableHead>
                        <Label className="flex items-center" htmlFor="roomColorSelectTrigger">
                            <Palette className="mr-2 w-5 h-5" />
                            Room colors
                        </Label>
                    </TableHead>
                    <TableCell>
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
                </TableRow>
            </TableBody>
        </Table>
    );
}
