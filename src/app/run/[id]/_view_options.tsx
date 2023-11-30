'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { MatSymbol } from '~/app/_components/mat-symbol';
import { type UseViewOptionsStore } from './_viewOptionsStore';

export function ViewOptions({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const roomVisibility = useViewOptionsStore((s) => s.roomVisibility);
    const setRoomVisibility = useViewOptionsStore((s) => s.setRoomVisibility);

    const traceVisibility = useViewOptionsStore((s) => s.traceVisibility);
    const setTraceVisibility = useViewOptionsStore((s) => s.setTraceVisibility);

    return (
        <Card className="grow max-lg:basis-0 max-md:min-w-[300px]">
            <CardHeader>
                <CardTitle>View</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <Table className="w-full">
                    <TableBody>
                        <TableRow>
                            <TableHead>
                                <Label className="flex items-center" htmlFor="visibleRoomSelectTrigger">
                                    <MatSymbol className="mr-2" icon="widgets" />
                                    Visible rooms
                                </Label>
                            </TableHead>
                            <TableCell>
                                <Select value={roomVisibility} onValueChange={setRoomVisibility}>
                                    <SelectTrigger id="visibleRoomSelectTrigger">
                                        <SelectValue placeholder="Room visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="mapped">Mapped</SelectItem>
                                        <SelectItem value="visited">Visited</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableHead>
                                <Label className="flex items-center" htmlFor="visibleRoomSelectTrigger">
                                    <MatSymbol className="mr-2" icon="timeline" />
                                    Traces
                                </Label>
                            </TableHead>
                            <TableCell>
                                <Select value={traceVisibility} onValueChange={setTraceVisibility}>
                                    <SelectTrigger id="visibleRoomSelectTrigger">
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
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
