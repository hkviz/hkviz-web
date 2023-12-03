'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CSSProperties } from 'react';
import { MatSymbol } from '~/app/_components/mat-symbol';
import { allRoomDataBySceneName, mainRoomDataBySceneName } from '~/lib/viz/map-data/rooms';
import { type UseViewOptionsStore } from './_viewOptionsStore';
import Image from 'next/image';
import { HKMapRoom } from '~/lib/viz/charts/room-icon';

import shadeImg from '../../../../public/ingame-sprites/bestiary_hollow-shade_s.png';
import focusImg from '../../../../public/ingame-sprites/Inv_0029_spell_core.png';
import { Toggle } from '@/components/ui/toggle';
import { AggregationVariable } from '~/lib/viz/recording-files/run-aggregation-store';

function AggregationVariableToggles({
    useViewOptionsStore,
    variable,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    variable: AggregationVariable;
}) {
    const roomColors = useViewOptionsStore((s) => s.roomColors);
    const roomColorVar1 = useViewOptionsStore((s) => s.roomColorVar1);
    const setRoomColorVar1 = useViewOptionsStore((s) => s.setRoomColorVar1);

    const showVar1 = roomColors === '1-var';
    const showAnyToggles = showVar1;

    if (!showAnyToggles) return null;

    return (
        <TableCell className="w-1">
            {showVar1 && (
                <Toggle
                    variant="outline"
                    pressed={roomColorVar1 === variable}
                    onPressedChange={() => setRoomColorVar1(variable)}
                    className="data-[state=on]:bg-primary"
                >
                    <MatSymbol icon="palette" className="text-base" />
                </Toggle>
            )}
        </TableCell>
    );
}

function AggregationVariable({
    useViewOptionsStore,
    variable,
    children,
}: React.PropsWithChildren<{
    useViewOptionsStore: UseViewOptionsStore;
    variable: AggregationVariable;
}>) {
    const selectedRoom = useViewOptionsStore((s) => s.selectedRoom);
    const aggregatedVariableValue = useViewOptionsStore((s) =>
        selectedRoom ? s.aggregatedRunData?.countPerScene?.[selectedRoom]?.[variable] ?? 0 : 0,
    );

    if (!selectedRoom) return null;
    return (
        <TableRow>
            <TableHead className="flex flex-row items-center gap-2">{children}</TableHead>
            <TableCell className="w-1 pr-6 text-right">{aggregatedVariableValue}</TableCell>
            <AggregationVariableToggles useViewOptionsStore={useViewOptionsStore} variable={variable} />
        </TableRow>
    );
}

export function RoomInfo({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const selectedRoom = useViewOptionsStore((s) => s.selectedRoom);
    const selectedRoomPinned = useViewOptionsStore((s) => s.selectedRoomPinned);
    const setSelectedRoomPinned = useViewOptionsStore((s) => s.setSelectedRoomPinned);

    const mainRoomInfo = selectedRoom ? mainRoomDataBySceneName.get(selectedRoom) ?? null : null;
    const allRoomInfos = selectedRoom ? allRoomDataBySceneName.get(selectedRoom) ?? null : null;

    return (
        <Card
            className="grow overflow-auto bg-gradient-to-b from-transparent  to-transparent max-lg:basis-0 max-md:min-w-[300px]"
            style={
                {
                    '--tw-gradient-from':
                        mainRoomInfo?.color?.copy?.({ opacity: 0.1, s: 0.2 })?.toString() ?? 'transparent',
                    transition: '--tw-gradient-from .25s ease-in-out',
                } as CSSProperties
            }
        >
            <CardHeader className="flex flex-row items-center">
                {allRoomInfos && <HKMapRoom roomInfos={allRoomInfos} className="mr-4 h-14 w-14" />}

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
                                        <span className="text-left">
                                            {mainRoomInfo?.zoneNameFormatted ?? 'Unknown area'}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Area</TooltipContent>
                                </Tooltip>
                                {' - '}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <span className="text-left">
                                            {mainRoomInfo?.roomNameFormattedZoneExclusive ?? selectedRoom}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Room</TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </CardDescription>
                </div>

                <div className="grow" />

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
                            <AggregationVariable useViewOptionsStore={useViewOptionsStore} variable="deaths">
                                <Image className="w-8" src={shadeImg} alt="Knights shade symbol"></Image>
                                Deaths
                            </AggregationVariable>
                            <AggregationVariable useViewOptionsStore={useViewOptionsStore} variable="focusing">
                                <Image className="w-8" src={focusImg} alt="Focus inventory symbol"></Image>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <span>Focused</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        How often focusing has started, might not have been finished
                                    </TooltipContent>
                                </Tooltip>
                            </AggregationVariable>
                        </TableBody>
                    </Table>
                </CardContent>
            )}
        </Card>
    );
}