import { enemiesJournalGenerated } from '../generated/enemies-journal.generated';
import { enemiesGenerated } from '../generated/enemies.generated';

export const greyPrinceNames = [
    // https://hollowknight.wiki/w/Grey_Prince_Zote
    'Terrifying, Beautiful, Powerful, Grey Prince Zote',
    'Gorgeous, Passionate,',
    'Diligent, Overwhelming,',
    'Vigorous,',
    'Enchanting,',
    'Mysterious,',
    'Sensual,',
    'Fearless,',
    'Invincible,',
];

for (let i = 1; i < greyPrinceNames.length; i++) {
    greyPrinceNames[i] = greyPrinceNames[i] + ' ' + greyPrinceNames[i - 1];
}

for (let i = 0; i < greyPrinceNames.length; i++) {
    greyPrinceNames[i] = greyPrinceNames[i] + ` (Level ${i + 1})`;
}

type EnemyName = keyof typeof enemiesGenerated;

// fields in playerData {name}Defeated: boolean
// Some of the defeated fields need to be used to detect boss kills instead
// like for bosses without journal entries (dream bosses) and for enemies which together
// create a single 'boss' like the Watcher Knights.
// additionally the dreamers are detected like this.
export const playerDataNameToDefeatedName: Record<
    string,
    { enemy: EnemyName; overrideName?: string } | { dreamer: string; achievementSprite: string } | undefined
> = {
    // guardians would refer to the watcher knights but only becomes true once lurien is defeated, therefore undefined
    guardians: undefined, // { enemy: 'BlackKnight', overrideName: 'Watcher Knights' },
    lurien: { dreamer: 'Lurien', achievementSprite: 'Achievement_icon__0000_watcher' },
    hegemol: { dreamer: 'Herrah', achievementSprite: 'Achievement_icon__0002_beast' },
    monomon: { dreamer: 'Monomon', achievementSprite: 'Achievement_icon__0001_teacher' },
    zote: undefined, // covered below { enemy: 'Zote' },
    falseKnight: undefined,
    falseKnightDream: { enemy: 'FalseKnight', overrideName: 'Failed Champion' },
    mawlek: undefined,
    giantBuzzer: undefined,
    giantFly: undefined,
    blocker1: undefined,
    blocker2: undefined,
    hornet1: { enemy: 'Hornet', overrideName: 'Hornet Protector' },
    collector: undefined,
    hornetOutskirts: { enemy: 'Hornet', overrideName: 'Hornet Sentinel' },
    // dream bosses (some missing?)
    mageLordDream: { enemy: 'MageLord', overrideName: 'Soul Tyrant' },
    infectedKnightDream: { enemy: 'InfectedKnight', overrideName: 'Lost Kin' },
    whiteDefender: undefined, // { enemy: 'DungDefender', overrideName: 'White Defender' },
    greyPrince: undefined, // { enemy: 'Zote', overrideName: 'Grey Prince Zote' },
    // dream warriors
    aladarSlug: undefined,
    xero: undefined,
    elderHu: undefined,
    mumCaterpillar: undefined,
    noEyes: undefined,
    markoth: undefined,
    galien: undefined,
    megaMossCharger: undefined,
    mageLord: undefined,
    // other bosses
    flukeMother: undefined,
    duskKnight: undefined,
};

const journalInfoByPlayerDataName = Object.fromEntries(
    enemiesJournalGenerated.map((journalInfo) => [journalInfo.playerDataName, journalInfo]),
);

const enemyArray = Object.values(enemiesGenerated).map((enemy) => {
    const journalInfo = journalInfoByPlayerDataName[enemy.name];
    return {
        ...enemy,
        portraitName: journalInfo?.portraitName,
        convoName: journalInfo?.convoName,
        descConvo: journalInfo?.descConvo,
        nameConvo: journalInfo?.nameConvo,
        notesConvo: journalInfo?.notesConvo,
        playerDataBoolName: journalInfo?.playerDataBoolName,
        playerDataKillsName: journalInfo?.playerDataKillsName,
        playerDataName: journalInfo?.playerDataName,
        playerDataNewDataName: journalInfo?.playerDataNewDataName,
    };
});

export type EnemyInfo = (typeof enemyArray)[number];

export const enemies = {
    byPlayerDataName: Object.fromEntries(enemyArray.map((enemy) => [enemy.name, enemy])),
};

// By default all enemies which need to be killed only once
// are seen as bosses, there are some exceptions
// of enemies which have only 1 kill, but are no bosses and the other way around
// these exceptions are defined here
const isBossOverrides: Partial<Record<EnemyName, boolean>> = {
    BigFly: true, // Gruz Mother
    MageKnight: true, // Soul Warrior
    ZapBug: false, // Lumafly
    Worm: false, // Goam
    BigCentipede: false, // Garpede
    AbyssTendril: false, // Void Tendrils
    LazyFlyer: false, // Aluba
    BindingSeal: false,

    ZotelingBuzzer: false, // Winged Zoteling
    GreyPrince: false,
    Zote: false,
    ZotelingHopper: false,
    ZotelingBalloon: false,
};

export function isEnemyBoss(enemy: EnemyInfo): boolean {
    const override = isBossOverrides[enemy.name];
    if (override !== undefined) {
        return override;
    }

    return enemy.neededForJournal === 1;
}
