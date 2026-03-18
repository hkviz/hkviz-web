import { LayoutDashboard, Spline, TextAlignStart } from 'lucide-solid';
import { createUniqueId, Show } from 'solid-js';
import { CardContent } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '~/components/ui/table';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import { useLayoutPanelContext } from './layout/layout-panel-context';
import { LayoutPanelHeader } from './layout/layout-panel-header';
import { LayoutPanelTypeProps } from './layout/layout-panel-props';
import { LayoutPanelWrapper } from './layout/layout-panel-wrapper';
import { RoomVisibility, TRACE_VISIBILITIES, TraceVisibility, useRoomDisplayStore, useTraceStore } from './store';

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
		case 'stay':
			return 'Stay';
		case 'fade_out':
			return 'Fade out';
		case 'hide':
			return 'Hidden';
	}
}

function TraceLengthInput() {
	const traceStore = useTraceStore();

	function onChange(v: any) {
		try {
			const vv = Number.parseInt(v.target.value);
			if (isNaN(vv) || vv < 0) return;
			traceStore.setLengthMin(vv);
		} catch (e) {
			// ignore
			console.log(e);
		}
	}

	const cssWidth = () =>
		`calc(${Math.max(Math.min(traceStore.lengthMin().toString().length, 3), 2)}ch + calc(var(--spacing, 0.25rem) * 10))`;

	return (
		<div class="flex flex-row items-baseline">
			<TextField>
				<TextFieldInput
					type="number"
					aria-label="Trace length in minutes"
					class="no-spinner -mr-1 w-10 border-0 p-3 pr-7 text-right"
					style={{
						width: cssWidth(),
						'margin-left': `calc(-1 * ${cssWidth()} + var(--spacing, 0.25rem))`,
					}}
					value={traceStore.lengthMin()}
					onKeyUp={onChange}
					onKeyDown={onChange}
					onChange={onChange}
				/>
			</TextField>
			<span class="pointer-events-none -ml-5 text-[0.65rem]">min</span>
		</div>
	);
}

export function MapOptions(props: LayoutPanelTypeProps) {
	const id = createUniqueId();

	const roomDisplayStore = useRoomDisplayStore();
	const traceStore = useTraceStore();

	const roomVisibility = roomDisplayStore.roomVisibility;
	const traceVisibility = traceStore.visibility;

	const showAreaNames = roomDisplayStore.showAreaNames;
	const showSubAreaNames = roomDisplayStore.showSubAreaNames;

	const panelContext = useLayoutPanelContext();

	const showTraceLengthInput = () => traceStore.visibility() === 'fade_out';

	return (
		<LayoutPanelWrapper class="flex min-w-75 flex-col border-t max-lg:grow max-lg:basis-0 sm:min-w-min">
			<LayoutPanelHeader resizeOptions={props.resizeOptions} />
			<Show when={!panelContext.isCollapsed()}>
				<CardContent class="shrink grow overflow-auto px-0 pb-0">
					<Table class="w-full">
						<TableBody>
							<TableRow>
								<TableHead>
									<Label class="flex items-center" for="visibleRoomSelectTrigger">
										<LayoutDashboard class="mr-2 h-5 w-5" />
										Visible rooms
									</Label>
								</TableHead>
								<TableCell class="p-1">
									<Select
										value={roomVisibility()}
										onChange={(v) => {
											if (!v) return;
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
										<SelectTrigger aria-label="Room visibility" class="border-0">
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
								<TableCell class="p-1">
									<div class="flex flex-row items-baseline">
										<Show when={showTraceLengthInput()}>
											<TraceLengthInput />
										</Show>
										<Select
											value={traceVisibility()}
											onChange={(v) => {
												if (!v) return;
												traceStore.setVisibility(v);
											}}
											class="grow"
											options={TRACE_VISIBILITIES}
											placeholder="Trace visibility"
											itemComponent={(props) => (
												<SelectItem item={props.item}>
													{traceVisibilityName(props.item.rawValue)}
												</SelectItem>
											)}
										>
											<SelectTrigger aria-label="Trace visibility" class="border-0">
												<SelectValue<TraceVisibility>>
													{(state) => traceVisibilityName(state.selectedOption())}
												</SelectValue>
											</SelectTrigger>
											<SelectContent />
										</Select>
									</div>
								</TableCell>
								{/* {!isV1 && (
                        <TableCell class="p-0 pr-1">
                            <HelpButton href={analyticsGuideUrl('player-movement-and-traces')} />
                        </TableCell>
                    )} */}
							</TableRow>
							<TableRow>
								<TableHead>
									<Label class="flex items-center">
										<TextAlignStart class="mr-2 h-5 w-5" />
										Area names
									</Label>
								</TableHead>
								<TableCell class="px-2 py-1 pr-2.5">
									<div class="flex flex-col">
										<div class="flex flex-row items-center">
											<Label
												for={id + 'show_area_names-input'}
												class="text-muted-foreground grow py-1.5 pr-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
												class="text-muted-foreground grow py-1.5 pr-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Show>
		</LayoutPanelWrapper>
	);
}
