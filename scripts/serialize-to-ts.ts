import { Bounds } from '../src/lib/game-data/shared/bounds.ts';
import { Vector4 } from '../src/lib/game-data/shared/vector4.ts';
import { Vector3 } from '../src/lib/game-data/shared/vector3.ts';
import { Vector2 } from '../src/lib/game-data/shared/vector2.ts';
import * as d3 from 'd3';

function isValidIdentifier(key: string): boolean {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

interface SerializedTsValue {
	data: string;
	imports: string;
}

export function serializeToTs(value: any, imports: Set<string>, gameDataRoot = '../'): string {
	// Handle special classes first
	if (value instanceof Vector3) {
		imports.add(`import { vec3 } from '${gameDataRoot}shared/vector3.ts';`);
		return `vec3(${value.x}, ${value.y}, ${value.z})`;
	}
	if (value instanceof Vector2) {
		imports.add(`import { vec2 } from '${gameDataRoot}shared/vector2.ts';`);
		return `vec2(${value.x}, ${value.y})`;
	}
	if (value instanceof Vector4) {
		imports.add(`import { vec4 } from '${gameDataRoot}shared/vector4.ts';`);
		return `vec4(${value.x}, ${value.y}, ${value.z}, ${value.w})`;
	}
	if (value instanceof Bounds) {
		imports.add(`import { boundsMinXYMaxXY } from '${gameDataRoot}shared/bounds.ts';`);
		return `boundsMinXYMaxXY(${value.min.x}, ${value.min.y}, ${value.max.x}, ${value.max.y})`;
	}
	if (value instanceof d3.hsl) {
		imports.add('import * as d3 from "d3";');
		return `d3.hsl(${value.h.toFixed(1)}, ${value.s.toFixed(3)}, ${value.l.toFixed(3)})`;
	}

	// Arrays
	if (Array.isArray(value)) {
		return `[${value.map((v) => serializeToTs(v, imports, gameDataRoot)).join(', ')}]`;
	}

	// Plain objects
	if (value && typeof value === 'object') {
		const entries = Object.entries(value).map(([key, val]) => {
			return `${isValidIdentifier(key) ? key : JSON.stringify(key)}: ${serializeToTs(val, imports, gameDataRoot)}`;
		});

		return `{ ${entries.join(', ')} }`;
	}

	// Primitives
	return JSON.stringify(value);
}

export function serializeToTsWithImports(value: any): SerializedTsValue {
	const imports = new Set<string>();
	const data = serializeToTs(value, imports);
	return { data, imports: Array.from(imports).join('\n') };
}
