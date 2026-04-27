export class StorageStats {
	public readonly perEntryStats: Map<string, { count: number; size: number }> = new Map();
	public totalSize = 0;

	constructor() {}

	public addStat(key: string, count: number, size: number) {
		const existing = this.perEntryStats.get(key);
		if (existing) {
			existing.count += count;
			existing.size += size;
		} else {
			this.perEntryStats.set(key, { count, size });
		}
		this.totalSize += size;
	}

	public print() {
		const table = this.perEntryStats
			.entries()
			.toArray()
			.sort(([, a], [, b]) => b.size - a.size)
			.map(([key, { size, count }]) => ({
				key,
				size,
				count,
				averageSize: size / count,
				percentage: (size / this.totalSize) * 100,
			}));

		console.table(table);

		return (
			'EntryTypeAndField\tTotalSize\tCount\tAverageSize\tPercentageOfFile\n' +
			table
				// .slice(0, 100)
				// return as tab seperated value string
				.map(
					({ key, size, count, averageSize, percentage }) =>
						`${key}\t${size}\t${count}\t${averageSize.toFixed(2)}\t${percentage / 100}`,
				)
				.join('\n')
		);
	}
}

export function combineStorageStats(stats: StorageStats[]): StorageStats {
	const combinedStats: StorageStats = new StorageStats();
	for (const stat of stats) {
		for (const [key, value] of stat.perEntryStats.entries()) {
			combinedStats.addStat(key, value.count, value.size);
		}
	}
	return combinedStats;
}
