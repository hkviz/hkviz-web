import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useId } from 'react';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { GeoChart } from './geo-chart';

export interface RunExtraChartsProps {
    useViewOptionsStore: UseViewOptionsStore;
}

export function RunExtraCharts({ useViewOptionsStore }: RunExtraChartsProps) {
    const id = useId();
    const extraChartsFollowAnimation = useViewOptionsStore((s) => s.extraChartsFollowAnimation);
    const setExtraChartsFollowAnimation = useViewOptionsStore((s) => s.setExtraChartsFollowAnimation);
    const isAnythingAnimating = useViewOptionsStore((s) => s.isAnythingAnimating);

    return (
        <Card className="overflow-hidden">
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
            <GeoChart useViewOptionsStore={useViewOptionsStore} />
        </Card>
    );
}
