import { Focus, Fullscreen, Group } from 'lucide-solid';
import { JSXElement, type Component } from 'solid-js';
import { ShortcutHint } from '~/components/shortcut-hint';
import { overlayBlurBackgroundClasses } from '~/components/ui/additions/overlay';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { useMapZoomStore, useUiStore, ZoomFollowTarget } from '../store';

const MapZoomButton: Component<{
	state: ZoomFollowTarget;
	tooltipHeading: JSXElement;
	tooltipBody: JSXElement;
	children: JSXElement;
}> = (props) => {
	return (
		<Tooltip>
			<TooltipTrigger
				as={ToggleGroupItem<'button'>}
				value={props.state}
				class={cn(
					overlayBlurBackgroundClasses,
					'bg-card/50 data-pressed:bg-primary/80 data-pressed:text-primary-foreground h-9 w-9 rounded-full px-0 backdrop-blur-xs',
				)}
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
				tooltipHeading="Show whole map"
				tooltipBody="Show the entire map at once"
			>
				<Fullscreen class="h-4 w-4" />
			</MapZoomButton>

			<MapZoomButton
				state="current-area-smooth"
				tooltipHeading="Follow player automatic zoom level"
				tooltipBody={
					<>
						Tends to center the current area.
						<br />
						Zooms out when the player is moving between areas.
					</>
				}
			>
				<Group class="h-4 w-4" />
			</MapZoomButton>

			<MapZoomButton
				state="current-area"
				tooltipHeading="Follow player's area"
				tooltipBody="Keep the current area centered on the screen"
			>
				<Focus class="h-4 w-4" />
			</MapZoomButton>
		</ToggleGroup>
	);
};
