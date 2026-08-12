import { Bounds } from './bounds.ts';
import type { SpriteInfoGenerated } from './sprite-info-generated.ts';

export function spriteInfoBounds(visualBounds: Bounds, spriteInfo: SpriteInfoGenerated): Bounds {
	const widthScaler = visualBounds.sizeX / spriteInfo.size.x;
	const heightScaler = visualBounds.sizeY / spriteInfo.size.y;

	return Bounds.fromMinXYSizeXY(
		visualBounds.minX + spriteInfo.padding.x * widthScaler,
		visualBounds.minY + spriteInfo.padding.w * heightScaler,
		visualBounds.sizeX - (spriteInfo.padding.x + spriteInfo.padding.z) * widthScaler,
		visualBounds.sizeY - (spriteInfo.padding.y + spriteInfo.padding.w) * heightScaler,
	);
}
