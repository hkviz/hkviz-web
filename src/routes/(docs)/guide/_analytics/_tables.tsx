import { Pin } from 'lucide-solid';
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
						<TableCell>Hover</TableCell>
						<TableCell>
							Shows a marker for the split on the{' '}
							<a href="#timeline" class="underline">
								timeline
							</a>{' '}
							and highlights the room of the split on the{' '}
							<a href="#map" class="underline">
								map
							</a>
							.
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Click</TableCell>
						<TableCell>
							Jump to the timepoint of a split and change the selected room of the room analytics panel to
							the room of the split
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Double click</TableCell>
						<TableCell>
							<a href="#room-pin" class="underline">
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
						<TableCell>Ctrl + Click or Click + Hold</TableCell>
						<TableCell>Move the timeline to the timepoint hovered on the chart</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Drag from left to right</TableCell>
						<TableCell>Zoom into the selected timespan</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Click</TableCell>
						<TableCell>Zoom out</TableCell>
					</TableRow>
				</TableBody>
			</Table>
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
						<TableCell>Shift + Drag</TableCell>
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
						<TableCell>Click</TableCell>
						<TableCell>Jump to the timepoint of the color code</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Hover</TableCell>
						<TableCell>Change selected room, if not pinned</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Double Click</TableCell>
						<TableCell>
							<a href="#room-pin" class="underline">
								Toggle if the selected room is pinned. <Pin class="inline-block h-4 w-4" />
							</a>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Card>
	);
}
