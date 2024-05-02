'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMemo, type CSSProperties } from 'react';
import { HKMapRoom } from '~/lib/viz/charts/room-icon';
import { allRoomDataIncludingSubspritesBySceneName, mainRoomDataBySceneName } from '~/lib/viz/map-data/rooms';

import { cardRoundedMdOnlyClasses } from '@/components/additions/cards';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { useComputed, useSignals } from '@preact/signals-react/runtime';
import { Palette, Pin, PinOff } from 'lucide-react';
import { AggregationVariableIcon } from '~/app/_components/aggregation_variable_icon';
import {
    aggregationStore,
    aggregationVariableInfos,
    aggregationVariables,
    formatAggregatedVariableValue,
    type AggregationVariable,
} from '~/lib/stores/aggregation-store';
import { roomColoringStore } from '~/lib/stores/room-coloring-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { useThemeStore } from '~/lib/stores/theme-store';
import { uiStore } from '~/lib/stores/ui-store';
import { assertNever } from '~/lib/utils/utils';
import { getRelatedVirtualRoomNames } from '~/lib/viz/map-data/room-groups';
import { RoomColorCurveContextMenuItems } from './_room-color-curve-menu';

export function roomInfoColoringToggleClasses(variable: AggregationVariable) {
    return 'room-info-coloring-toggle_' + variable;
}

function AggregationVariableToggles({ variable }: { variable: AggregationVariable }) {
    useSignals();
    const roomColors = roomColoringStore.colorMode.value;
    const roomColorVar1 = roomColoringStore.var1.value;
    const roomColorVar1Curve = roomColoringStore.var1Curve.value;
    const isV1 = uiStore.isV1.value;

    const isActive = roomColors === '1-var' && roomColorVar1 === variable;

    // const showVar1 = roomColors === '1-var';
    const showVar1 = true;
    const showAnyToggles = showVar1;

    if (!showAnyToggles) return null;

    return (
        <TableCell className="w-1 p-0 pr-1">
            {showVar1 && (
                <ContextMenu>
                    <ContextMenuTrigger>
                        <Toggle
                            variant="outline"
                            pressed={roomColorVar1 === variable && roomColors === '1-var'}
                            onPressedChange={() => {
                                roomColoringStore.cycleRoomColorVar1(variable);
                                uiStore.showMapIfOverview();
                            }}
                            className={
                                'relative h-10 w-10 rounded-full data-[state=on]:text-white ' +
                                (roomColorVar1Curve.type === 'linear'
                                    ? 'data-[state=on]:bg-primary'
                                    : roomColorVar1Curve.type === 'log'
                                      ? 'data-[state=on]:bg-blue-600'
                                      : roomColorVar1Curve.type === 'exponential'
                                        ? 'data-[state=on]:bg-green-600'
                                        : assertNever(roomColorVar1Curve)) +
                                ' ' +
                                roomInfoColoringToggleClasses(variable)
                            }
                        >
                            <span className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                                {(!isActive || isV1) && <Palette className="h-4 w-4 text-base" />}
                                {isActive && !isV1 && roomColorVar1Curve.type === 'linear' && (
                                    <span className="text-[.7rem]">linear</span>
                                )}
                                {isActive && !isV1 && roomColorVar1Curve.type === 'log' && <span>log</span>}
                                {isActive && !isV1 && roomColorVar1Curve.type === 'exponential' && <span>exp</span>}
                            </span>
                        </Toggle>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <RoomColorCurveContextMenuItems variable={variable} />
                    </ContextMenuContent>
                </ContextMenu>
            )}
        </TableCell>
    );
}

function AggregationVariableRow({
    variable,
}: React.PropsWithChildren<{
    variable: AggregationVariable;
}>) {
    useSignals();
    const selectedRoom = roomDisplayStore.selectedSceneName.value;
    const aggregatedVariableValue = useComputed(function aggregatedVariableComputed() {
        const sceneName = roomDisplayStore.selectedSceneName.value;
        const aggregations = aggregationStore.data.value;
        return sceneName ? aggregations?.countPerScene?.[sceneName]?.[variable] ?? 0 : 0;
    });
    const formatted = useComputed(function formatAggregatedVariableValueComputed() {
        return formatAggregatedVariableValue(variable, aggregatedVariableValue.value);
    });
    const variableInfo = aggregationVariableInfos[variable];

    if (!selectedRoom) return null;
    return (
        <TableRow>
            <TableHead className="flex items-center p-1 pl-3">
                <Tooltip>
                    <TooltipTrigger>
                        <div className="flex flex-row items-center justify-center gap-2">
                            <AggregationVariableIcon variable={variableInfo} />
                            <span>{variableInfo.name}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>{variableInfo.description}</TooltipContent>
                </Tooltip>
            </TableHead>
            <TableCell className="w-1 p-1 pr-6 text-right">{formatted}</TableCell>
            <AggregationVariableToggles variable={variable} />
        </TableRow>
    );
}

function AggregationVariables() {
    useSignals();
    const aggregatedMaxs = aggregationStore.data.value?.maxOverScenes;
    const viewNeverHappenedAggregations = aggregationStore.viewNeverHappenedAggregations.value;

    const neverHappenedEvents = aggregationVariables.filter((variable) => !aggregatedMaxs?.[variable]);

    return (
        <>
            {aggregationVariables
                .filter((it) => viewNeverHappenedAggregations || !neverHappenedEvents.includes(it))
                .map((variable) => (
                    <AggregationVariableRow key={variable} variable={variable} />
                ))}
            {neverHappenedEvents.length !== 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">
                        {viewNeverHappenedAggregations ? (
                            <p className="flex flex-col items-center">
                                <Button
                                    className="h-fit"
                                    variant="outline"
                                    onClick={() => {
                                        aggregationStore.viewNeverHappenedAggregations.value = false;
                                    }}
                                >
                                    Hide never occurred events
                                </Button>
                            </p>
                        ) : (
                            <p className="flex h-fit flex-col items-center">
                                <Button
                                    className="h-fit"
                                    variant="outline"
                                    onClick={() => {
                                        aggregationStore.viewNeverHappenedAggregations.value = true;
                                    }}
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

export function RoomInfo() {
    useSignals();
    const isV1 = uiStore.isV1.value;
    const selectedRoom = roomDisplayStore.selectedSceneName.value;
    const selectedRoomPinned = roomDisplayStore.selectedScenePinned.value;

    const [mainRoomInfo, allRoomInfosIncludingSubsprites] = useMemo(() => {
        const mainRoomInfo = selectedRoom ? mainRoomDataBySceneName.get(selectedRoom) ?? null : null;
        const allRoomInfosIncludingSubsprites = mainRoomInfo
            ? allRoomDataIncludingSubspritesBySceneName.get(mainRoomInfo.sceneName) ?? null
            : null;
        return [mainRoomInfo, allRoomInfosIncludingSubsprites];
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
            className={cn(
                cardRoundedMdOnlyClasses,
                'room-infos-card max-lg:basis-0 flex min-w-[300px] shrink grow basis-0 flex-col border-l border-t bg-gradient-to-b from-transparent  to-transparent',
            )}
            style={
                {
                    '--tw-gradient-from': gradientColor,
                    transition: '--tw-gradient-from .25s ease-in-out',
                } as CSSProperties
            }
        >
            <CardHeader className="flex flex-row items-center p-2 pt-2">
                {allRoomInfosIncludingSubsprites && (
                    <HKMapRoom roomInfos={allRoomInfosIncludingSubsprites} className="mr-4 h-14 w-14" />
                )}

                <div>
                    <CardTitle className="text-base md:text-lg">
                        {selectedRoom == null || isV1 ? <>Room analytics</> : areaWithTooltip}
                    </CardTitle>
                    <CardDescription>
                        {selectedRoom == null && (
                            <span className="text-sm opacity-50">Hover or click a room to view analytics</span>
                        )}
                        {selectedRoom != null && (
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
                                onClick={() => {
                                    roomDisplayStore.unpinScene('pin-button-click');
                                }}
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
                                    onClick={() => {
                                        roomDisplayStore.pinScene('pin-button-click');
                                    }}
                                    className="room-info-pin-button h-8 w-8"
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
            {selectedRoom != null && (
                <CardContent className="shrink grow basis-0 overflow-auto px-0 pb-1">
                    {!isV1 && relatedRooms.length !== 0 && (
                        <div className="flex flex-row gap-1 overflow-x-auto overflow-y-hidden p-1">
                            {relatedRooms.map((room) => (
                                <Button
                                    key={room.name}
                                    size="sm"
                                    variant={room.name === selectedRoom ? undefined : 'outline'}
                                    onClick={() => roomDisplayStore.setSelectedRoom(room.name)}
                                    className="shrink-0"
                                >
                                    {room.displayName}
                                </Button>
                            ))}
                        </div>
                    )}
                    <Table className="w-full">
                        <TableBody>
                            <AggregationVariables />
                        </TableBody>
                    </Table>
                </CardContent>
            )}
        </Card>
    );
}
