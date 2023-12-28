import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type AppRouterOutput } from '~/server/api/types';
import { RelativeDate } from './date';
import { getMapZoneHudBackground } from './area-background';
import Image from 'next/image';

import HealthFrame from '../../../public/ingame-sprites/hud/select_game_HUD_0002_health_frame.png';
import HealthFrameStealsoul from '../../../public/ingame-sprites/hud/select_game_HUD_Steel_Soul.png';
import OneHealth from '../../../public/ingame-sprites/hud/select_game_HUD_0001_health.png';
import Coin from '../../../public/ingame-sprites/hud/HUD_coin_v020004.png';
import Essence from '../../../public/ingame-sprites/inventory/dream_gate_inv_icon.png';
import SmallSoulOrb from '../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb.png';
import SmallSoulOrbStealSoul from '../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb_steel.png';
type Run = AppRouterOutput['run']['getUsersRuns'][number];

function Duration({ seconds }: { seconds: number }) {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor((seconds / 60) % 60);

    const duration: string[] = [];
    if (hours > 0) duration.push(`${hours}h`);
    if (minutes > 0) duration.push(`${minutes}m`);
    return <>{duration.join(' ')}</>;
}

export function RunCard({ run }: { run: Run }) {
    const lastFile = run.lastFile;
    const BgImage = getMapZoneHudBackground(lastFile?.mapZone);

    const isStealsoul = lastFile?.permadeathMode ?? true;

    const soulOrbImgSrc = isStealsoul ? SmallSoulOrbStealSoul : SmallSoulOrb;

    return (
        <Button
            variant="outline"
            asChild
            key={run.id}
            className="group relative flex h-[unset] w-full flex-col items-start justify-between overflow-hidden bg-black text-white hover:bg-black hover:text-white sm:flex-row"
        >
            <Link href={`/run/${run.id}`}>
                <div className="z-30 flex flex-row">
                    <div className="relative h-[7rem] w-[7rem] shrink-0">
                        {isStealsoul ? (
                            <Image
                                src={HealthFrameStealsoul}
                                alt="Steel Soul game mode frame"
                                className="absolute left-[-2.5rem] top-[-2rem] z-20 h-[10rem] w-auto max-w-none group-hover:brightness-75"
                            />
                        ) : (
                            <Image
                                src={HealthFrame}
                                alt="Standard game mode frame"
                                className="absolute left-1 top-0 z-20 h-[6rem] w-auto max-w-none"
                            />
                        )}
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
                    <div className="z-30 drop-shadow-sm">
                        <div className="relative mt-4 flex flex-row flex-wrap gap-1 sm:gap-2">
                            {[...Array(lastFile?.maxHealth ?? 5).keys()].map((i) => (
                                <Image src={OneHealth} alt="Health" key={i} className="-mb-1 w-5 sm:w-6" />
                            ))}
                        </div>
                        <div className="mt-1 flex w-full flex-row gap-2 font-serif text-2xl sm:mt-4">
                            <span>
                                <Image src={Coin} alt="Geo icon" className="inline-block w-7 p-1" />
                                <span className="font-semibold">{lastFile?.geo ?? '?'}</span>
                            </span>
                            {lastFile?.dreamOrbs ? (
                                <span>
                                    <Image src={Essence} alt="Essence icon" className="-mt-1 inline-block w-7 p-1" />
                                    <span className="font-semibold">{lastFile.dreamOrbs}</span>
                                </span>
                            ) : undefined}
                        </div>
                    </div>
                </div>
                <div className="z-30 flex flex-row flex-wrap justify-center gap-4 font-serif drop-shadow-sm sm:flex-col sm:justify-end sm:gap-2 sm:text-right">
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
                <Image
                    className="l-0 t-0 absolute z-10 h-full w-full bg-black object-cover opacity-90 group-hover:brightness-75"
                    src={BgImage}
                    alt="Area background image"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-black via-transparent to-black"></div>
            </Link>
        </Button>
    );
}
