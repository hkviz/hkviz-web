import { Pin } from 'lucide-solid';
import { CtrlOrCommandKeyText, ShortcutKeys } from '~/components/shortcut-hint';
import { Card } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

export function SplitActionsTable() {
	return (
		<Card class="not-prose max-w-[60ch] overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Shortcut</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>
							<ShortcutKeys keys={['Hover']} />
						</TableCell>
						<TableCell>
							Shows a marker for the split on the{' '}
							<a href="#timeline" class="underline" target="_self">
								timeline
							</a>{' '}
							and highlights the room of the split on the{' '}
							<a href="#map" class="underline" target="_self">
								map
							</a>
							.
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>
							<ShortcutKeys keys={['Click']} />
						</TableCell>
						<TableCell>
							Jump to the timepoint of a split and change the selected room of the room analytics panel to
							the room of the split
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>
							<ShortcutKeys keys={['Double Click']} />
						</TableCell>
						<TableCell>
							<a href="#room-pin" class="underline" target="_self">
								<Pin class="inline-block h-4 w-4" />
								Pin the room
							</a>{' '}
							of a split
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Card>
	);
}

export function TimeBasedChartActionsTable() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Shortcut</TableHead>
					<TableHead>Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>
						<ShortcutKeys keys={['Drag']} /> over Chart
					</TableCell>
					<TableCell>Zoom in</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						<ShortcutKeys keys={['Click']} />
					</TableCell>
					<TableCell>Zoom out</TableCell>
				</TableRow>
				<TableRow>
					<TableCell class="p-1 pl-4">
						<ShortcutKeys keys={[<CtrlOrCommandKeyText />, 'Click']} /> or <br />
						<ShortcutKeys keys={['Click', 'Hold']} />
					</TableCell>
					<TableCell>Move the timeline to where your mouse is on the chart</TableCell>
				</TableRow>

				<TableRow>
					<TableCell class="p-1 pl-4">
						<ShortcutKeys keys={[<CtrlOrCommandKeyText />, 'Drag']} />
					</TableCell>
					<TableCell>Move the timeline to where your mouse is on the chart until letting go</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}

export function TimeBasedChartActionsTableCard() {
	return (
		<Card class="not-prose max-w-[60ch] overflow-hidden">
			<TimeBasedChartActionsTable />
		</Card>
	);
}

export function TimelineTable() {
	return (
		<Card class="not-prose max-w-[60ch] overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Shortcut</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>
							<ShortcutKeys keys={['Shift', 'Drag']} />
						</TableCell>
						<TableCell>
							More precisely drag on the timeline. The slider moves 10 times slower, making it easier to
							find a certain timestamp.
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Card>
	);
}

export function TimelineColorCodesTable() {
	return (
		<Card class="not-prose max-w-[60ch] overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Shortcut</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>
							<ShortcutKeys keys={['Click']} />
						</TableCell>
						<TableCell>Jump to the timepoint of the color code</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>
							<ShortcutKeys keys={['Hover']} />
						</TableCell>
						<TableCell>Change selected room, if not pinned</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>
							<ShortcutKeys keys={['Click', 'Click']} />
						</TableCell>
						<TableCell>
							<a href="#room-pin" class="underline" target="_self">
								Toggle if the selected room is pinned. <Pin class="inline-block h-4 w-4" />
							</a>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Card>
	);
}
