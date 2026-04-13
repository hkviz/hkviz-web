export interface CollectableItemsDataSilk {
	readonly Amount: number;
	readonly IsSeenMask: number;
	readonly AmountWhileHidden: number;
}

export interface CollectableRelicsDataSilk {
	readonly IsCollected: boolean;
	readonly IsDeposited: boolean;
	readonly HasSeenInRelicBoard: boolean;
}

export interface CollectableMementosDataSilk {
	readonly IsDeposited: boolean;
	readonly HasSeenInRelicBoard: boolean;
}

export interface QuestRumourDataSilk {
	readonly HasBeenSeen: boolean;
	readonly IsAccepted: boolean;
}

export interface QuestCompletionDataSilk {
	readonly HasBeenSeen: boolean;
	readonly IsAccepted: boolean;
	readonly CompletedCount: number;
	readonly IsCompleted: boolean;
	readonly WasEverCompleted: boolean;
}

export interface MateriumItemsDataSilk {
	readonly IsCollected: boolean;
	readonly HasSeenInRelicBoard: boolean;
}

export interface ToolItemLiquidsDataSilk {
	readonly RefillsLeft: number;
	readonly SeenEmptyState: boolean;
	readonly UsedExtra: boolean;
}

export interface ToolItemsDataSilk {
	readonly IsUnlocked: boolean;
	readonly IsHidden: boolean;
	readonly HasBeenSeen: boolean;
	readonly HasBeenSelected: boolean;
	readonly AmountLeft: number;
}

export interface ToolCrestsSlotDataSilk {
	readonly EquippedTool: string;
	readonly IsUnlocked: boolean;
}

export interface ToolCrestsDataSilk {
	readonly IsUnlocked: boolean;
	readonly Slots: readonly ToolCrestsSlotDataSilk[];
	readonly DisplayNewIndicator: boolean;
}

export interface EnemyJournalKillDataSilk {
	readonly Kills: number;
	readonly HasBeenSeen: boolean;
}

export type StoryEventInfoSilk = {
	eventType: number;
	sceneName: string;
	playTime: number;
};
