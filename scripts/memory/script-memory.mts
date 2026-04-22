import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function readGenMemory<T>(fileName: string): Promise<T | null> {
	const filePath = path.join('./scripts/memory', fileName);
	try {
		const data = await readFile(filePath, 'utf-8');
		return JSON.parse(data) as T;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return null;
		}

		throw error;
	}
}

export async function writeGenMemory<T>(fileName: string, content: T) {
	const filePath = path.join('./scripts/memory', fileName);
	await writeFile(filePath, JSON.stringify(content, null, '\t'), 'utf-8');
}

export class ScriptMemory<T> {
	public readonly name: string;
	public data: T;

	protected constructor(name: string, data: T) {
		this.name = name;
		this.data = data;
	}

	static async createMemory<T>(name: string, defaultData: () => T): Promise<ScriptMemory<T>> {
		let data: T | null = await readGenMemory<T>(`${name}.json`);
		if (data == null) {
			data = defaultData();
		}
		return new ScriptMemory(name, data);
	}

	write() {
		return writeGenMemory(`${this.name}.json`, this.data);
	}
}

export type ScriptIdMemoryData = { [key: string]: number };
export class ScriptIdMemory extends ScriptMemory<ScriptIdMemoryData> {
	maxId: number = 0;

	constructor(name: string, data: ScriptIdMemoryData) {
		super(name, data);
		this.maxId = Math.max(...Object.values(data), 0);
	}

	public getOrCreateId(key: string): number {
		if (this.data[key] != null) {
			return this.data[key];
		}
		const newId = this.maxId + 1;
		this.data[key] = newId;
		this.maxId = newId;
		return newId;
	}

	static async createIdMemory(name: string): Promise<ScriptIdMemory> {
		let data: ScriptIdMemoryData | null = await readGenMemory<ScriptIdMemoryData>(`${name}.json`);
		if (data == null) {
			data = {};
		}
		return new ScriptIdMemory(name, data);
	}

	public ids(): string[] {
		return Object.keys(this.data);
	}

	public idsLower(): string[] {
		return this.ids().map((it) => it.toLowerCase());
	}
}
