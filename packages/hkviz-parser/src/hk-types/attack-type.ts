export type AttackType = 'Nail' | 'Generic' | 'Spell' | 'Acid' | 'Splatter' | 'RuinsWater' | 'SharpShadow' | 'NailBeam';
export type SpecialAttackType = 'Acid' | 'None';

export function getAttackTypeByShortCode(shortCode: string): AttackType {
    switch (shortCode) {
        case 'n':
            return 'Nail';
        case 'g':
            return 'Generic';
        case 's':
            return 'Spell';
        case 'a':
            return 'Acid';
        case 'p':
            return 'Splatter';
        case 'r':
            return 'RuinsWater';
        case 'h':
            return 'SharpShadow';
        case 'b':
            return 'NailBeam';
        default:
            throw new Error(`Unknown attack type short code: ${shortCode}`);
    }
}

export function getSpecialAttackTypeByShortCode(shortCode: string | undefined | null): SpecialAttackType {
    switch (shortCode) {
        case 'a':
            return 'Acid';
        case '':
        case undefined:
        case null:
            return 'None';
        default:
            throw new Error(`Unknown special attack type short code: ${shortCode}`);
    }
}
