import { exportCsModFile } from './js-gen-helper.mts';
import { ScriptIdMemory } from './memory/script-memory.mts';

export async function createCsIdDictionaryFile(
	className: string,
	idMemory: ScriptIdMemory,
	constantName: string = 'VALUE_TO_ID',
) {
	await exportCsModFile(
		`${className}.cs`,
		`
using System;
using System.Collections.Generic;

namespace HKViz.Silk.GameData;

public static class ${className} {
    public static readonly Dictionary<string, ushort> ${constantName} = new(StringComparer.OrdinalIgnoreCase) {
${Object.entries(idMemory.data)
	.map(([key, id]) => `        ["${key}"] = ${id},`)
	.join('\n')}
    };
}
`,
	);
}
