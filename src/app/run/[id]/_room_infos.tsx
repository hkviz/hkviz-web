'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { useMemo, type CSSProperties } from 'react';
import { HKMapRoom } from '~/lib/viz/charts/room-icon';
import { allRoomDataBySceneName, mainRoomDataBySceneName } from '~/lib/viz/map-data/rooms';
import { type UseViewOptionsStore } from './_viewOptionsStore';

import { Toggle } from '@/components/ui/toggle';
import { Palette, Pin, PinOff } from 'lucide-react';
import { useThemeStore } from '~/app/_components/theme-store';
import { getRelatedVirtualRoomNames } from '~/lib/viz/map-data/room-groups';
import {
    AggregationVariable,
    aggregationVariableInfos,
    aggregationVariables,
    formatAggregatedVariableValue,
} from '~/lib/viz/recording-files/run-aggregation-store';

function AggregationVariableToggles({
    useViewOptionsStore,
    variable,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    variable: AggregationVariable;
}) {
    const roomColors = useViewOptionsStore((s) => s.roomColorMode);
    const roomColorVar1 = useViewOptionsStore((s) => s.roomColorVar1);
    const setRoomColorVar1 = useViewOptionsStore((s) => s.setRoomColorVar1);

    // const showVar1 = roomColors === '1-var';
    const showVar1 = true;
    const showAnyToggles = showVar1;

    if (!showAnyToggles) return null;

    return (
        <TableCell className="w-1 p-0 pr-1">
            {showVar1 && (
                <Toggle
                    variant="outline"
                    pressed={roomColorVar1 === variable && roomColors === '1-var'}
                    onPressedChange={() => setRoomColorVar1(variable)}
                    className="rounded-full data-[state=on]:bg-primary"
                >
                    <Palette className="h-4 w-4 text-base" />
                </Toggle>
            )}
        </TableCell>
    );
}

function AggregationVariable({
    useViewOptionsStore,
    variable,
}: React.PropsWithChildren<{
    useViewOptionsStore: UseViewOptionsStore;
    variable: AggregationVariable;
}>) {
    const selectedRoom = useViewOptionsStore((s) => s.selectedRoom);
    const aggregatedVariableValue = useViewOptionsStore((s) =>
        selectedRoom ? s.aggregatedRunData?.countPerScene?.[selectedRoom]?.[variable] ?? 0 : 0,
    );
    const variableInfo = aggregationVariableInfos[variable];

    const Icon = 'Icon' in variableInfo ? variableInfo?.Icon : null;

    if (!selectedRoom) return null;
    return (
        <TableRow>
            <TableHead className="flex items-center p-1 pl-3">
                <Tooltip>
                    <TooltipTrigger>
                        <div className="flex flex-row items-center justify-center gap-2">
                            {'image' in variableInfo && (
                                <Image
                                    className="w-6"
                                    src={variableInfo.image}
                                    alt={'Aggregation Variable icon'}
                                    aria-hidden={true}
                                ></Image>
                            )}
                            {Icon && <Icon className="h-5 w-5" />}
                            <span>{variableInfo.name}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>{variableInfo.description}</TooltipContent>
                </Tooltip>
            </TableHead>
            <TableCell className="w-1 p-1 pr-6 text-right">
                {formatAggregatedVariableValue(variable, aggregatedVariableValue)}
            </TableCell>
            <AggregationVariableToggles useViewOptionsStore={useViewOptionsStore} variable={variable} />
        </TableRow>
    );
}

function AggregationVariables({
    useViewOptionsStore,
}: React.PropsWithChildren<{
    useViewOptionsStore: UseViewOptionsStore;
}>) {
    const aggregatedMaxs = useViewOptionsStore((s) => s.aggregatedRunData?.maxOverScenes);
    const viewNeverHappenedAggregations = useViewOptionsStore((s) => s.viewNeverHappenedAggregations);
    const setViewNeverHappenedAggregations = useViewOptionsStore((s) => s.setViewNeverHappenedAggregations);

    const neverHappenedEvents = aggregationVariables.filter((variable) => !aggregatedMaxs?.[variable]);

    return (
        <>
            {aggregationVariables
                .filter((it) => viewNeverHappenedAggregations || !neverHappenedEvents.includes(it))
                .map((variable) => (
                    <AggregationVariable key={variable} useViewOptionsStore={useViewOptionsStore} variable={variable} />
                ))}
            {neverHappenedEvents.length !== 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">
                        {viewNeverHappenedAggregations ? (
                            <p className="flex flex-col items-center">
                                <Button
                                    className="h-fit"
                                    variant="outline"
                                    onClick={() => setViewNeverHappenedAggregations(false)}
                                >
                                    Hide never occurred events
                                </Button>
                            </p>
                        ) : (
                            <p className="flex h-fit flex-col items-center">
                                <Button
                                    className="h-fit"
                                    variant="outline"
                                    onClick={() => setViewNeverHappenedAggregations(true)}
                                >
                                    Show never occurred events (Spoilers)
                                </Button>
                            </p>
                        )}
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

export function RoomInfo({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const isV1 = useViewOptionsStore((s) => s.isV1());
    const selectedRoom = useViewOptionsStore((s) => s.selectedRoom);
    const selectedRoomPinned = useViewOptionsStore((s) => s.selectedRoomPinned);
    const setSelectedRoomPinned = useViewOptionsStore((s) => s.setSelectedRoomPinned);
    const setSelectedRoom = useViewOptionsStore((s) => s.setSelectedRoom);

    const [mainRoomInfo, allRoomInfos] = useMemo(() => {
        const mainRoomInfo = selectedRoom ? mainRoomDataBySceneName.get(selectedRoom) ?? null : null;
        const allRoomInfos = selectedRoom ? allRoomDataBySceneName.get(selectedRoom) ?? null : null;
        return [mainRoomInfo, allRoomInfos];
    }, [selectedRoom]);

    const theme = useThemeStore((s) => s.theme);

    const gradientColor = useMemo(() => {
        const color = mainRoomInfo?.color;
        if (!color) {
            return 'transparent';
        }
        if (theme === 'light') {
            return color.copy({ opacity: 0.2 }).toString();
        } else {
            return color.copy({ opacity: 0.1 }).toString();
        }
    }, [mainRoomInfo?.color, theme]);

    const relatedRooms = useMemo(() => {
        if (!selectedRoom || !mainRoomInfo?.mapZone) return [];
        return getRelatedVirtualRoomNames(mainRoomInfo.mapZone, selectedRoom);
    }, [mainRoomInfo?.mapZone, selectedRoom]);

    const areaWithTooltip = (
        <Tooltip>
            <TooltipTrigger className="text-left">{mainRoomInfo?.zoneNameFormatted ?? 'Unknown area'}</TooltipTrigger>
            <TooltipContent>Area</TooltipContent>
        </Tooltip>
    );

    return (
        <Card
            className="max-lg:basis-0 flex min-w-[300px] shrink grow basis-0 flex-col bg-gradient-to-b from-transparent  to-transparent"
            style={
                {
                    '--tw-gradient-from': gradientColor,
                    transition: '--tw-gradient-from .25s ease-in-out',
                } as CSSProperties
            }
        >
            <CardHeader className="flex flex-row items-center p-4 pt-2">
                {allRoomInfos && (
                    <HKMapRoom
                        roomInfos={allRoomInfos}
                        className="mr-4 h-14 w-14"
                        useViewOptionsStore={useViewOptionsStore}
                    />
                )}

                <div>
                    <CardTitle className="text-lg">
                        {!selectedRoom || isV1 ? <>Room analytics</> : areaWithTooltip}
                    </CardTitle>
                    <CardDescription>
                        {!selectedRoom && (
                            <span className="text-sm opacity-50">Hover or click a room to view analytics</span>
                        )}
                        {selectedRoom && (
                            <>
                                {isV1 && <>{areaWithTooltip} - </>}
                                <Tooltip>
                                    <TooltipTrigger className="text-left">
                                        {mainRoomInfo?.roomNameFormattedZoneExclusive ?? selectedRoom}
                                        {/* <br />
                                    {selectedRoom} */}
                                    </TooltipTrigger>
                                    <TooltipContent>Room</TooltipContent>
                                </Tooltip>
                            </>
                        )}
                    </CardDescription>
                </div>

                <div className="grow" />

                {selectedRoomPinned ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedRoomPinned(false)}
                                className={isV1 ? '' : 'h-8 w-8'}
                            >
                                <PinOff className={isV1 ? 'h-6 w-6' : 'h-4 w-4'} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Remove pin. Will automatically select the room when you hover over it. <br />
                            You can also click a room on the map to pin/unpin it.
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    !isV1 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setSelectedRoomPinned(true)}
                                    className="h-8 w-8"
                                >
                                    <Pin className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Pin room. Will not change the selected room when you hover over the map and other
                                charts.
                                <br />
                                You can also click a room on the map to pin/unpin it.
                            </TooltipContent>
                        </Tooltip>
                    )
                )}
            </CardHeader>
            {selectedRoom && (
                <CardContent className="shrink grow basis-0 overflow-auto px-0 pb-1">
                    {!isV1 && relatedRooms.length !== 0 && (
                        <div className="flex flex-row gap-1 overflow-x-auto overflow-y-hidden p-1">
                            {relatedRooms.map((room) => (
                                <Button
                                    key={room.name}
                                    size="sm"
                                    variant={room.name === selectedRoom ? 'secondary' : 'outline'}
                                    onClick={() => setSelectedRoom(room.name)}
                                    className="shrink-0"
                                >
                                    {room.displayName}
                                </Button>
                            ))}
                        </div>
                    )}
                    <Table className="w-full">
                        <TableBody>
                            <AggregationVariables useViewOptionsStore={useViewOptionsStore} />
                        </TableBody>
                    </Table>
                </CardContent>
            )}
        </Card>
    );
}
