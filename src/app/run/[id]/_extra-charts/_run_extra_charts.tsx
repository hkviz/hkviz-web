import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useId } from 'react';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { CompletionChart } from './completion-chart';
import { GeoChart } from './geo-chart';
import { HealthChart } from './health-chart';

export interface RunExtraChartsProps {
    useViewOptionsStore: UseViewOptionsStore;
    className?: string;
}

export function RunExtraCharts({ useViewOptionsStore, className }: RunExtraChartsProps) {
    const id = useId();
    const extraChartsFollowAnimation = useViewOptionsStore((s) => s.extraChartsFollowAnimation);
    const setExtraChartsFollowAnimation = useViewOptionsStore((s) => s.setExtraChartsFollowAnimation);
    const isAnythingAnimating = useViewOptionsStore((s) => s.isAnythingAnimating);

    return (
        <Card className={cn('flex flex-col overflow-hidden', className)}>
            <CardHeader>
                <CardTitle>Time based analytics</CardTitle>
            </CardHeader>
            {isAnythingAnimating && (
                <CardContent>
                    <div className="flex flex-row gap-2">
                        <Checkbox
                            id={id + 'follow_anim'}
                            checked={extraChartsFollowAnimation}
                            onCheckedChange={setExtraChartsFollowAnimation}
                        />
                        <label
                            htmlFor={id + 'follow_anim'}
                            className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Follow animation
                        </label>
                    </div>
                </CardContent>
            )}
            <hr />
            <div className="shrink grow basis-0 overflow-y-auto">
                <GeoChart useViewOptionsStore={useViewOptionsStore} />
                <hr />
                <CompletionChart useViewOptionsStore={useViewOptionsStore} />
                <hr />
                <HealthChart useViewOptionsStore={useViewOptionsStore} />
            </div>
        </Card>
    );
}
