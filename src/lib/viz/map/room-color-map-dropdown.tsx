import { For, type Component } from 'solid-js';
import {
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuGroupLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '~/components/ui/dropdown-menu';
import { roomColorCurveById, roomColorCurves } from '../color-curves';
import { roomColorMaps } from '../color-map';
import { useRoomColoringStore, useThemeStore } from '../store';

export const RoomColorMapDropdown: Component = () => {
	const roomColoringStore = useRoomColoringStore();
	const themeStore = useThemeStore();

	return (
		<DropdownMenuContent>
			<DropdownMenuGroup>
				<DropdownMenuGroupLabel>Scale Curve</DropdownMenuGroupLabel>
				<DropdownMenuRadioGroup
					value={roomColoringStore.var1Curve().id}
					onChange={(id) => {
						roomColoringStore.setRoomColorVar1Curve(roomColorCurveById.get(id)!);
					}}
				>
					<For each={roomColorCurves}>
						{(curve) => <DropdownMenuRadioItem value={curve.id}>{curve.name}</DropdownMenuRadioItem>}
					</For>
				</DropdownMenuRadioGroup>
			</DropdownMenuGroup>
			<DropdownMenuGroup>
				<DropdownMenuGroupLabel>Color Map</DropdownMenuGroupLabel>
				<DropdownMenuRadioGroup
					value={roomColoringStore.singleVarColorMapId()}
					onChange={(id) => {
						roomColoringStore.setSingleVarColorMapId(id);
					}}
				>
					<For each={roomColorMaps}>
						{(colorMap) => (
							<DropdownMenuRadioItem value={colorMap.id}>
								{themeStore.currentTheme() === 'light' ? colorMap.nameLight : colorMap.nameDark}
							</DropdownMenuRadioItem>
						)}
					</For>
				</DropdownMenuRadioGroup>
			</DropdownMenuGroup>
		</DropdownMenuContent>
	);
};
