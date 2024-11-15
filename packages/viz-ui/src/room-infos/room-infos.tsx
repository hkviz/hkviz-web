'use client';

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ContextMenu,
    ContextMenuContent,
    ContextMenuTrigger,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toggle,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    cardRoundedMdOnlyClasses,
    cn,
} from '@hkviz/components';
import {
    allRoomDataIncludingSubspritesBySceneName,
    getRelatedVirtualRoomNames,
    mainRoomDataBySceneName,
} from '@hkviz/parser';
import {
    aggregationStore,
    aggregationVariableInfos,
    aggregationVariables,
    formatAggregatedVariableValue,
    roomColoringStore,
    roomDisplayStore,
    roomInfoColoringToggleClasses,
    themeStore,
    uiStore,
    type AggregationVariable,
} from '@hkviz/viz';
import { Palette, Pin, PinOff } from 'lucide-solid';
import { For, Index, Match, Show, Switch, createMemo, type Component } from 'solid-js';
import { HKMapRoom } from '../map/room-icon';
import { AggregationVariableIcon } from './aggregation_variable_icon';
import { RoomColorCurveContextMenuItems } from './room-color-curve-menu';

function AggregationVariableToggles(props: { variable: AggregationVariable }) {
    const roomColors = roomColoringStore.colorMode;
    const roomColorVar1 = roomColoringStore.var1;
    const roomColorVar1Curve = roomColoringStore.var1Curve;
    const isV1 = uiStore.isV1;

    const isActive = () => roomColors() === '1-var' && roomColorVar1() === props.variable;

    // const showVar1 = roomColors === '1-var';

    return (
        <TableCell class="w-1 p-0 pr-1">
            <ContextMenu>
                <ContextMenuTrigger>
                    <Toggle
                        variant="outline"
                        pressed={isActive()}
                        onChange={() => {
                            roomColoringStore.cycleRoomColorVar1(props.variable);
                            uiStore.showMapIfOverview();
                        }}
                        class={
                            'relative h-10 w-10 rounded-full ' +
                            (!isActive()
                                ? ''
                                : roomColorVar1Curve().type === 'linear'
                                  ? 'bg-primary text-white'
                                  : roomColorVar1Curve().type === 'log'
                                    ? 'bg-blue-600 text-white'
                                    : roomColorVar1Curve().type === 'exponential'
                                      ? 'bg-green-600 text-white'
                                      : '') +
                            ' ' +
                            roomInfoColoringToggleClasses(props.variable)
                        }
                    >
                        <span class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                            <Switch>
                                <Match when={!isActive() || isV1()}>
                                    <Palette class="h-4 w-4 text-base" />
                                </Match>
                                <Match when={isActive() && !isV1() && roomColorVar1Curve().type === 'linear'}>
                                    <span class="text-[.7rem]">linear</span>
                                </Match>
                                <Match when={isActive() && roomColorVar1Curve().type === 'log'}>
                                    <span>log</span>
                                </Match>
                                <Match when={isActive() && roomColorVar1Curve().type === 'exponential'}>
                                    <span>exp</span>
                                </Match>
                            </Switch>
                        </span>
                    </Toggle>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <RoomColorCurveContextMenuItems variable={props.variable} />
                </ContextMenuContent>
            </ContextMenu>
        </TableCell>
    );
}

const AggregationVariableRow: Component<{
    variable: AggregationVariable;
}> = (props) => {
    const selectedRoom = roomDisplayStore.selectedSceneName;
    const aggregatedVariableValue = createMemo(() => {
        const sceneName = roomDisplayStore.selectedSceneName();
        const aggregations = aggregationStore.data();
        return sceneName ? (aggregations?.countPerScene?.[sceneName]?.[props.variable] ?? 0) : 0;
    });
    const formatted = createMemo(() => {
        return formatAggregatedVariableValue(props.variable, aggregatedVariableValue());
    });
    const variableInfo = createMemo(() => aggregationVariableInfos[props.variable]);

    return (
        <Show when={selectedRoom()}>
            <TableRow>
                <TableHead class="flex items-center p-1 pl-3">
                    <Tooltip>
                        <TooltipTrigger>
                            <div class="flex flex-row items-center justify-center gap-2">
                                <AggregationVariableIcon variable={props.variable} />
                                <span>{variableInfo().name}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>{variableInfo().description}</TooltipContent>
                    </Tooltip>
                </TableHead>
                <TableCell class="w-1 p-1 pr-6 text-right">{formatted()}</TableCell>
                <AggregationVariableToggles variable={props.variable} />
            </TableRow>
        </Show>
    );
};

function AggregationVariables() {
    const aggregatedMaxs = () => aggregationStore.data()?.maxOverScenes;
    const viewNeverHappenedAggregations = aggregationStore.viewNeverHappenedAggregations;

    const neverHappenedEvents = createMemo(() =>
        aggregationVariables.filter((variable) => !aggregatedMaxs()?.[variable]),
    );

    const displayedVariables = createMemo(() =>
        aggregationVariables.filter((it) => viewNeverHappenedAggregations() || !neverHappenedEvents().includes(it)),
    );

    return (
        <>
            <For each={displayedVariables()}>{(variable) => <AggregationVariableRow variable={variable} />}</For>
            <Show when={neverHappenedEvents().length !== 0}>
                <TableRow>
                    <TableCell colSpan={3} class="text-center">
                        <Show when={viewNeverHappenedAggregations()}>
                            <p class="flex flex-col items-center">
                                <Button
                                    class="h-fit"
                                    variant="outline"
                                    onClick={() => {
                                        aggregationStore.setViewNeverHappenedAggregations(false);
                                    }}
                                >
                                    Hide never occurred events
                                </Button>
                            </p>
                        </Show>
                        <Show when={!viewNeverHappenedAggregations()}>
                            <p class="flex h-fit flex-col items-center">
                                <Button
                                    class="h-fit"
                                    variant="outline"
                                    onClick={() => {
                                        aggregationStore.setViewNeverHappenedAggregations(true);
                                    }}
                                >
                                    Show never occurred events (Spoilers)
                                </Button>
                            </p>
                        </Show>
                    </TableCell>
                </TableRow>
            </Show>
        </>
    );
}

export function RoomInfo() {
    const isV1 = uiStore.isV1;
    const selectedRoom = roomDisplayStore.selectedSceneName;
    const selectedRoomPinned = roomDisplayStore.selectedScenePinned;

    const roomInfos = createMemo(() => {
        const _selectedRoom = selectedRoom();
        const mainRoomInfo = _selectedRoom ? (mainRoomDataBySceneName.get(_selectedRoom) ?? null) : null;
        const allRoomInfosIncludingSubsprites = mainRoomInfo
            ? (allRoomDataIncludingSubspritesBySceneName.get(mainRoomInfo.sceneName) ?? null)
            : null;
        return { mainRoomInfo, allRoomInfosIncludingSubsprites };
    });

    const theme = themeStore.currentTheme;

    const gradientColor = createMemo(() => {
        const color = roomInfos().mainRoomInfo?.color;
        if (!color) {
            return 'transparent';
        }
        if (theme() === 'light') {
            return color.copy({ opacity: 0.2 }).toString();
        } else {
            return color.copy({ opacity: 0.1 }).toString();
        }
    });

    const relatedRooms = createMemo(() => {
        const mapZone = roomInfos().mainRoomInfo?.mapZone;
        const _selectedRoom = selectedRoom();
        if (!_selectedRoom || !mapZone) return [];
        return getRelatedVirtualRoomNames(mapZone, _selectedRoom);
    });

    return (
        <Card
            class={cn(
                cardRoundedMdOnlyClasses,
                'room-infos-card flex min-w-[300px] shrink grow basis-0 flex-col border-l border-t bg-gradient-to-b from-transparent to-transparent max-lg:basis-0',
            )}
            style={{
                '--tw-gradient-from': gradientColor(),
                transition: '--tw-gradient-from .25s ease-in-out',
            }}
        >
            <CardHeader class="flex flex-row items-center p-2 pt-2">
                <Show when={roomInfos().allRoomInfosIncludingSubsprites}>
                    {(allRoomDataIncludingSubspritesBySceneName) => (
                        <HKMapRoom roomInfos={allRoomDataIncludingSubspritesBySceneName()} class="mr-4 h-14 w-14" />
                    )}
                </Show>

                <div>
                    <CardTitle class="text-base md:text-lg">
                        <Show
                            when={selectedRoom() == null || isV1()}
                            fallback={
                                <Tooltip>
                                    <TooltipTrigger class="text-left">
                                        {roomInfos().mainRoomInfo?.zoneNameFormatted ?? 'Unknown area'}
                                    </TooltipTrigger>
                                    <TooltipContent>Area</TooltipContent>
                                </Tooltip>
                            }
                        >
                            Room analytics
                        </Show>
                    </CardTitle>
                    <CardDescription>
                        <Show when={selectedRoom() == null}>
                            <span class="text-sm opacity-50">Hover or click a room to view analytics</span>
                        </Show>
                        <Show when={selectedRoom() != null}>
                            <Show when={isV1()}>
                                <Tooltip>
                                    <TooltipTrigger class="text-left">
                                        {roomInfos().mainRoomInfo?.zoneNameFormatted ?? 'Unknown area'}
                                    </TooltipTrigger>
                                    <TooltipContent>Area</TooltipContent>
                                </Tooltip>
                            </Show>
                            <Tooltip>
                                <TooltipTrigger class="text-left">
                                    {roomInfos().mainRoomInfo?.roomNameFormattedZoneExclusive ?? selectedRoom()}
                                    {/* <br />
                                    {selectedRoom} */}
                                </TooltipTrigger>
                                <TooltipContent>Room</TooltipContent>
                            </Tooltip>
                        </Show>
                    </CardDescription>
                </div>

                <div class="grow" />

                <Tooltip>
                    <TooltipTrigger
                        as={Button}
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            if (selectedRoomPinned()) {
                                roomDisplayStore.unpinScene('pin-button-click');
                            } else {
                                roomDisplayStore.pinScene('pin-button-click');
                            }
                        }}
                        class={'room-info-pin-button h-8 w-8'}
                    >
                        <Show when={selectedRoomPinned()} fallback={<Pin class="h-4 w-4" />}>
                            <PinOff class={'h-4 w-4'} />
                        </Show>
                    </TooltipTrigger>
                    <TooltipContent>
                        <Show when={selectedRoomPinned()}>
                            Remove pin. Will automatically select the room when you hover over it. <br />
                            You can also click a room on the map to pin/unpin it.
                        </Show>
                        <Show when={!selectedRoomPinned()}>
                            Pin room. Will not change the selected room when you hover over the map and other charts.
                            <br />
                            You can also click a room on the map to pin/unpin it.
                        </Show>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent class="shrink grow basis-0 overflow-auto px-0 pb-1">
                <Show when={selectedRoom() != null}>
                    <Show when={!isV1() && relatedRooms().length !== 0}>
                        <div class="flex flex-row gap-1 overflow-x-auto overflow-y-hidden p-1">
                            <Index each={relatedRooms()}>
                                {(room) => (
                                    <Button
                                        size="sm"
                                        variant={room().name === selectedRoom() ? undefined : 'outline'}
                                        onClick={() => {
                                            roomDisplayStore.setSelectedSceneName(room().name);
                                        }}
                                        class="shrink-0"
                                    >
                                        {room().displayName}
                                    </Button>
                                )}
                            </Index>
                        </div>
                    </Show>
                    <Table class="w-full">
                        <TableBody>
                            <AggregationVariables />
                        </TableBody>
                    </Table>
                </Show>
            </CardContent>
        </Card>
    );
}
