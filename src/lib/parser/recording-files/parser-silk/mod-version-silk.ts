export const modVersionsSilk = ['0.1.0'] as const;
export type ModVersionSilk = (typeof modVersionsSilk)[number];

export const modVersionToRecordingFileVersionSilk = {
	'0.1.0': 0x01,
} as const satisfies Record<ModVersionSilk, number>;

export const recordingFileVersionsSilk = Object.values(modVersionToRecordingFileVersionSilk);

export const recordingFileVersionToModVersionSilk = Object.fromEntries(
	Object.entries(modVersionToRecordingFileVersionSilk).map(([modVersion, recordingFileVersion]) => [
		recordingFileVersion,
		modVersion,
	]),
) as Record<number, ModVersionSilk>;
