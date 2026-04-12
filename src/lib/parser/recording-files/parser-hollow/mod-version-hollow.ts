export const recordingFileVersionsHollow = [
	/**
	 * No file changes
	 *
	 * Other mod changes:
	 * - uses rich text for mod version info display
	 */
	'1.6.1',

	/**
	 * No file changes
	 *
	 * Other mod changes:
	 * - provides mod version when initializing file upload
	 * - better handling for failed file uploads
	 */
	'1.6.0',

	/**
	 * No file changes
	 */
	'1.5.1',

	/**
	 * Changes in format:
	 * - writes mod info as name:version:enabled_errorenum instead of name:[version or error] gotten from the mod loader display string.
	 * - also fixes that mods are not written when to many are installed.
	 *
	 * Other mod changes:
	 * - fixes decoration master not loading
	 * - checks mod version when loading
	 */
	'1.5.0',

	/**
	 * - writes hero state .transitioning
	 * - writes info when HeroController.TakeDamage is called, aka. about how much damage, and who deals it
	 * - writes info when PlayerData.TakeHealth is called, after hc.TakeDamage is called, which contains the final health value
	 * - writes empty line at beginning, so unfinished files will not create problems for new entries.
	 */
	'1.4.0',

	/**
	 * (first version in mod list)
	 * used by mod version 1.1.0, 1.2.0 and 1.3.0
	 */
	'1.1.0',

	/**
	 * (introduced before mod was published)
	 * added logging of enemy health and creation
	 * and changed format of position event
	 * does not only contain player positions, but also enemy positions
	 * logged in lower resolution, now logged as x*10;y*10 without decimal places it was logged as x;y with decimal places using local culture before
	 */
	'1.0.0',

	/**
	 * first version (introduced before mod was published)
	 */
	'0.0.0',
] as const;

export const recordingFileVersionNewestHollow: RecordingFileVersionHollow = recordingFileVersionsHollow[0];

export type RecordingFileVersionHollow = (typeof recordingFileVersionsHollow)[number];
export type ModVersionHollow = `${RecordingFileVersionHollow}.0` | '1.2.0.0' | '1.3.0.0';

export function recordingFileVersionIsKnownHollow(version: string): version is RecordingFileVersionHollow {
	return recordingFileVersionsHollow.includes(version as RecordingFileVersionHollow);
}

export type RecordingFileVersion0xxHollow = '0.0.0';
export function isRecordingFileVersion0xxHollow(
	version: RecordingFileVersionHollow,
): version is RecordingFileVersion0xxHollow {
	return version === '0.0.0';
}

export type RecordingFileVersion1xxHollow = '1.0.0' | '1.1.0' | '1.4.0' | '1.5.0' | '1.5.1';
export function isRecordingVersion1xxHollow(
	version: RecordingFileVersionHollow,
): version is RecordingFileVersion1xxHollow {
	return (
		version === '1.0.0' || version === '1.1.0' || version === '1.4.0' || version === '1.5.0' || version === '1.5.1'
	);
}

export function isRecordingVersionBefore1_4_0(
	version: RecordingFileVersionHollow,
): version is RecordingFileVersion0xxHollow | '1.0.0' | '1.1.0' {
	return isRecordingFileVersion0xxHollow(version) || version === '1.0.0' || version === '1.1.0';
}

export function isModVersionBefore1_6_0Hollow(version: ModVersionHollow): boolean {
	return (
		version === '0.0.0.0' ||
		version === '1.0.0.0' ||
		version === '1.1.0.0' ||
		version === '1.2.0.0' ||
		version === '1.3.0.0' ||
		version === '1.4.0.0' ||
		version === '1.5.0.0' ||
		version === '1.5.1.0'
	);
}
