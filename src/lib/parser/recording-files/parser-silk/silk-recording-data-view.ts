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
	StoryEventInfoSilk,
	ToolCrestsDataSilk,
	ToolCrestsSlotDataSilk,
	ToolItemLiquidsDataSilk,
	ToolItemsDataSilk,
} from '~/lib/game-data/silk-data/types/player-data-custom-types-silk';
import { uint16Max } from './number-types';
import { getIdLookupDebugName, stringIdMappingSilk } from './string-id-by-field-silk';

export class SilkRecordingDataView {
	private readonly view: DataView;
	private readonly textDecoder = new TextDecoder();

	public offset = 0;

	public logState: unknown = null;

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

	public readStringWithId(idToString: Map<number, string>): string | null {
		const id = this.readUint16();
		if (id === uint16Max) {
			//console.log('[parser][string-lookup] Read null string id');
			return null;
		}
		if (id === uint16Max - 1) {
			//console.log('[parser][string-lookup] Read empty string id');
			return '';
		}
		if (id === 0) {
			// unknown id -> read string
			const value = this.readString();
			console.log(
				'[parser][string-lookup] Using map',
				getIdLookupDebugName(idToString),
				this.logState,
				'Read non-id string: ',
				value,
			);
			// console.trace();
			return value;
		}
		// console.log('Read string id', id, 'which maps to string', idToString.get(id));
		const mapped = idToString.get(id);
		if (mapped == null) {
			console.warn(
				`[parser][string-lookup] Missing string mapping for id ${id} in map ${getIdLookupDebugName(
					idToString,
				)} while parsing field`,
				this.logState,
			);
			return `unknown_id_${id}`;
		}
		return mapped;
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

	public readStringArrayWithIds(idToString: Map<number, string>): (string | null)[] {
		const count = this.readInt32();
		if (count < 0) {
			throw new Error(`Invalid string or id array count ${count} at ${this.offset - 4}`);
		}

		const values: (string | null)[] = [];
		for (let i = 0; i < count; i++) {
			values.push(this.readStringWithId(idToString));
		}
		return values;
	}

	public readStoryEventInfo(): StoryEventInfoSilk {
		return {
			eventType: this.readInt32(),
			sceneName: this.readStringWithId(stringIdMappingSilk.sceneName) ?? '',
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
		const packed = this.readUint8();
		return {
			IsCollected: (packed & (1 << 0)) !== 0,
			IsDeposited: (packed & (1 << 1)) !== 0,
			HasSeenInRelicBoard: (packed & (1 << 2)) !== 0,
		};
	}

	public readCollectableMementosData(): CollectableMementosDataSilk {
		const packed = this.readUint8();
		return {
			IsDeposited: (packed & (1 << 0)) !== 0,
			HasSeenInRelicBoard: (packed & (1 << 1)) !== 0,
		};
	}

	public readQuestRumourData(): QuestRumourDataSilk {
		const packed = this.readUint8();
		return {
			HasBeenSeen: (packed & (1 << 0)) !== 0,
			IsAccepted: (packed & (1 << 1)) !== 0,
		};
	}

	public readQuestCompletionData(): QuestCompletionDataSilk {
		const packed = this.readUint8();
		const completedCount = this.readInt32();
		return {
			HasBeenSeen: (packed & (1 << 0)) !== 0,
			IsAccepted: (packed & (1 << 1)) !== 0,
			CompletedCount: completedCount,
			IsCompleted: (packed & (1 << 2)) !== 0,
			WasEverCompleted: (packed & (1 << 3)) !== 0,
		};
	}

	public readMateriumItemsData(): MateriumItemsDataSilk {
		const packed = this.readUint8();
		return {
			IsCollected: (packed & (1 << 0)) !== 0,
			HasSeenInRelicBoard: (packed & (1 << 1)) !== 0,
		};
	}

	public readToolItemLiquidsData(): ToolItemLiquidsDataSilk {
		const packed = this.readUint8();
		const refillsLeft = this.readInt32();
		return {
			RefillsLeft: refillsLeft,
			SeenEmptyState: (packed & (1 << 0)) !== 0,
			UsedExtra: (packed & (1 << 1)) !== 0,
		};
	}

	public readToolItemsData(): ToolItemsDataSilk {
		const packed = this.readUint8();
		const amountLeft = this.readInt32();
		return {
			IsUnlocked: (packed & (1 << 0)) !== 0,
			IsHidden: (packed & (1 << 1)) !== 0,
			HasBeenSeen: (packed & (1 << 2)) !== 0,
			HasBeenSelected: (packed & (1 << 3)) !== 0,
			AmountLeft: amountLeft,
		};
	}

	public readToolCrestsSlotData(): ToolCrestsSlotDataSilk {
		return {
			EquippedTool: this.readStringWithId(stringIdMappingSilk.tool) ?? '',
			IsUnlocked: this.readBool(),
		};
	}

	public readToolCrestsData(): ToolCrestsDataSilk {
		const packed = this.readUint8();
		const slotsCount = this.readInt32();

		const isUnlocked = (packed & (1 << 0)) !== 0;
		const displayNewIndicator = (packed & (1 << 1)) !== 0;

		if (slotsCount < 0) {
			throw new Error(`Invalid tool crests slot count ${slotsCount} at ${this.offset - 4}`);
		}

		const slots: ToolCrestsSlotDataSilk[] = [];
		for (let i = 0; i < slotsCount; i++) {
			slots.push(this.readToolCrestsSlotData());
		}

		return {
			IsUnlocked: isUnlocked,
			Slots: slots,
			DisplayNewIndicator: displayNewIndicator,
		};
	}

	public readEnemyJournalKillData(): EnemyJournalKillDataSilk {
		const hasBeenSeen = this.readBool();
		const kills = this.readInt32();
		return {
			Kills: kills,
			HasBeenSeen: hasBeenSeen,
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
