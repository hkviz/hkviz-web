'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Archive, ArchiveRestore, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type PropsWithChildren } from 'react';
import { type RunMetadata } from '~/server/api/routers/run/runs-find';
import { api } from '~/trpc/react';
import Coin from '../../../public/ingame-sprites/hud/HUD_coin_v020004.png';
import HealthFrameSteelSoulBrokenImg from '../../../public/ingame-sprites/hud/break_hud.png';
import HealthFrameSteelSoulSmallImg from '../../../public/ingame-sprites/hud/mode_select_Steel_Soul_HUD.png';
import SmallSoulOrb from '../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb.png';
import SmallSoulOrbSteelSoul from '../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb_steel.png';
import OneHealth from '../../../public/ingame-sprites/hud/select_game_HUD_0001_health.png';
import OneHealthSteelSoul from '../../../public/ingame-sprites/hud/select_game_HUD_0001_health_steel.png';
import HealthFrameImg from '../../../public/ingame-sprites/hud/select_game_HUD_0002_health_frame.png';
import HealthFrameSteelSoulImg from '../../../public/ingame-sprites/hud/select_game_HUD_Steel_Soul.png';
import DreamNailAwokenImg from '../../../public/ingame-sprites/inventory/dream_nail_0000_4.png';
import DreamNailImg from '../../../public/ingame-sprites/inventory/dream_nail_0003_1.png';
import { getMapZoneHudBackground } from './area-background';
import { RelativeDate } from './date';
import { Expander } from './expander';
import { RunTags } from './run-tags';

function Duration({ seconds }: { seconds: number }) {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor((seconds / 60) % 60);

    const duration: string[] = [];
    if (hours > 0) duration.push(`${hours}h`);
    if (minutes > 0) duration.push(`${minutes}m`);

    if (duration.length === 0) return <span>0m</span>;

    return <>{duration.join(' ')}</>;
}

const interactiveBrightnessClasses =
    'group-focus-within:brightness-110 group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90';

function HealthFrame({ isSteelSoul, isBrokenSteelSoul }: { isSteelSoul: boolean; isBrokenSteelSoul: boolean }) {
    if (isBrokenSteelSoul) {
        return (
            <Image
                src={HealthFrameSteelSoulBrokenImg}
                alt="Broken Steel Soul game mode frame"
                className={cn(
                    'absolute left-[-2.5rem] top-[-2rem] z-[2] h-[10rem] w-auto max-w-none',
                    interactiveBrightnessClasses,
                )}
            />
        );
    }
    if (isSteelSoul) {
        return (
            <>
                <Image
                    src={HealthFrameSteelSoulImg}
                    alt="Steel Soul game mode frame"
                    className={cn(
                        'roup-focus-visible:brightness-110 absolute left-[-2.5rem] top-[-2rem] z-[2] hidden h-[10rem] w-auto max-w-none sm:block',
                        interactiveBrightnessClasses,
                    )}
                />
                <Image
                    src={HealthFrameSteelSoulSmallImg}
                    alt="Steel Soul game mode frame"
                    className={cn(
                        'absolute left-[-2.5rem] top-[-2rem] z-[2] h-[10rem] w-auto max-w-none sm:hidden',
                        interactiveBrightnessClasses,
                    )}
                />
            </>
        );
    }

    return (
        <Image
            src={HealthFrameImg}
            alt="Standard game mode frame"
            className="absolute left-1 top-0 z-[2] h-[6rem] w-auto max-w-none"
        />
    );
}

function RunCardEpicInfo({
    title,
    children,
    className,
    href,
}: PropsWithChildren<{ title: React.ReactNode; className?: string; href?: string }>) {
    const spans = (
        <span
            className={cn(
                'sm:max-md:flex-col sm:max-md:items-end sm:max-md:justify-end sm:max-md:gap-0 z-[4] flex items-baseline gap-1 drop-shadow-sm md:gap-1',
                className,
            )}
        >
            <span>{title}</span>
            <span className="text-lg font-bold">{children}</span>
        </span>
    );

    if (!href) return spans;

    return (
        <Link className="z-[7] hover:underline hover:drop-shadow-glow-md" href={href}>
            {spans}
        </Link>
    );
}

export function RunCardDropdownMenu({
    run,
    handleArchiveToggle,
    handleDelete,
}: {
    run: RunMetadata;
    handleArchiveToggle: () => void;
    handleDelete: () => void;
}) {
    // weirdly structured alert outside of dropdown bc of:
    // https://stackoverflow.com/questions/77185827/shadcn-dialog-inside-of-dropdown-closes-automatically
    return (
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-1 right-1 z-[7] flex h-6 items-center rounded-sm"
                    >
                        <MoreHorizontal className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="-top-2 w-56" side="top" align="end" alignOffset={-10}>
                    <DropdownMenuGroup>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        {run.archived && (
                            <DropdownMenuItem onClick={handleArchiveToggle}>
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                <span>Unarchive</span>
                            </DropdownMenuItem>
                        )}
                        {!run.archived && (
                            <DropdownMenuItem onClick={handleArchiveToggle}>
                                <Archive className="mr-2 h-4 w-4" />
                                <span>Archive</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {run.archived ? 'Delete this run completely?' : 'Delete or Archive this gameplay?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        <ul className="list-disc pl-5">
                            <li>
                                <b className="text-bold">Delete can not be undone</b>, your data will be deleted
                                completely. <br />
                                Playing again on this profile while using the mod, will create a new gamplay without the previous data.
                            </li>
                            {!run.archived && (
                                <li>
                                    <b className="text-bold">Archive</b> will hide this gameplay from your gameplays and
                                    other views, you can still view it inside your archive. <br />
                                    Playing again on this profile while using the mod, will record the data into your archive.
                                </li>
                            )}
                        </ul>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {!run.archived && (
                        <AlertDialogAction onClick={handleArchiveToggle}>
                            {run.archived ? 'Unarchive' : 'Archive'}
                        </AlertDialogAction>
                    )}
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function RunCard({
    run,
    showUser = true,
    isOwnRun = false,
}: {
    run: RunMetadata;
    showUser?: boolean;
    isOwnRun?: boolean;
}) {
    const { toast } = useToast();

    const deletionMutation = api.run.delete.useMutation({
        onSuccess: () => {
            toast({
                title: 'Successfully deleted gameplay',
            });
            setIsRemoved(true);
        },
        onError: (err) => {
            toast({
                title: 'Failed to delete gameplay',
                description: `${err.data?.code}: ${err?.message}`,
            });
        },
    });
    const archiveMutation = api.run.setArchived.useMutation({
        onSuccess: () => {
            toast({
                title: `Successfully ${run.archived ? 'unarchived' : 'archived'} gameplay`,
            });
            setIsRemoved(true);
        },
        onError: (err) => {
            toast({
                title: `Failed to ${run.archived ? 'unarchived' : 'archived'} gameplay`,
                description: `${err.data?.code}: ${err?.message}`,
            });
        },
    });

    function handleDelete() {
        deletionMutation.mutate({ runId: run.id });
    }

    function handleArchiveToggle() {
        archiveMutation.mutate({ runId: run.id, archived: !run.archived });
    }

    const [isRemoved, setIsRemoved] = useState(false);
    const isLoading = deletionMutation.isLoading || archiveMutation.isLoading;

    const lastFile = run.lastFile;
    const BgImage = getMapZoneHudBackground(lastFile?.mapZone);

    const isSteelSoul = run.isSteelSoul;
    const isBrokenSteelSoul = run.isBrokenSteelSoul;

    const soulOrbImgSrc = isSteelSoul ? SmallSoulOrbSteelSoul : SmallSoulOrb;
    const healthImgSrc = isSteelSoul ? OneHealthSteelSoul : OneHealth;

    return (
        <Expander expanded={!isRemoved}>
            <div
                key={run.id}
                className={cn(
                    'group relative mb-2 flex h-[unset] w-full flex-row items-start justify-between overflow-hidden rounded-sm bg-black px-4 py-2 text-white transition focus-within:drop-shadow-glow-md hover:bg-black hover:text-white hover:drop-shadow-glow-sm active:drop-shadow-none',
                    isRemoved ? 'scale-125 opacity-0' : '',
                    isLoading ? 'grayscale-0' : '',
                )}
            >
                {/* https://css-tricks.com/nested-links/ */}
                <Link href={`/run/${run.id}`} className="absolute inset-0 z-[6] block"></Link>
                <div className="relative z-[3] h-[7rem] w-[7rem] shrink-0">
                    <HealthFrame isSteelSoul={isSteelSoul} isBrokenSteelSoul={isBrokenSteelSoul} />
                    {(lastFile?.mpReserveMax ?? 100) >= 99 && (
                        <Image
                            src={soulOrbImgSrc}
                            alt="Soul orb"
                            className="absolute bottom-[2rem] left-[-0.75rem] z-[3]"
                        />
                    )}
                    {(lastFile?.mpReserveMax ?? 1000) >= 66 && (
                        <Image
                            src={soulOrbImgSrc}
                            alt="Soul orb"
                            className="absolute bottom-[0.75rem] left-[-0.25rem] z-[3]"
                        />
                    )}
                    {(lastFile?.mpReserveMax ?? 100) >= 33 && (
                        <Image src={soulOrbImgSrc} alt="Soul orb" className="absolute bottom-0 left-[1rem] z-[3]" />
                    )}
                </div>
                <div className="flex grow flex-col sm:flex-row">
                    <div className="shrink grow basis-[50%]">
                        <div className="relative z-[4] mt-4 flex flex-row flex-wrap gap-1 drop-shadow-sm sm:gap-2">
                            {[...Array(lastFile?.maxHealth ?? 5).keys()].map((i) => (
                                <Image src={healthImgSrc} alt="Health" key={i} className="-mb-1 w-5 sm:w-6" />
                            ))}
                        </div>
                        <div className="relative z-[4] mt-1 flex w-full flex-row gap-2 font-serif text-2xl drop-shadow-sm sm:mt-4">
                            <span>
                                <Image src={Coin} alt="Geo icon" className="inline-block w-7 p-1 drop-shadow-glow-md" />
                                <span className="font-semibold">{lastFile?.geo ?? '?'}</span>
                            </span>
                            {lastFile?.dreamOrbs ? (
                                <span>
                                    <Image
                                        src={lastFile?.dreamNailUpgraded ? DreamNailAwokenImg : DreamNailImg}
                                        alt="Essence icon"
                                        className="-mb-3 -mt-4 inline-block w-9 p-1 brightness-110 drop-shadow-glow-md"
                                    />
                                    <span className="font-semibold">{lastFile.dreamOrbs}</span>
                                </span>
                            ) : undefined}
                            {displayPercentage(lastFile) && (
                                <span className="ml-4">
                                    <span className="font-semibold">{lastFile.completionPercentage}</span>%
                                </span>
                            )}
                        </div>
                        {(isOwnRun || run.tags.length > 0) && (
                            <div className="mt-1 sm:mt-4">
                                <RunTags
                                    codes={run.tags}
                                    runId={run.id}
                                    isOwn={isOwnRun}
                                    addButtonClassName="hasHover:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                                    removeButtonClassName="hasHover:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-row flex-wrap justify-start gap-4 gap-y-0 font-serif sm:flex-col sm:justify-center sm:gap-2 sm:text-right">
                        {lastFile?.playTime && (
                            <RunCardEpicInfo title="Playtime:">
                                <Duration seconds={lastFile.playTime} />
                            </RunCardEpicInfo>
                        )}
                        {run.lastPlayedAt && (
                            <RunCardEpicInfo title="Last played:">
                                <RelativeDate date={run.lastPlayedAt} withTooltip={false} />
                            </RunCardEpicInfo>
                        )}
                        {run.user?.name && showUser && (
                            <RunCardEpicInfo title="By:" href={`/player/${run.user.id}`}>
                                {run.user.name}
                            </RunCardEpicInfo>
                        )}
                    </div>
                </div>

                {isOwnRun && (
                    <RunCardDropdownMenu
                        run={run}
                        handleDelete={handleDelete}
                        handleArchiveToggle={handleArchiveToggle}
                    />
                )}

                <Image
                    className="l-0 t-0 absolute z-[1] h-full w-full bg-black object-cover opacity-90 group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90"
                    src={BgImage}
                    alt="Area background image"
                />
                <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black via-transparent to-black"></div>
            </div>
        </Expander>
    );
}

function displayPercentage(
    file: RunMetadata['lastFile'],
): file is RunMetadata['lastFile'] & { completionPercentage: number } {
    if (!file) return false;

    return (
        (!!file.killedHollowKnight ||
            !!file.killedVoidIdol ||
            !!file.killedFinalBoss ||
            !!file.unlockedCompletionRate) &&
        !!file.completionPercentage
    );
}
