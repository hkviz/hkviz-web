import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type AppRouterOutput } from '~/server/api/types';
import { RelativeDate } from './date';
import { getMapZoneHudBackground } from './area-background';
import Image from 'next/image';

import HealthFrameImg from '../../../public/ingame-sprites/hud/select_game_HUD_0002_health_frame.png';
import HealthFrameSteelSoulImg from '../../../public/ingame-sprites/hud/select_game_HUD_Steel_Soul.png';
import HealthFrameSteelSoulSmallImg from '../../../public/ingame-sprites/hud/mode_select_Steel_Soul_HUD.png';
import HealthFrameSteelSoulBrokenImg from '../../../public/ingame-sprites/hud/break_hud.png';
import OneHealth from '../../../public/ingame-sprites/hud/select_game_HUD_0001_health.png';
import OneHealthSteelSoul from '../../../public/ingame-sprites/hud/select_game_HUD_0001_health_steel.png';
import Coin from '../../../public/ingame-sprites/hud/HUD_coin_v020004.png';
import DreamNailImg from '../../../public/ingame-sprites/inventory/dream_nail_0003_1.png';
import DreamNailAwokenImg from '../../../public/ingame-sprites/inventory/dream_nail_0000_4.png';
import SmallSoulOrb from '../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb.png';
import SmallSoulOrbSteelSoul from '../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb_steel.png';

type Run = AppRouterOutput['run']['getUsersRuns'][number];

function Duration({ seconds }: { seconds: number }) {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor((seconds / 60) % 60);

    const duration: string[] = [];
    if (hours > 0) duration.push(`${hours}h`);
    if (minutes > 0) duration.push(`${minutes}m`);
    return <>{duration.join(' ')}</>;
}

function HealthFrame({ isSteelSoul, isBrokenSteelSoul }: { isSteelSoul: boolean; isBrokenSteelSoul: boolean }) {
    if (isBrokenSteelSoul) {
        return (
            <Image
                src={HealthFrameSteelSoulBrokenImg}
                alt="Broken Steel Soul game mode frame"
                className="absolute left-[-2.5rem] top-[-2rem] z-20 h-[10rem] w-auto max-w-none group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90"
            />
        );
    }
    if (isSteelSoul) {
        return (
            <>
                <Image
                    src={HealthFrameSteelSoulImg}
                    alt="Steel Soul game mode frame"
                    className="absolute left-[-2.5rem] top-[-2rem] z-20 hidden h-[10rem] w-auto max-w-none group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90 sm:block"
                />
                <Image
                    src={HealthFrameSteelSoulSmallImg}
                    alt="Steel Soul game mode frame"
                    className="absolute left-[-2.5rem] top-[-2rem] z-20 h-[10rem] w-auto max-w-none group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90 sm:hidden"
                />
            </>
        );
    }

    return (
        <Image
            src={HealthFrameImg}
            alt="Standard game mode frame"
            className="absolute left-1 top-0 z-20 h-[6rem] w-auto max-w-none"
        />
    );
}

export function RunCard({ run }: { run: Run }) {
    const lastFile = run.lastNonBrokenFile;
    const BgImage = getMapZoneHudBackground(lastFile?.mapZone);

    const isSteelSoul = run.isSteelSoul;
    const isBrokenSteelSoul = run.isBrokenSteelSoul;

    const soulOrbImgSrc = isSteelSoul ? SmallSoulOrbSteelSoul : SmallSoulOrb;
    const healthImgSrc = isSteelSoul ? OneHealthSteelSoul : OneHealth;

    return (
        <Button
            variant="outline"
            asChild
            key={run.id}
            className="group relative flex h-[unset] w-full flex-row items-start justify-between overflow-hidden bg-black text-white transition hover:bg-black"
        >
            <Link href={`/run/${run.id}`}>
                <div className="relative z-30 h-[7rem] w-[7rem] shrink-0">
                    <HealthFrame isSteelSoul={isSteelSoul} isBrokenSteelSoul={isBrokenSteelSoul} />
                    {(lastFile?.mpReserveMax ?? 100) >= 99 && (
                        <Image
                            src={soulOrbImgSrc}
                            alt="Soul orb"
                            className="absolute bottom-[2rem] left-[-0.75rem] z-30"
                        />
                    )}
                    {(lastFile?.mpReserveMax ?? 1000) >= 66 && (
                        <Image
                            src={soulOrbImgSrc}
                            alt="Soul orb"
                            className="absolute bottom-[0.75rem] left-[-0.25rem] z-30"
                        />
                    )}
                    {(lastFile?.mpReserveMax ?? 100) >= 33 && (
                        <Image src={soulOrbImgSrc} alt="Soul orb" className="absolute bottom-0 left-[1rem] z-30" />
                    )}
                </div>
                <div className="flex grow flex-col sm:flex-row">
                    <div className="z-40 grow drop-shadow-sm">
                        <div className="relative mt-4 flex flex-row flex-wrap gap-1 sm:gap-2">
                            {[...Array(lastFile?.maxHealth ?? 5).keys()].map((i) => (
                                <Image src={healthImgSrc} alt="Health" key={i} className="-mb-1 w-5 sm:w-6" />
                            ))}
                        </div>
                        <div className="mt-1 flex w-full flex-row gap-2 font-serif text-2xl sm:mt-4">
                            <span>
                                <Image src={Coin} alt="Geo icon" className="inline-block w-7 p-1" />
                                <span className="font-semibold">{lastFile?.geo ?? '?'}</span>
                            </span>
                            {lastFile?.dreamOrbs ? (
                                <span>
                                    <Image
                                        src={lastFile?.dreamNailUpgraded ? DreamNailAwokenImg : DreamNailImg}
                                        alt="Essence icon"
                                        className="-mb-3 -mt-4 inline-block w-9 p-1 brightness-110"
                                    />
                                    <span className="font-semibold">{lastFile.dreamOrbs}</span>
                                </span>
                            ) : undefined}
                        </div>
                    </div>
                    <div className="z-40 flex flex-row flex-wrap justify-start gap-4 gap-y-0 font-serif drop-shadow-sm sm:flex-col sm:justify-end sm:gap-2 sm:text-right">
                        {lastFile?.playTime && (
                            <span className="flex items-baseline gap-1 sm:flex-col sm:items-end sm:justify-end sm:gap-0 ">
                                <span> Playtime: </span>
                                <span className="text-lg font-bold">
                                    <Duration seconds={lastFile.playTime} />
                                </span>
                            </span>
                        )}
                        {/* {run.startedAt && (
                            <span>
                                <span className="opacity-75"> Started: </span>
                                <span className="font-semibold">
                                    <RelativeDate date={run.startedAt} withTooltip={false} />
                                </span>
                            </span>
                        )} */}
                        {run.lastPlayedAt && (
                            <span className="flex items-baseline gap-1 sm:flex-col sm:items-end sm:justify-end sm:gap-0">
                                <span>Last played: </span>
                                <span className="text-lg  font-bold">
                                    <RelativeDate date={run.lastPlayedAt} withTooltip={false} />
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                <Image
                    className="l-0 t-0 absolute z-10 h-full w-full bg-black object-cover opacity-90 group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90"
                    src={BgImage}
                    alt="Area background image"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-black via-transparent to-black"></div>
            </Link>
        </Button>
    );
}
