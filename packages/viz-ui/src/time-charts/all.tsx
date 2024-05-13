import {
    CardHeader,
    CardTitle,
    Checkbox,
    Label,
    Table,
    TableBody,
    TableCell,
    TableRow,
    cardHeaderSmallClasses,
    cardTitleSmallClasses,
    cn,
} from '@hkviz/components';
import { extraChartStore, uiStore } from '@hkviz/viz';
import { CompletionChart } from './completion-chart';
import { EssenceChart } from './essence-chart';
import { GeoChart } from './geo-chart';
import { GrubChart } from './grub-chart';
import { HealthChart } from './health-chart';
import { SoulChart } from './soul-chart';
import { type Component, type JSXElement, Show, createUniqueId } from 'solid-js';

const Shortcut: Component<{ children: JSXElement }> = (props) => {
    return <span class="rounded-md bg-gray-200 px-1 font-mono dark:bg-gray-800">{props.children}</span>;
};

const RunExtraChartsFollowCheckbox: Component = () => {
    const id = createUniqueId();
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
    const isV1 = uiStore.isV1;

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
                <Show when={!isV1()}>
                    <div class="snap-start snap-normal">
                        <Table class="pb-2">
                            <TableBody>
                                <TableRow>
                                    <TableCell class="p-1 pl-4">
                                        <Shortcut>{isMac ? '⌘ + Click' : 'Ctrl + Click'}</Shortcut> or <br />
                                        <Shortcut>Click + Hold</Shortcut>
                                    </TableCell>
                                    <TableCell class="p-1">select time on map.</TableCell>
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
                </Show>
                <GeoChart />
                <hr />
                <Show when={!isV1()}>
                    <>
                        <EssenceChart />
                        <hr />
                        <GrubChart />
                        <hr />
                        <CompletionChart />
                        <hr />
                    </>
                </Show>
                <HealthChart />
                <hr />
                <Show when={!isV1()}>
                    <>
                        <SoulChart />
                        <hr />
                    </>
                </Show>
                <Show when={isV1()}>
                    <CompletionChart />
                    <hr />
                    <GrubChart />
                </Show>
                <div class="snap-start snap-normal" />
            </div>
        </div>
    );
};
