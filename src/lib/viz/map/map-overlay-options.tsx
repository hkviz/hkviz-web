import { createUniqueId, type Component } from 'solid-js';
import { assertNever } from '~/lib/parser';
import { mapZoomStore, ZoomFollowTarget } from '../store';
import { Card } from '~/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';

function zoomFollowTargetName(target: ZoomFollowTarget) {
	switch (target) {
		case 'current-zone':
			return 'Current area';
		case 'visible-rooms':
			return 'Visible map';
		default:
			assertNever(target);
	}
}

export const MapOverlayOptions: Component = () => {
	const id = createUniqueId();
	// const showAreaNames = roomDisplayStore.showAreaNames();
	// const showSubAreaNames = roomDisplayStore.showSubAreaNames();

	const zoomFollowTarget = mapZoomStore.target;
	const zoomFollowEnabled = mapZoomStore.enabled;
	const zoomFollowTransition = mapZoomStore.transition;

	return (
		<Card class="flex flex-col gap-2 bg-opacity-30 p-2 pr-1 pt-1">
			{/* <div class="flex flex-col gap-1">
                <h3 class="flex flex-row items-center gap-1 text-base font-semibold">
                    <Text class="h-4 w-4" />
                    Show area names
                </h3>
                <div class="flex flex-row">
                    <div class="flex flex-row items-center">
                        <Checkbox
                            id={id + 'show_area_names'}
                            checked={showAreaNames}
                            onCheckedChange={(c) => (roomDisplayStore.showAreaNames() = c === true)}
                        />
                        <label
                            htmlFor={id + 'show_area_names'}
                            class="grow pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Main areas
                        </label>
                    </div>
                    <div class="flex flex-row items-center">
                        <Checkbox
                            id={id + 'show_sub_area_names'}
                            checked={showSubAreaNames}
                            onCheckedChange={(c) => (roomDisplayStore.showSubAreaNames()) = c === true)}
                        />
                        <label
                            htmlFor={id + 'show_sub_area_names'}
                            class="grow pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Sub areas
                        </label>
                    </div>
                </div>
            </div>
            <Separator /> */}
			<div class="auto-zoom-option flex flex-col gap-1">
				<h3 class="flex flex-row items-center gap-1 text-base font-semibold">
					{/* <Fullscreen class="h-4 w-4" /> */}
					Auto zoom to
					<Select
						value={zoomFollowTarget()}
						onChange={(v) => {
							mapZoomStore.setEnabled(true);
							mapZoomStore.setTarget(v!);
						}}
						options={[
							'current-zone' satisfies ZoomFollowTarget,
							'visible-rooms' satisfies ZoomFollowTarget,
						]}
						placeholder="Zoom target"
						itemComponent={(props) => (
							<SelectItem item={props.item}>{zoomFollowTargetName(props.item.rawValue)}</SelectItem>
						)}
					>
						<SelectTrigger aria-label="Zoom target" class="h-8 w-fit py-1 pl-2 pr-1 text-[0.7rem]">
							<SelectValue<ZoomFollowTarget>>
								{(state) => zoomFollowTargetName(state.selectedOption())}
							</SelectValue>
						</SelectTrigger>
						<SelectContent />
					</Select>
				</h3>
				<div class="flex flex-row gap-2">
					<div class="flex flex-row items-center">
						<Checkbox
							id={id + 'zoom_follow_zone'}
							checked={zoomFollowEnabled()}
							onChange={(c) => {
								mapZoomStore.setEnabled(c);
							}}
						/>
						<label
							for={id + 'zoom_follow_zone-input'}
							class="grow pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Enabled
						</label>
					</div>
					<div class="flex flex-row items-center">
						<Checkbox
							id={id + 'zoom_follow_transition'}
							checked={zoomFollowTransition()}
							onChange={(c) => {
								mapZoomStore.setTransition(c);
							}}
							disabled={!zoomFollowEnabled}
						/>
						<label
							for={id + 'zoom_follow_transition-input'}
							class="grow pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Smooth
						</label>
					</div>
				</div>
			</div>
		</Card>
	);
};
