type HeaderLike = Record<string, string | undefined> | [string, string][];

export function combineHeaders(...headerLikes: HeaderLike[]) {
	const combined: [string, string][] = [];

	for (const headerLike of headerLikes) {
		if (Array.isArray(headerLike)) {
			combined.push(...headerLike);
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
