import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Checkbox,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    cardHeaderSmallClasses,
    cardRoundedMdOnlyClasses,
    cardTitleSmallClasses,
    cn,
} from '@hkviz/components';
import {
    roomColoringStore,
    roomDisplayStore,
    traceStore,
    uiStore,
    type RoomColorMode,
    type RoomVisibility,
    type TraceVisibility,
} from '@hkviz/viz';
import { LayoutDashboard, Palette, Spline, Text } from 'lucide-solid';
import { Show, createUniqueId } from 'solid-js';

function roomVisibilityName(v: RoomVisibility) {
    switch (v) {
        case 'all':
            return 'All (Spoilers)';
        case 'visited-animated':
            return 'Animated';
        case 'visited':
            return 'Visited';
    }
}

function traceVisibilityName(v: TraceVisibility) {
    switch (v) {
        case 'all':
            return 'All';
        case 'animated':
            return 'Animated';
        case 'hide':
            return 'Hidden';
    }
}

function roomColorModeName(v: RoomColorMode) {
    switch (v) {
        case 'area':
            return 'Area';
        case '1-var':
            return '1 variable';
    }
}

export function ViewOptions() {
    const id = createUniqueId();

    const isV1 = uiStore.isV1;

    const roomVisibility = roomDisplayStore.roomVisibility;
    const traceVisibility = traceStore.visibility;
    const roomColorMode = roomColoringStore.colorMode;

    const showAreaNames = roomDisplayStore.showAreaNames;
    const showSubAreaNames = roomDisplayStore.showSubAreaNames;

    return (
        <Card
            class={cn(
                cardRoundedMdOnlyClasses,
                'min-w-[300px] overflow-auto border-t max-lg:grow max-lg:basis-0 sm:min-w-min',
            )}
        >
            <CardHeader class={cardHeaderSmallClasses}>
                <CardTitle class={cardTitleSmallClasses}>{isV1() ? 'View options' : 'Map options'}</CardTitle>
            </CardHeader>
            <CardContent class="px-0 pb-1">
                <Table class="w-full">
                    <TableBody>
                        <TableRow>
                            <TableHead>
                                <Label class="flex items-center" for="visibleRoomSelectTrigger">
                                    <LayoutDashboard class="mr-2 h-5 w-5" />
                                    Visible rooms
                                </Label>
                            </TableHead>
                            <TableCell class={isV1() ? '' : 'p-1'}>
                                <Select
                                    value={roomVisibility()}
                                    onChange={(v) => {
                                        roomDisplayStore.setRoomVisibility(v);
                                    }}
                                    options={['all', 'visited-animated', 'visited']}
                                    placeholder="Room visibility"
                                    itemComponent={(props) => (
                                        <SelectItem item={props.item}>
                                            {roomVisibilityName(props.item.rawValue)}
                                        </SelectItem>
                                    )}
                                >
                                    <SelectTrigger aria-label="Room visibility">
                                        <SelectValue<RoomVisibility>>
                                            {(state) => roomVisibilityName(state.selectedOption())}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent />
                                </Select>
                            </TableCell>
                            {/* {!isV1 && (
                        <TableCell class="p-0 pr-1">
                            <HelpButton href={analyticsGuideUrl('room-visibility')} />
                        </TableCell>
                    )} */}
                        </TableRow>
                        <TableRow>
                            <TableHead>
                                <Label class="flex items-center" for="traceVisibilitySelectTrigger">
                                    <Spline class="mr-2 h-5 w-5" />
                                    Traces
                                </Label>
                            </TableHead>
                            <TableCell class={isV1() ? '' : 'p-1'}>
                                <Select
                                    value={traceVisibility()}
                                    onChange={(v) => {
                                        traceStore.setVisibility(v);
                                    }}
                                    options={['all', 'animated', 'hide']}
                                    placeholder="Trace visibility"
                                    itemComponent={(props) => (
                                        <SelectItem item={props.item}>
                                            {traceVisibilityName(props.item.rawValue)}
                                        </SelectItem>
                                    )}
                                >
                                    <SelectTrigger aria-label="Trace visibility">
                                        <SelectValue<TraceVisibility>>
                                            {(state) => traceVisibilityName(state.selectedOption())}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent />
                                </Select>
                            </TableCell>
                            {/* {!isV1 && (
                        <TableCell class="p-0 pr-1">
                            <HelpButton href={analyticsGuideUrl('player-movement-and-traces')} />
                        </TableCell>
                    )} */}
                        </TableRow>
                        <Show when={isV1()}>
                            <TableRow>
                                <TableHead>
                                    <Label class="flex items-center" for="roomColorSelectTrigger">
                                        <Palette class="mr-2 h-5 w-5" />
                                        Room colors
                                    </Label>
                                </TableHead>
                                <TableCell class={isV1() ? '' : 'p-2'}>
                                    <Select
                                        value={roomColorMode()}
                                        onChange={(v) => {
                                            roomColoringStore.setRoomColorMode(v);
                                        }}
                                        options={['area', '1-var']}
                                        placeholder="Room colors"
                                        itemComponent={(props) => (
                                            <SelectItem item={props.item}>
                                                {roomColorModeName(props.item.rawValue)}
                                            </SelectItem>
                                        )}
                                    >
                                        <SelectTrigger aria-label="Room color mode">
                                            <SelectValue<RoomColorMode>>
                                                {(state) => roomColorModeName(state.selectedOption())}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent />
                                    </Select>
                                </TableCell>
                                {/* {!isV1 && (
                        <TableCell class="p-0 pr-1">
                            <HelpButton href={analyticsGuideUrl('map-coloring-by-variables')} />
                        </TableCell>
                    )} */}
                            </TableRow>
                        </Show>
                        <Show when={!isV1()}>
                            <TableRow>
                                <TableHead>
                                    <Label class="flex items-center">
                                        <Text class="mr-2 h-5 w-5" />
                                        Area names
                                    </Label>
                                </TableHead>
                                <td class="p-2 py-1.5 pr-2">
                                    <div class="flex flex-col">
                                        <div class="flex flex-row items-center">
                                            <Label
                                                for={id + 'show_area_names-input'}
                                                class="text-muted-foreground grow py-1.5 pr-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Main areas
                                            </Label>
                                            <Checkbox
                                                id={id + 'show_area_names'}
                                                checked={showAreaNames()}
                                                onChange={(c) => roomDisplayStore.setShowAreaNames(c === true)}
                                            />
                                        </div>
                                        <div class="flex flex-row items-center">
                                            <Label
                                                for={id + 'show_sub_area_names-input'}
                                                class="text-muted-foreground grow py-1.5 pr-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Sub areas
                                            </Label>
                                            <Checkbox
                                                id={id + 'show_sub_area_names'}
                                                checked={showSubAreaNames()}
                                                onChange={(c) => roomDisplayStore.setShowSubAreaNames(c === true)}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </TableRow>
                        </Show>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
