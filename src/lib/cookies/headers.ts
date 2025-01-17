export function combineHeaders(...headerLikes: (HeadersInit | undefined | null)[]): HeadersInit | undefined {
	if (headerLikes.length === 0) {
		return undefined;
	}
	if (headerLikes.length === 1) {
		return headerLikes[0] ?? undefined;
	}

	const combined: [string, string][] = [];

	for (const headerLike of headerLikes) {
		if (!headerLike) {
			continue;
		} else if (Array.isArray(headerLike)) {
			combined.push(...headerLike);
		} else if (headerLike instanceof Headers) {
			headerLike.forEach((value, name) => {
				combined.push([name, value]);
			});
		} else {
			for (const [name, value] of Object.entries(headerLike)) {
				if (value != null) {
					combined.push([name, value]);
				}
			}
		}
	}

	return combined;
}
