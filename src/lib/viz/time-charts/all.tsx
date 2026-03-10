import { A } from '@solidjs/router';
import { CircleQuestionMark } from 'lucide-solid';
import { type Component, type JSXElement, createUniqueId } from 'solid-js';
import { cardHeaderSmallClasses, cardTitleSmallClasses } from '~/components/ui/additions';
import { Button } from '~/components/ui/button';
import { CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/lib/utils';
import { TimeBasedChartActionsTable } from '~/routes/(docs)/guide/_analytics/_tables';
import { useExtraChartStore } from '../store';
import { CompletionChart } from './completion-chart';
import { EssenceChart } from './essence-chart';
import { GeoChart } from './geo-chart';
import { GrubChart } from './grub-chart';
import { HealthChart } from './health-chart';
import { SoulChart } from './soul-chart';

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
				class="grow text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
	return (
		<div class="extra-charts flex h-full flex-col">
			<CardHeader class={cardHeaderSmallClasses}>
				<CardTitle class={cn(cardTitleSmallClasses, 'flex w-full flex-row justify-between')}>
					Time-based charts
					<div class="flex flex-row gap-2">
						<Popover>
							<PopoverTrigger
								as={Button}
								variant="ghost"
								size="icon"
								class="h-7 w-7"
								aria-label="Time-based charts help"
							>
								<CircleQuestionMark class="h-3 w-3" />
							</PopoverTrigger>
							<PopoverContent class="shadow-accent w-120 max-w-[90vw] p-0">
								<TimeBasedChartActionsTable />
								<A
									href="/guide/analytics#time-based-charts"
									class="m-4 block text-sm underline"
									target="_blank"
								>
									Learn more
								</A>
							</PopoverContent>
						</Popover>
						{props.resizeOptions}
					</div>
				</CardTitle>
			</CardHeader>

			<RunExtraChartsFollowCheckbox />
			<hr />
			{/* snap-proximity */}
			<div class="shrink grow snap-y snap-mandatory overflow-y-auto lg:shrink lg:basis-0">
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
