import { LayoutDashboard, Spline, Text } from 'lucide-solid';
import { createUniqueId } from 'solid-js';
import { cardHeaderSmallClasses, cardRoundedMdOnlyClasses, cardTitleSmallClasses } from '~/components/ui/additions';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '~/components/ui/table';
import { cn } from '../utils';
import { RoomVisibility, TraceVisibility, useRoomDisplayStore, useTraceStore } from './store';

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

export function ViewOptions() {
	const id = createUniqueId();

	const roomDisplayStore = useRoomDisplayStore();
	const traceStore = useTraceStore();

	const roomVisibility = roomDisplayStore.roomVisibility;
	const traceVisibility = traceStore.visibility;

	const showAreaNames = roomDisplayStore.showAreaNames;
	const showSubAreaNames = roomDisplayStore.showSubAreaNames;

	return (
		<Card
			class={cn(
				cardRoundedMdOnlyClasses,
				'max-lg:grow max-lg:basis-0 min-w-[300px] overflow-auto border-t sm:min-w-min',
			)}
		>
			<CardHeader class={cardHeaderSmallClasses}>
				<CardTitle class={cardTitleSmallClasses}>Map options</CardTitle>
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
							<TableCell class="p-1">
								<Select
									value={traceVisibility()}
									onChange={(v) => {
										if (!v) return;
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
											class="grow py-1.5 pr-2 text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
											class="grow py-1.5 pr-2 text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
