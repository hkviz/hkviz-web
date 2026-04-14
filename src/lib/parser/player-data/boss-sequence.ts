export class BossSequenceData {
	bindings: number;
	name: string;

	bindingsNone: boolean;

	bindingsNail: boolean;
	bindingsShell: boolean;
	bindingsCharms: boolean;
	bindingsSoul: boolean;

	constructor(bindings: number, name: string) {
		this.bindings = bindings;
		this.name = name;

		this.bindingsNone = this.bindings === 0;
		this.bindingsNail = (this.bindings & 1) !== 0;
		this.bindingsShell = (this.bindings & 2) !== 0;
		this.bindingsCharms = (this.bindings & 4) !== 0;
		this.bindingsSoul = (this.bindings & 8) !== 0;
	}
}
