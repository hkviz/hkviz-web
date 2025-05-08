export function lerp(start: number, end: number, t: number): number {
	return start + (end - start) * t;
}

export function reverseLerp(start: number, end: number, value: number): number {
	return (value - start) / (end - start);
}
