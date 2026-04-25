import { localized, LocalizedString } from '~/lib/viz/store/localization-store';
import { ToolItemNameSilk } from './tool-item-silk.generated';

export function toolItemSubtitle(item: ToolItemNameSilk): LocalizedString | undefined {
	switch (item) {
		case 'WebShot Architect':
			return localized.raw('Twelfth Architect');
		case 'WebShot Weaver':
			return localized.raw('Original');
		case 'WebShot Forge':
			return localized.raw('Forge Daughter');
		default:
			return undefined;
	}
}
