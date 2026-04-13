import { Vector3 } from '~/lib/game-data/shared/vector-3';
import { Vector2 } from '~/lib/game-data/shared/vectors';
import {
	CollectableItemsDataSilk,
	CollectableMementosDataSilk,
	CollectableRelicsDataSilk,
	EnemyJournalKillDataSilk,
	MateriumItemsDataSilk,
	QuestCompletionDataSilk,
	QuestRumourDataSilk,
	ToolCrestsDataSilk,
	ToolItemLiquidsDataSilk,
	ToolItemsDataSilk,
} from '~/lib/game-data/silk-data/types/player-data-custom-types-silk';

export type StoryEventInfoSilk = {
	eventType: number;
	sceneName: string;
	playTime: number;
};

export class SilkRecordingDataView {
	private readonly view: DataView;
	private readonly textDecoder = new TextDecoder();

	public offset = 0;

	public constructor(private readonly buffer: ArrayBuffer) {
		this.view = new DataView(buffer);
	}

	public get byteLength(): number {
		return this.view.byteLength;
	}

	public ensure(bytes: number): void {
		if (this.offset + bytes > this.view.byteLength) {
			throw new Error(`EOF: need ${bytes} bytes at ${this.offset}`);
		}
	}

	public readUint8(): number {
		this.ensure(1);
		return this.view.getUint8(this.offset++);
	}

	public readInt16(): number {
		this.ensure(2);
		const value = this.view.getInt16(this.offset, true);
		this.offset += 2;
		return value;
	}

	public readInt32(): number {
		this.ensure(4);
		const value = this.view.getInt32(this.offset, true);
		this.offset += 4;
		return value;
	}

	public readUint16(): number {
		this.ensure(2);
		const value = this.view.getUint16(this.offset, true);
		this.offset += 2;
		return value;
	}

	public readUint32(): number {
		this.ensure(4);
		const value = this.view.getUint32(this.offset, true);
		this.offset += 4;
		return value;
	}

	public readInt64(): number {
		this.ensure(8);
		const value = Number(this.view.getBigInt64(this.offset, true));
		this.offset += 8;
		return value;
	}

	public readUint64(): number {
		this.ensure(8);
		const value = Number(this.view.getBigUint64(this.offset, true));
		this.offset += 8;
		return value;
	}

	public readBool(): boolean {
		return this.readUint8() !== 0;
	}

	public readFloat32(): number {
		this.ensure(4);
		const value = this.view.getFloat32(this.offset, true);
		this.offset += 4;
		return value;
	}

	public readString(): string {
		const length = this.readInt32();
		if (length < 0) {
			throw new Error(`Invalid string length ${length} at ${this.offset - 4}`);
		}

		this.ensure(length);
		const bytes = new Uint8Array(this.buffer, this.offset, length);
		this.offset += length;
		return this.textDecoder.decode(bytes);
	}

	public readVector2(): Vector2 {
		const x = this.readFloat32();
		const y = this.readFloat32();
		return new Vector2(x, y);
	}

	public readVector3(): Vector3 {
		const x = this.readFloat32();
		const y = this.readFloat32();
		const z = this.readFloat32();
		return new Vector3(x, y, z);
	}

	public readStringArray(): string[] {
		const count = this.readInt32();
		if (count < 0) {
			throw new Error(`Invalid string array count ${count} at ${this.offset - 4}`);
		}

		const values: string[] = [];
		for (let i = 0; i < count; i++) {
			values.push(this.readString());
		}
		return values;
	}

	public readStoryEventInfo(): StoryEventInfoSilk {
		return {
			eventType: this.readInt32(),
			sceneName: this.readString(),
			playTime: this.readFloat32(),
		};
	}

	public readWrappedVector2List(): Vector2[] {
		const count = this.readInt32();
		if (count < 0) {
			throw new Error(`Invalid wrapped vector2 list count ${count} at ${this.offset - 4}`);
		}

		const values: Vector2[] = [];
		for (let i = 0; i < count; i++) {
			values.push(this.readVector2());
		}
		return values;
	}

	public readCollectableItemsData(): CollectableItemsDataSilk {
		return {
			Amount: this.readInt32(),
			IsSeenMask: this.readInt32(),
			AmountWhileHidden: this.readInt32(),
		};
	}

	public readCollectableRelicsData(): CollectableRelicsDataSilk {
		return {
			IsCollected: this.readBool(),
			IsDeposited: this.readBool(),
			HasSeenInRelicBoard: this.readBool(),
		};
	}

	public readCollectableMementosData(): CollectableMementosDataSilk {
		return {
			IsDeposited: this.readBool(),
			HasSeenInRelicBoard: this.readBool(),
		};
	}

	public readQuestRumourData(): QuestRumourDataSilk {
		return {
			HasBeenSeen: this.readBool(),
			IsAccepted: this.readBool(),
		};
	}

	public readQuestCompletionData(): QuestCompletionDataSilk {
		return {
			HasBeenSeen: this.readBool(),
			IsAccepted: this.readBool(),
			CompletedCount: this.readInt32(),
			IsCompleted: this.readBool(),
			WasEverCompleted: this.readBool(),
		};
	}

	public readMateriumItemsData(): MateriumItemsDataSilk {
		return {
			IsCollected: this.readBool(),
			HasSeenInRelicBoard: this.readBool(),
		};
	}

	public readToolItemLiquidsData(): ToolItemLiquidsDataSilk {
		return {
			RefillsLeft: this.readInt32(),
			SeenEmptyState: this.readBool(),
			UsedExtra: this.readBool(),
		};
	}

	public readToolItemsData(): ToolItemsDataSilk {
		return {
			IsUnlocked: this.readBool(),
			IsHidden: this.readBool(),
			HasBeenSeen: this.readBool(),
			HasBeenSelected: this.readBool(),
			AmountLeft: this.readInt32(),
		};
	}

	public readToolCrestsData(): ToolCrestsDataSilk {
		const isUnlocked = this.readBool();
		const slotsCount = this.readInt32();
		if (slotsCount < 0) {
			throw new Error(`Invalid tool crests slot count ${slotsCount} at ${this.offset - 4}`);
		}

		const slots = [];
		for (let i = 0; i < slotsCount; i++) {
			slots.push({
				EquippedTool: this.readString(),
				IsUnlocked: this.readBool(),
			});
		}

		const displayNewIndicator = this.readBool();
		return {
			IsUnlocked: isUnlocked,
			Slots: slots,
			DisplayNewIndicator: displayNewIndicator,
		};
	}

	public readEnemyJournalKillData(): EnemyJournalKillDataSilk {
		return {
			Kills: this.readInt32(),
			HasBeenSeen: this.readBool(),
		};
	}

	public readGuid(): string {
		this.ensure(16);
		const bytes = new Uint8Array(this.buffer, this.offset, 16);
		this.offset += 16;

		const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	}
}
