import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useId } from 'react';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';

export function MapOverlayOptions({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const id = useId();
    const showAreaNames = useViewOptionsStore((s) => s.showAreaNames);
    const showSubAreaNames = useViewOptionsStore((s) => s.showSubAreaNames);
    const setShowAreaNames = useViewOptionsStore((s) => s.setShowAreaNames);
    const setShowSubAreaNames = useViewOptionsStore((s) => s.setShowSubAreaNames);
    return (
        <Card className="flex flex-col gap-2 p-3">
            <div className="flex flex-row items-center gap-2">
                <Checkbox id={id + 'show_area_names'} checked={showAreaNames} onCheckedChange={setShowAreaNames} />
                <label
                    htmlFor={id + 'show_area_names'}
                    className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Show area names
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
                    Show sub area names
                </label>
            </div>
        </Card>
    );
}
