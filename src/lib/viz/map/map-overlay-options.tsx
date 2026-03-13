import { Focus, Fullscreen, Group } from 'lucide-solid';
import { JSXElement, type Component } from 'solid-js';
import { ShortcutHint } from '~/components/shortcut-hint';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { useMapZoomStore, useUiStore, ZoomFollowTarget } from '../store';

const MapZoomButton: Component<{
	state: ZoomFollowTarget;
	ariaLabel: string;
	tooltipHeading: JSXElement;
	tooltipBody: JSXElement;
	children: JSXElement;
}> = (props) => {
	return (
		<Tooltip>
			<TooltipTrigger
				as={ToggleGroupItem<'button'>}
				value={props.state}
				aria-label={props.ariaLabel}
				class="bg-card/50 data-pressed:bg-primary/80 data-pressed:text-primary-foreground h-9 w-9 rounded-full px-0 backdrop-blur-xs"
			>
				{props.children}
			</TooltipTrigger>
			<TooltipContent>
				<h3 class="font-semibold">{props.tooltipHeading}</h3>
				<div class="pt-1 opacity-70">{props.tooltipBody}</div>
				<ShortcutHint keys="Z" before="Press" after="to cycle zoom modes" />
			</TooltipContent>
		</Tooltip>
	);
};

export const MapOverlayOptions: Component = () => {
	const mapZoomStore = useMapZoomStore();
	// const showAreaNames = roomDisplayStore.showAreaNames();
	// const showSubAreaNames = roomDisplayStore.showSubAreaNames();

	const uiStore = useUiStore();
	const isOverviewVisible = () => uiStore.mainCardTab() === 'overview';

	return (
		<ToggleGroup
			variant="outline"
			class="auto-zoom-option flex flex-row items-center gap-1"
			value={mapZoomStore.state() === 'off' ? '' : mapZoomStore.state()}
			onChange={(value) => {
				if (!value) {
					mapZoomStore.setState('off');
					return;
				}
				mapZoomStore.setState(value as ZoomFollowTarget);
			}}
			tabIndex={isOverviewVisible() ? -1 : 0}
			aria-hidden={isOverviewVisible()}
		>
			<MapZoomButton
				state="visible-rooms"
				ariaLabel="Show whole map"
				tooltipHeading="Show whole map"
				tooltipBody="Show the entire map at once"
			>
				<Fullscreen class="h-4 w-4" />
			</MapZoomButton>

			<MapZoomButton
				state="current-area-smooth"
				ariaLabel="Follow player automatic zoom level"
				tooltipHeading="Follow player automatic zoom level"
				tooltipBody={
					<>
						Tends to center the current area.
						<br />
						Sometimes zooms out for smoother transitions.
					</>
				}
			>
				<Group class="h-4 w-4" />
			</MapZoomButton>

			<MapZoomButton
				state="current-area"
				ariaLabel="Follow player's area"
				tooltipHeading="Follow player's area"
				tooltipBody="Keep the current area centered on the screen"
			>
				<Focus class="h-4 w-4" />
			</MapZoomButton>
		</ToggleGroup>
		// <Card class="flex flex-col gap-2 p-2 pt-1 pr-1">
		// 	{/* <div class="flex flex-col gap-1">
		//         <h3 class="flex flex-row items-center gap-1 text-base font-semibold">
		//             <Text class="h-4 w-4" />
		//             Show area names
		//         </h3>
		//         <div class="flex flex-row">
		//             <div class="flex flex-row items-center">
		//                 <Checkbox
		//                     id={id + 'show_area_names'}
		//                     checked={showAreaNames}
		//                     onCheckedChange={(c) => (roomDisplayStore.showAreaNames() = c === true)}
		//                 />
		//                 <label
		//                     htmlFor={id + 'show_area_names'}
		//                     class="grow pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		//                 >
		//                     Main areas
		//                 </label>
		//             </div>
		//             <div class="flex flex-row items-center">
		//                 <Checkbox
		//                     id={id + 'show_sub_area_names'}
		//                     checked={showSubAreaNames}
		//                     onCheckedChange={(c) => (roomDisplayStore.showSubAreaNames()) = c === true)}
		//                 />
		//                 <label
		//                     htmlFor={id + 'show_sub_area_names'}
		//                     class="grow pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		//                 >
		//                     Sub areas
		//                 </label>
		//             </div>
		//         </div>
		//     </div>
		//     <Separator /> */}
		// 	<div class="auto-zoom-option flex flex-col gap-1">
		// 		<h3 class="flex flex-row items-center gap-1 text-base font-semibold">
		// 			{/* <Fullscreen class="h-4 w-4" /> */}
		// 			Auto zoom to
		// 			<Select
		// 				value={zoomFollowTarget()}
		// 				onChange={(v) => {
		// 					if (!v) return;
		// 					mapZoomStore.setEnabled(true);
		// 					mapZoomStore.setTarget(v);
		// 				}}
		// 				options={[
		// 					'current-area' satisfies ZoomFollowTarget,
		// 					'visible-rooms' satisfies ZoomFollowTarget,
		// 				]}
		// 				placeholder="Zoom target"
		// 				itemComponent={(props) => (
		// 					<SelectItem item={props.item}>{zoomFollowTargetName(props.item.rawValue)}</SelectItem>
		// 				)}
		// 			>
		// 				<SelectTrigger aria-label="Zoom target" class="h-8 w-fit py-1 pr-1 pl-2 text-[0.7rem]">
		// 					<SelectValue<ZoomFollowTarget>>
		// 						{(state) => zoomFollowTargetName(state.selectedOption())}
		// 					</SelectValue>
		// 				</SelectTrigger>
		// 				<SelectContent />
		// 			</Select>
		// 		</h3>
		// 		<div class="flex flex-row gap-2">
		// 			<div class="flex flex-row items-center">
		// 				<Checkbox
		// 					id={id + 'zoom_follow_zone'}
		// 					checked={zoomFollowEnabled()}
		// 					onChange={(c) => {
		// 						mapZoomStore.setEnabled(c);
		// 					}}
		// 				/>
		// 				<label
		// 					for={id + 'zoom_follow_zone-input'}
		// 					class="grow pl-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		// 				>
		// 					Enabled
		// 				</label>
		// 			</div>
		// 			<div class="flex flex-row items-center">
		// 				<Checkbox
		// 					id={id + 'zoom_follow_transition'}
		// 					checked={zoomFollowTransition()}
		// 					onChange={(c) => {
		// 						mapZoomStore.setTransition(c);
		// 					}}
		// 					disabled={!zoomFollowEnabled}
		// 				/>
		// 				<label
		// 					for={id + 'zoom_follow_transition-input'}
		// 					class="grow pl-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		// 				>
		// 					Smooth
		// 				</label>
		// 			</div>
		// 		</div>
		// 	</div>
		// </Card>
	);
};
