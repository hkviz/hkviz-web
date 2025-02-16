import { Title } from '@solidjs/meta';
import { A, createAsync, useAction, useSubmission } from '@solidjs/router';
import { Asterisk } from 'lucide-solid';
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import { AuthNeededWrapper } from '~/components/auth-needed';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Expander } from '~/components/ui/additions';
import { SelectIcon } from '~/components/ui/additions/select';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '~/components/ui/command';
import { Label } from '~/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { TextField, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field';
import { AgeRange, ageRangeCodes, ageRangeName } from '~/lib/types/age-range';
import { countries, CountryCode, countryName } from '~/lib/types/country';
import { CountryFlag } from '~/lib/types/country-flags';
import { StudyDemographicData, studyDemographicDefaultData } from '~/lib/types/study-demographic-data';
import { HKVizText } from '~/lib/viz';
import { demographicsGetUserState, demographicsSave } from '~/server/ingameauth/demographics';

function RequiredStar() {
	return (
		<span>
			<Asterisk class="-mt-[0.5em] inline-block h-[1.2rem] w-[1.2rem] pl-2 text-red-500" />
		</span>
	);
}

export default function StudyDemographicClientForm() {
	const userDemographicState = createAsync(() => demographicsGetUserState());
	const demographicsSaveAction = useAction(demographicsSave);
	const demographicsSaveSubmission = useSubmission(demographicsSave);

	const data = createMemo(() => {
		const _state = userDemographicState();
		const _data = _state?.type === 'exists' ? _state.data : studyDemographicDefaultData;

		const [genderWoman, setGenderWoman] = createSignal(_data.genderWoman);
		const [genderMan, setGenderMan] = createSignal(_data.genderMan);
		const [genderNonBinary, setGenderNonBinary] = createSignal(_data.genderNonBinary);
		const [genderPreferToSelfDescribe, setGenderPreferToSelfDescribe] = createSignal(
			_data.genderPreferToSelfDescribe,
		);
		const [genderPreferNotToDisclose, setGenderPreferNotToDisclose] = createSignal(_data.genderPreferNotToDisclose);
		const [genderCustom, setGenderCustom] = createSignal(_data.genderCustom);

		const [ageRange, setAgeRange] = createSignal<AgeRange | undefined>(_data.ageRange);
		const [country, setCountry] = createSignal<CountryCode | undefined>(
			_state?.type === 'not-exists' ? _state.inferredCountryCode : _data.country,
		);

		return {
			genderWoman,
			setGenderWoman,
			genderMan,
			setGenderMan,
			genderNonBinary,
			setGenderNonBinary,
			genderPreferToSelfDescribe,
			setGenderPreferToSelfDescribe,
			genderPreferNotToDisclose,
			setGenderPreferNotToDisclose,
			genderCustom,
			setGenderCustom,

			ageRange,
			setAgeRange,
			country,
			setCountry,
		};
	});

	const [countryOpen, setCountryOpen] = createSignal(false);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const notToDisclose = data().genderPreferNotToDisclose();
		const selfDescribe = !notToDisclose && data().genderPreferToSelfDescribe();

		const unwrapped: StudyDemographicData = {
			ageRange: data().ageRange()!,
			country: data().country()!,

			genderCustom: selfDescribe ? data().genderCustom() : '',
			genderWoman: !notToDisclose && data().genderWoman(),
			genderMan: !notToDisclose && data().genderMan(),
			genderNonBinary: !notToDisclose && data().genderNonBinary(),
			genderPreferNotToDisclose: notToDisclose,
			genderPreferToSelfDescribe: selfDescribe,
		};

		demographicsSaveAction(unwrapped);
	}

	createEffect(() => {
		console.log('demographicsSaveSubmission.result', demographicsSaveSubmission.result);
	});

	return (
		<>
			<Title>Demographics - HKViz</Title>
			<AuthNeededWrapper>
				<ContentCenterWrapper>
					<Show
						when={!demographicsSaveSubmission.result}
						fallback={
							<Card>
								<CardHeader>
									<CardTitle>
										Successfully saved your demographic data. Thank you for participating!
									</CardTitle>
								</CardHeader>
								<CardFooter class="flex justify-end">
									<Button variant="outline" as={A} href="/settings">
										Back to Settings
									</Button>
								</CardFooter>
							</Card>
						}
					>
						<Card class="w-full max-w-[70ch]">
							<form onSubmit={submit}>
								{/* onSubmit={form.handleSubmit(onSubmit)}> */}
								<fieldset
								// disabled={saveMutation.isLoading || (saveMutation.isSuccess && !!props.navigationFlow)}
								>
									<CardHeader>
										<CardTitle>Some questions about you</CardTitle>
										<CardDescription>
											<HKVizText /> is developed as a research project. Your answers are
											confidential and help us understand the diversity of our study. Thank you
											for participating!
										</CardDescription>
									</CardHeader>
									<CardContent class="space-y-4">
										<div class="flex flex-col gap-2">
											<Label class="mb-2">
												What is your gender?
												<RequiredStar />
											</Label>
											<div class="flex items-center gap-2">
												<Checkbox
													id="gender-woman"
													checked={
														!data().genderPreferNotToDisclose() && data().genderWoman()
													}
													onChange={data().setGenderWoman}
													disabled={data().genderPreferNotToDisclose()}
												/>
												<Label for="gender-woman-input">woman</Label>
											</div>
											<div class="flex items-center gap-2">
												<Checkbox
													id="gender-man"
													checked={!data().genderPreferNotToDisclose() && data().genderMan()}
													onChange={data().setGenderMan}
													disabled={data().genderPreferNotToDisclose()}
												/>
												<Label for="gender-man-input">man</Label>
											</div>
											<div class="flex items-center gap-2">
												<Checkbox
													id="gender-non-binary"
													checked={
														!data().genderPreferNotToDisclose() && data().genderNonBinary()
													}
													onChange={data().setGenderNonBinary}
													disabled={data().genderPreferNotToDisclose()}
												/>
												<Label for="gender-non-binary-input">non-binary</Label>
											</div>
											<div class="flex items-center gap-2">
												<Checkbox
													id="gender-prefer-not-to-disclose"
													checked={data().genderPreferNotToDisclose()}
													onChange={data().setGenderPreferNotToDisclose}
												/>
												<Label for="gender-prefer-not-to-disclose-input">
													prefer not to disclose
												</Label>
											</div>
											<div class="flex items-center gap-2">
												<Checkbox
													id="gender-prefer-to-self-describe"
													checked={
														!data().genderPreferNotToDisclose() &&
														data().genderPreferToSelfDescribe()
													}
													onChange={data().setGenderPreferToSelfDescribe}
													disabled={data().genderPreferNotToDisclose()}
												/>
												<Label for="gender-prefer-to-self-describe-input">
													prefer to self-describe
												</Label>
											</div>

											<Expander
												expanded={
													!data().genderPreferNotToDisclose() &&
													data().genderPreferToSelfDescribe()
												}
												class="w-full overflow-visible"
											>
												<TextField class="grid w-full items-center gap-1.5">
													<TextFieldLabel for="gender-custom">My gender is</TextFieldLabel>
													<TextFieldInput
														type="text"
														id="gender-custom"
														placeholder="Enter a gender"
														value={data().genderCustom()}
														onChange={(e) => data().setGenderCustom(e.currentTarget.value)}
													/>
												</TextField>
											</Expander>

											<Label for="age-range">
												Whats your age range?
												<RequiredStar />
											</Label>
											<Select
												id="age-range"
												value={data().ageRange()}
												onChange={(v) => {
													data().setAgeRange(v ?? undefined);
												}}
												options={ageRangeCodes as unknown as AgeRange[]}
												placeholder="Age range"
												itemComponent={(props) => (
													<SelectItem item={props.item}>
														{ageRangeName(props.item.rawValue)}
													</SelectItem>
												)}
											>
												<SelectTrigger aria-label="Trace visibility">
													<SelectValue<AgeRange>>
														{(state) => ageRangeName(state.selectedOption())}
													</SelectValue>
												</SelectTrigger>
												<SelectContent />
											</Select>

											<Label for="age-range">
												Country of residence
												<RequiredStar />
											</Label>
											<Popover open={countryOpen()} onOpenChange={setCountryOpen}>
												<PopoverTrigger
													as={Button}
													variant="outline"
													class="flex justify-between bg-transparent hover:bg-transparent"
												>
													<Show when={data().country()} fallback="Select a country">
														{(country) => (
															<div class="flex items-center">
																<CountryFlag code={country()} />
																{countryName(country())}
															</div>
														)}
													</Show>

													<SelectIcon />
												</PopoverTrigger>
												<PopoverContent class="p-0">
													<Command>
														<CommandInput placeholder="Search for a country..." />
														<CommandList>
															<CommandEmpty>No results found.</CommandEmpty>
															<CommandGroup>
																<For each={countries}>
																	{(country, i) => (
																		<>
																			<CommandItem
																				onSelect={() => {
																					data().setCountry(country.code);
																					setCountryOpen(false);
																				}}
																			>
																				<CountryFlag code={country.code} />
																				{country.name}
																			</CommandItem>
																			<Show when={i() === 0}>
																				<CommandSeparator class="my-1" />
																			</Show>
																		</>
																	)}
																</For>
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</div>
									</CardContent>
									<CardFooter class="flex justify-end">
										<Button type="submit" disabled={demographicsSaveSubmission.pending}>
											Continue
										</Button>
									</CardFooter>
								</fieldset>
							</form>
						</Card>
					</Show>
				</ContentCenterWrapper>
			</AuthNeededWrapper>
		</>
	);
}
