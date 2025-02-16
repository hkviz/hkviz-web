import { Title } from '@solidjs/meta';
import { A, createAsync, useAction, useSubmission } from '@solidjs/router';
import { createMemo, createSignal, createUniqueId, JSXElement, Match, Switch, Show } from 'solid-js';
import { AuthNeededWrapper } from '~/components/auth-needed';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Expander } from '~/components/ui/additions';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import {
	hkExperienceCleaned,
	hkExperienceEmpty,
	hkExperienceFinished,
	type HkExperienceInput,
} from '~/lib/types/hk-experience';
import { playingFrequencyCodes, playingFrequencyName, type PlayingFrequencyCode } from '~/lib/types/playing-frequency';
import { playingSinceCodes, playingSinceName, type PlayingSinceCode } from '~/lib/types/playing-since';
import { cn } from '~/lib/utils';
import { HKVizText } from '~/lib/viz';
import { hkExperienceGet, hkExperienceSave } from '~/server/ingameauth/hk-experience';

function toBool(value: string | boolean) {
	return value === 'yes' || value === true;
}

function toBoolOrNull(value: string | boolean | null | undefined) {
	if (value === null || value === undefined) return null;
	return toBool(value);
}

function toBoolString(value: string | boolean | null | undefined) {
	if (value === null || value === undefined) return undefined;
	return toBool(value) ? 'yes' : 'no';
}

function FormFieldLabel(props: { for: string; children: JSXElement; class?: string }) {
	return (
		<Label class={cn('block w-full pb-2 pt-3', props.class)} for={props.for}>
			{props.children}
		</Label>
	);
}

export default function DataCollectionStudyParticipationPage() {
	const id = createUniqueId();
	const ids = {
		playingSince: id + 'playingSince',
		playingFrequency: id + 'playingFrequency',
		gotDreamnail: id + 'gotDreamnail',
		didEndboss: id + 'didEndboss',
		enteredWhitePalace: id + 'enteredWhitePalace',
		got112Percent: id + 'got112Percent',
		submitButton: id + 'submitButton',
	};
	function focusId(id: string) {
		setTimeout(() => {
			let element = document.getElementById(id);
			const button = element?.getElementsByTagName('button')[0];
			if (button) {
				element = button;
			}
			console.log('focus', id, element);
			element?.focus();
		}, 50);
	}

	const existingHkExperience = createAsync(() => hkExperienceGet());
	const saveAction = useAction(hkExperienceSave);
	const saveSubmission = useSubmission(hkExperienceSave);

	const values = createMemo(() => {
		const _data = existingHkExperience() ?? hkExperienceEmpty;

		const [playingSince, setPlayingSince] = createSignal(_data.playingSince);
		const [playingFrequency, setPlayingFrequency] = createSignal(_data.playingFrequency);
		const [gotDreamnail, setGotDreamnail] = createSignal(_data.gotDreamnail);
		const [didEndboss, setDidEndboss] = createSignal(_data.didEndboss);
		const [enteredWhitePalace, setEnteredWhitePalace] = createSignal(_data.enteredWhitePalace);
		const [got112Percent, setGot112Percent] = createSignal(_data.got112Percent);

		return {
			get playingSince() {
				return playingSince();
			},
			set playingSince(value: PlayingSinceCode | null) {
				setPlayingSince(value);
			},
			get playingFrequency() {
				return playingFrequency();
			},
			set playingFrequency(value: PlayingFrequencyCode | null) {
				setPlayingFrequency(value);
			},
			get gotDreamnail() {
				return gotDreamnail();
			},
			set gotDreamnail(value: boolean | null) {
				setGotDreamnail(value);
			},
			get didEndboss() {
				return didEndboss();
			},
			set didEndboss(value: boolean | null) {
				setDidEndboss(value);
			},
			get enteredWhitePalace() {
				return enteredWhitePalace();
			},
			set enteredWhitePalace(value: boolean | null) {
				setEnteredWhitePalace(value);
			},
			get got112Percent() {
				return got112Percent();
			},
			set got112Percent(value: boolean | null) {
				setGot112Percent(value);
			},
		};
	});

	const showFrequency = createMemo(() => !!values().playingSince && values().playingSince !== 'never');
	const showDreamnail = createMemo(() => showFrequency() && !!values().playingFrequency);
	const showEndboss = createMemo(() => showDreamnail() && values().gotDreamnail === true);
	const showWhitePalace = showEndboss; // showed simultaneously with endboss
	const show112 = createMemo(
		() => (showWhitePalace() && values().didEndboss && values().enteredWhitePalace) ?? false,
	);

	const existingFinished = createMemo(() => {
		const existing = existingHkExperience();
		return existing && hkExperienceFinished(existing);
	});
	const valuesFinished = createMemo(() => hkExperienceFinished(values()));

	// const router = useRouter();
	// const saveMutation = api.hkExperience.save.useMutation();

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		saveSubmission.clear();
		const parsedValues = hkExperienceCleaned(values());
		await saveAction(parsedValues);
	}

	function updateValue<TKey extends keyof HkExperienceInput>({
		key,
		nextKey,
		value,
	}: {
		key: TKey;
		nextKey: keyof HkExperienceInput | null;
		value: HkExperienceInput[TKey];
	}) {
		const v = values();
		// const hadValueAlready = v[key] != null;
		v[key] = value;
		// const nextHasValue = nextKey ? v[nextKey] != null : false;
		// if (!hadValueAlready || !nextHasValue) {
		if (!nextKey || hkExperienceFinished(v)) {
			focusId(ids.submitButton);
		} else {
			focusId(ids[nextKey]);
		}
		// }
	}

	return (
		<>
			<Title>Your previous Hollow Knight experience - HKViz</Title>
			<AuthNeededWrapper>
				<ContentCenterWrapper>
					<Switch>
						<Match when={existingFinished()}>
							<Card>
								<CardHeader>
									<CardTitle>You have previously submitted your experience.</CardTitle>
								</CardHeader>
								<CardContent>Thank you for participating!</CardContent>
								<CardFooter class="flex justify-end">
									<Button as={A} href="/settings" variant="outline">
										Back to settings
									</Button>
								</CardFooter>
							</Card>
						</Match>
						<Match when={saveSubmission.result}>
							<Card>
								<CardHeader>
									<CardTitle>Your Hollow Knight experience has been saved.</CardTitle>
								</CardHeader>
								<CardContent>Thanks for participating!</CardContent>
								<CardFooter class="flex justify-end">
									<Button as={A} href="/settings" variant="outline">
										Back to settings
									</Button>
								</CardFooter>
							</Card>
						</Match>
						<Match when={true}>
							<Card class="w-full max-w-[70ch]">
								<CardHeader>
									<CardTitle class="leading-snug">Your previous Hollow Knight experience</CardTitle>
									<CardDescription>
										This helps us better understand by whom and when the <HKVizText /> is used. Your
										answers are confidential and only used for research purposes.
									</CardDescription>
								</CardHeader>

								<form onSubmit={onSubmit}>
									<fieldset disabled={saveSubmission.pending}>
										<CardContent>
											<Show when={saveSubmission.error}>
												<div class="mb-4 text-red-700 dark:text-red-500">
													Error saving your experience: {saveSubmission.error.message}
												</div>
											</Show>

											<div>
												<FormFieldLabel for={ids.playingSince} class="pt-0">
													When did you first play Hollow Knight?
												</FormFieldLabel>
												<Select
													id={ids.playingSince}
													value={values().playingSince ?? undefined}
													onChange={(v) => {
														if (!v) return;
														updateValue({
															key: 'playingSince',
															value: v,
															nextKey: 'playingFrequency',
														});
													}}
													options={[...playingSinceCodes]}
													placeholder="Select an option"
													itemComponent={(props) => (
														<SelectItem item={props.item}>
															{playingSinceName(props.item.rawValue)}
														</SelectItem>
													)}
												>
													<SelectTrigger aria-label="Playing since" class="w-full">
														<SelectValue<PlayingSinceCode>>
															{(state) => playingSinceName(state.selectedOption())}
														</SelectValue>
													</SelectTrigger>
													<SelectContent />
												</Select>
											</div>
											<Expander class="overflow-visible" expanded={showFrequency()}>
												<FormFieldLabel for={ids.playingFrequency}>
													How often did you play Hollow Knight recently?
												</FormFieldLabel>
												<Select
													id={ids.playingFrequency}
													value={values().playingFrequency ?? undefined}
													onChange={(v) => {
														if (!v) return;
														updateValue({
															key: 'playingFrequency',
															value: v,
															nextKey: 'gotDreamnail',
														});
													}}
													options={[...playingFrequencyCodes]}
													placeholder="Select an option"
													itemComponent={(props) => (
														<SelectItem item={props.item}>
															{playingFrequencyName(props.item.rawValue)}
														</SelectItem>
													)}
												>
													<SelectTrigger aria-label="Playing frequency" class="w-full">
														<SelectValue<PlayingFrequencyCode>>
															{(state) => playingFrequencyName(state.selectedOption())}
														</SelectValue>
													</SelectTrigger>
													<SelectContent />
												</Select>
											</Expander>
										</CardContent>
										<Expander class="overflow-visible" expanded={showDreamnail()}>
											<CardHeader class="pt-0">
												<CardTitle>Game Progress</CardTitle>
												<CardDescription>
													How far have you progressed in Hollow Knight?
												</CardDescription>
											</CardHeader>

											<CardContent>
												<div>
													<FormFieldLabel for={ids.gotDreamnail} class="pt-0">
														Did you get the dreamnail and/or enter a dream?
													</FormFieldLabel>
													<ToggleGroup
														id={ids.gotDreamnail}
														variant="outline"
														class="mx-auto my-2 max-w-xs"
														value={toBoolString(values().gotDreamnail)}
														onChange={(value) =>
															updateValue({
																key: 'gotDreamnail',
																value: toBoolOrNull(value),
																nextKey: 'didEndboss',
															})
														}
													>
														<ToggleGroupItem
															value="yes"
															aria-label="Toggle yes"
															class="grow"
														>
															Yes
														</ToggleGroupItem>
														<ToggleGroupItem value="no" aria-label="Toggle no" class="grow">
															No
														</ToggleGroupItem>
													</ToggleGroup>
												</div>
												<Expander class="overflow-visible" expanded={showEndboss()}>
													<FormFieldLabel for={ids.didEndboss}>
														Did you defeat the endboss and see the credits?
													</FormFieldLabel>
													<ToggleGroup
														id={ids.didEndboss}
														variant="outline"
														class="mx-auto max-w-xs"
														value={toBoolString(values().didEndboss)}
														onChange={(value) =>
															updateValue({
																key: 'didEndboss',
																value: toBoolOrNull(value),
																nextKey: 'enteredWhitePalace',
															})
														}
													>
														<ToggleGroupItem
															value="yes"
															aria-label="Toggle yes"
															class="grow"
														>
															Yes
														</ToggleGroupItem>
														<ToggleGroupItem value="no" aria-label="Toggle no" class="grow">
															No
														</ToggleGroupItem>
													</ToggleGroup>
												</Expander>
												<Expander class="overflow-visible" expanded={showWhitePalace()}>
													<FormFieldLabel for={ids.enteredWhitePalace}>
														Did you enter white palace?
													</FormFieldLabel>
													<ToggleGroup
														id={ids.enteredWhitePalace}
														variant="outline"
														class="mx-auto max-w-xs"
														value={toBoolString(values().enteredWhitePalace)}
														onChange={(value) =>
															updateValue({
																key: 'enteredWhitePalace',
																value: toBoolOrNull(value),
																nextKey: 'got112Percent',
															})
														}
													>
														<ToggleGroupItem
															value="yes"
															aria-label="Toggle yes"
															class="grow"
														>
															Yes
														</ToggleGroupItem>
														<ToggleGroupItem value="no" aria-label="Toggle no" class="grow">
															No
														</ToggleGroupItem>
													</ToggleGroup>
												</Expander>
												<Expander class="overflow-visible" expanded={show112()}>
													<FormFieldLabel for={ids.got112Percent}>
														Did you reach 112% completion?
													</FormFieldLabel>
													<ToggleGroup
														id={ids.got112Percent}
														variant="outline"
														class="mx-auto my-2 max-w-xs"
														value={toBoolString(values().got112Percent)}
														onChange={(value) =>
															updateValue({
																key: 'got112Percent',
																value: toBoolOrNull(value),
																nextKey: null,
															})
														}
													>
														<ToggleGroupItem
															value="yes"
															aria-label="Toggle yes"
															class="grow"
														>
															Yes
														</ToggleGroupItem>
														<ToggleGroupItem value="no" aria-label="Toggle no" class="grow">
															No
														</ToggleGroupItem>
													</ToggleGroup>
												</Expander>
											</CardContent>
										</Expander>

										<Expander class="overflow-visible" expanded={valuesFinished()}>
											<CardFooter class="flex justify-end">
												<Button type="submit" id={ids.submitButton}>
													Continue
												</Button>
											</CardFooter>
										</Expander>
									</fieldset>
								</form>
							</Card>
						</Match>
					</Switch>
				</ContentCenterWrapper>
			</AuthNeededWrapper>
		</>
	);
}
