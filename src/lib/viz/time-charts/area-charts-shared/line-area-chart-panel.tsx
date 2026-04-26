import { PauseIcon, PlayIcon } from 'lucide-solid';
import CircleQuestionMark from 'lucide-solid/icons/circle-help';
import { Component, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { TimeBasedChartActionsTable } from '~/routes/(docs)/guide/_analytics/_tables';
import { useLayoutPanelContext } from '../../layout/layout-panel-context';
import { LayoutPanelHeader } from '../../layout/layout-panel-header';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { LayoutPanelWrapper } from '../../layout/layout-panel-wrapper';
import { useExtraChartStore } from '../../store/extra-chart-store';
import { LineAreaChart, type LineAreaChartProps } from './line-area-chart';

const RunExtraChartsFollowButton: Component = () => {
	const extraChartStore = useExtraChartStore();
	const extraChartsFollowAnimation = extraChartStore.followsAnimation;
	return (
		<Tooltip>
			<TooltipTrigger
				as={Button}
				variant="ghost"
				size="icon"
				onClick={() => {
					extraChartStore.setFollowsAnimationAutoBounds(!extraChartsFollowAnimation());
				}}
				class={
					'h-7 w-7 ' +
					(extraChartsFollowAnimation()
						? 'bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30'
						: '')
				}
			>
				<Show when={extraChartsFollowAnimation()} fallback={<PlayIcon class="h-4 w-4" />}>
					<PauseIcon class={'h-4 w-4'} />
				</Show>
			</TooltipTrigger>
			<TooltipContent>Follow animation</TooltipContent>
		</Tooltip>
	);
};

export interface LineAreaChartPanelProps extends LineAreaChartProps, LayoutPanelTypeProps {}

export const LineAreaChartPanel = (props: LineAreaChartPanelProps) => {
	const panelContext = useLayoutPanelContext();
	return (
		<LayoutPanelWrapper>
			<div class="extra-charts flex h-full flex-col">
				<LayoutPanelHeader resizeOptions={props.resizeOptions}>
					<Show when={!panelContext.isCollapsed()}>
						<RunExtraChartsFollowButton />
					</Show>
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
						<PopoverContent class="w-120 max-w-[90vw] p-0 shadow-accent">
							<TimeBasedChartActionsTable />
							<a
								href="/guide/analytics#time-based-charts"
								class="m-4 block text-sm underline"
								target="_blank"
							>
								Learn more
							</a>
						</PopoverContent>
					</Popover>
				</LayoutPanelHeader>
				<LineAreaChart {...props} />
			</div>
		</LayoutPanelWrapper>
	);
};
