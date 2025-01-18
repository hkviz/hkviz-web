import { type Component, type JSXElement, createUniqueId } from 'solid-js';
import { cardHeaderSmallClasses, cardTitleSmallClasses } from '~/components/ui/additions';
import { CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
import { cn } from '~/lib/utils';
import { useExtraChartStore } from '../store';
import { CompletionChart } from './completion-chart';
import { EssenceChart } from './essence-chart';
import { GeoChart } from './geo-chart';
import { GrubChart } from './grub-chart';
import { HealthChart } from './health-chart';
import { SoulChart } from './soul-chart';

const Shortcut: Component<{ children: JSXElement }> = (props) => {
	return <span class="rounded-md bg-gray-200 px-1 font-mono dark:bg-gray-800">{props.children}</span>;
};

const RunExtraChartsFollowCheckbox: Component = () => {
	const id = createUniqueId();
	const extraChartStore = useExtraChartStore();
	const extraChartsFollowAnimation = extraChartStore.followsAnimation;
	return (
		<div class="flex flex-row gap-2 px-4 pb-2">
			<Checkbox
				id={id + 'follow_anim'}
				checked={extraChartsFollowAnimation()}
				onChange={(c) => extraChartStore.setFollowsAnimationAutoBounds(c === true)}
			/>
			<Label
				for={id + 'follow_anim-input'}
				class="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Follow animation
			</Label>
		</div>
	);
};

export interface RunExtraChartsProps {
	resizeOptions?: JSXElement;
}

export const RunExtraCharts: Component<RunExtraChartsProps> = (props) => {
	const isMac = typeof window !== 'undefined' ? /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent) : false;
	return (
		<div class="extra-charts flex h-full flex-col">
			<CardHeader class={cardHeaderSmallClasses}>
				<CardTitle class={cn(cardTitleSmallClasses, 'flex w-full flex-row justify-between')}>
					Time-based charts
					{props.resizeOptions}
				</CardTitle>
			</CardHeader>

			<RunExtraChartsFollowCheckbox />
			<hr />
			{/* snap-proximity */}
			<div class="shrink grow snap-y snap-mandatory overflow-y-auto lg:shrink lg:basis-0">
				<div class="snap-start snap-normal">
					<Table class="pb-2">
						<TableBody>
							<TableRow>
								<TableCell class="p-1 pl-4">
									<Shortcut>{isMac ? '⌘ + Click' : 'Ctrl + Click'}</Shortcut> or <br />
									<Shortcut>Click + Hold</Shortcut>
								</TableCell>
								<TableCell class="p-1">select point in timeline.</TableCell>
							</TableRow>
							<TableRow class="pb-2">
								<TableCell class="p-1 pl-4">
									<Shortcut>Drag</Shortcut>
								</TableCell>
								<TableCell class="p-1">zoom into graph.</TableCell>
							</TableRow>
							<TableRow class="pb-2">
								<TableCell class="p-1 pl-4">
									<Shortcut>Click</Shortcut>
								</TableCell>
								<TableCell class="p-1">zoom out of graph.</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<hr />
				</div>
				<GeoChart />
				<hr />
				<EssenceChart />
				<hr />
				<GrubChart />
				<hr />
				<CompletionChart />
				<hr />
				<HealthChart />
				<hr />
				<SoulChart />
				<hr />
				<div class="snap-start snap-normal" />
			</div>
		</div>
	);
};
