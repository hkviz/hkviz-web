'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CSSProperties } from 'react';
import { MatSymbol } from '~/app/_components/mat-symbol';
import { mainRoomDataBySceneName } from '~/lib/viz/map-data/rooms';
import { type UseViewOptionsStore } from './_viewOptionsStore';
import Image from 'next/image';

import shadeImg from '../../../../public/ingame-sprites/bestiary_hollow-shade_s.png';
import focusImg from '../../../../public/ingame-sprites/Inv_0029_spell_core.png';

export function RoomInfo({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const selectedRoom = useViewOptionsStore((s) => s.selectedRoom);
    const selectedRoomPinned = useViewOptionsStore((s) => s.selectedRoomPinned);
    const setSelectedRoomPinned = useViewOptionsStore((s) => s.setSelectedRoomPinned);

    const roomInfo = selectedRoom ? mainRoomDataBySceneName.get(selectedRoom) ?? null : null;

    const aggregatedRunData = useViewOptionsStore((s) => s.aggregatedRunData);

    return (
        <Card
            className="grow overflow-auto bg-gradient-to-b from-transparent  to-transparent max-lg:basis-0 max-md:min-w-[300px]"
            style={
                {
                    '--tw-gradient-from':
                        roomInfo?.color?.copy?.({ opacity: 0.1, s: 0.2 })?.toString() ?? 'transparent',
                    transition: '--tw-gradient-from .25s ease-in-out',
                } as CSSProperties
            }
        >
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Room info</CardTitle>
                    <CardDescription>
                        {!selectedRoom && (
                            <span className="text-sm opacity-50">Hover or click a room to view analytics</span>
                        )}
                        {selectedRoom && (
                            <div>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <span>{roomInfo?.zoneNameFormatted ?? 'Unknown area'}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>Area</TooltipContent>
                                </Tooltip>
                                {' - '}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <span>{roomInfo?.roomNameFormattedZoneExclusive ?? selectedRoom}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>Room</TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </CardDescription>
                </div>

                {selectedRoomPinned && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => setSelectedRoomPinned(false)}>
                                <MatSymbol icon="push_pin" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Remove pin. Will automatically select the room when you hover over it.
                        </TooltipContent>
                    </Tooltip>
                )}
            </CardHeader>
            {selectedRoom && (
                <CardContent className="px-0">
                    <Table className="w-full">
                        <TableBody>
                            <TableRow>
                                <TableHead className="flex flex-row items-center gap-2">
                                    <Image className="w-8" src={shadeImg} alt="Knights shade symbol"></Image>
                                    Deaths
                                </TableHead>
                                <TableCell className="pr-6 text-right">
                                    {aggregatedRunData?.countPerScene?.[selectedRoom]?.deaths ?? 0}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableHead className="flex flex-row items-center gap-2">
                                    <Image className="w-8" src={focusImg} alt="Focus inventory symbol"></Image>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <span>Focused</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            How often focusing has started, might not have been finished
                                        </TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableCell className="pr-6 text-right">
                                    {aggregatedRunData?.countPerScene?.[selectedRoom]?.focusing ?? 0}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            )}
        </Card>
    );
}
