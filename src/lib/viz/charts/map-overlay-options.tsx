import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Fullscreen, Text } from 'lucide-react';
import { useId } from 'react';
import { ZoomFollowTarget, type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';

export function MapOverlayOptions({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const id = useId();
    const showAreaNames = useViewOptionsStore((s) => s.showAreaNames);
    const showSubAreaNames = useViewOptionsStore((s) => s.showSubAreaNames);
    const setShowAreaNames = useViewOptionsStore((s) => s.setShowAreaNames);
    const setShowSubAreaNames = useViewOptionsStore((s) => s.setShowSubAreaNames);

    const zoomFollowTarget = useViewOptionsStore((s) => s.zoomFollowTarget);
    const setZoomFollowTarget = useViewOptionsStore((s) => s.setZoomFollowTarget);
    const zoomFollowEnabled = useViewOptionsStore((s) => s.zoomFollowEnabled);
    const setZoomFollowEnabled = useViewOptionsStore((s) => s.setZoomFollowEnabled);
    const zoomFollowTransition = useViewOptionsStore((s) => s.zoomFollowTransition);
    const setZoomFollowTransition = useViewOptionsStore((s) => s.setZoomFollowTransition);

    return (
        <Card className="flex flex-col gap-2 p-3">
            <div className="flex flex-col gap-1">
                <h3 className="flex flex-row items-center gap-1 text-base font-semibold">
                    <Text className="h-4 w-4" />
                    Show area names
                </h3>
                <div className="flex flex-row gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <Checkbox
                            id={id + 'show_area_names'}
                            checked={showAreaNames}
                            onCheckedChange={setShowAreaNames}
                        />
                        <label
                            htmlFor={id + 'show_area_names'}
                            className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Main areas
                        </label>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Checkbox
                            id={id + 'show_sub_area_names'}
                            checked={showSubAreaNames}
                            onCheckedChange={setShowSubAreaNames}
                        />
                        <label
                            htmlFor={id + 'show_sub_area_names'}
                            className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Sub areas
                        </label>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
                <h3 className="flex flex-row items-center gap-1 text-base font-semibold">
                    <Fullscreen className="h-4 w-4" />
                    Auto zoom to
                    <Select
                        value={zoomFollowTarget}
                        onValueChange={(v) => {
                            setZoomFollowEnabled(true);
                            setZoomFollowTarget(v as ZoomFollowTarget);
                        }}
                    >
                        <SelectTrigger className="h-8 w-fit py-1 pl-2 pr-1 text-[0.7rem]">
                            <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={'current-zone' satisfies ZoomFollowTarget}>Current area</SelectItem>
                                <SelectItem value={'visible-rooms' satisfies ZoomFollowTarget}>Visible map</SelectItem>
                                {/* <SelectItem value={'player-movement' satisfies ZoomFollowTarget}>Player</SelectItem> */}
                                {/* <SelectItem value={'recent-scenes' satisfies ZoomFollowTarget}>
                                    Recent scenes
                                </SelectItem> */}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </h3>
                <div className="flex flex-row gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <Checkbox
                            id={id + 'zoom_follow_zone'}
                            checked={zoomFollowEnabled}
                            onCheckedChange={setZoomFollowEnabled}
                        />
                        <label
                            htmlFor={id + 'zoom_follow_zone'}
                            className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Enabled
                        </label>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Checkbox
                            id={id + 'zoom_follow_transition'}
                            checked={zoomFollowTransition}
                            onCheckedChange={setZoomFollowTransition}
                            disabled={!zoomFollowEnabled}
                        />
                        <label
                            htmlFor={id + 'zoom_follow_transition'}
                            className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Animated
                        </label>
                    </div>
                </div>
            </div>
        </Card>
    );
}
