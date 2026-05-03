import type { SaveSlotCompletionIcons_CompletionStateSilk } from './enum/saveslotcompletionicons_completionstate-enum-silk.generated';

const endingToSprite: Record<SaveSlotCompletionIcons_CompletionStateSilk, string> = {
	None: '',
	Act2Regular: 'completion__0002_Act2_regular',
	Act2Cursed: 'completion__0003_Act2_cursed',
	Act2SoulSnare: 'completion__0001_Act2_soulsnare',
	Act3Ending: 'completion__0000_Act3_ending',
};

export function completionSpriteSilk(completionState: SaveSlotCompletionIcons_CompletionStateSilk) {
	return '/silk-sprites/endings/' + endingToSprite[completionState] + '.png';
}

// todo localize?
const endingToName: Record<SaveSlotCompletionIcons_CompletionStateSilk, string> = {
	None: 'None',
	Act2Regular: 'Weaver Queen',
	Act2Cursed: 'Twisted Child',
	Act2SoulSnare: 'Snared Silk',
	Act3Ending: 'Sister of the Void',
};
export function completionNameSilk(completionState: SaveSlotCompletionIcons_CompletionStateSilk) {
	return endingToName[completionState];
}

const endingToSubtitle: Record<SaveSlotCompletionIcons_CompletionStateSilk, string> = {
	None: '',
	Act2Regular: 'Ending 1',
	Act2Cursed: 'Ending 3',
	Act2SoulSnare: 'Ending 2',
	Act3Ending: 'Ending 4',
};

export function completionSubtitleSilk(completionState: SaveSlotCompletionIcons_CompletionStateSilk) {
	return endingToSubtitle[completionState];
}
