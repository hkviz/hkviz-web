import { Bounds } from './bounds';
import { SpriteInfoGenerated } from './sprite-info-generated';
import { Vector2 } from './vectors';

export function spriteInfoBounds(visualBounds: Bounds, spriteInfo: SpriteInfoGenerated): Bounds {
	const widthScaler = visualBounds.size.x / spriteInfo.size.x;
	const heightScaler = visualBounds.size.y / spriteInfo.size.y;

	const min = new Vector2(
		visualBounds.min.x + spriteInfo.padding.x * widthScaler,
		visualBounds.min.y + spriteInfo.padding.w * heightScaler,
	);
	const size = new Vector2(
		visualBounds.size.x - (spriteInfo.padding.x + spriteInfo.padding.z) * widthScaler,
		visualBounds.size.y - (spriteInfo.padding.y + spriteInfo.padding.w) * heightScaler,
	);

	return Bounds.fromMinSize(min, size);
}
