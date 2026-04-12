import * as d3 from 'd3';
import { Vector3Like, Vector4Like } from './vector-like';

export function colorFromRgbVector(vec: Vector3Like) {
	return d3.rgb(vec.x * 255, vec.y * 255, vec.z * 255);
}

export function colorFromRgbaVector(vec: Vector4Like) {
	const c = colorFromRgbVector(vec);
	c.opacity = vec.w;
	return c;
}
