import { createContext, createMemo, createSignal, onMount, Signal, useContext } from 'solid-js';
import { loadLangSilk, LocalizationDataSilk } from '~/lib/game-data/silk-data/localization/load-lang-silk.generated';
import {
	SupportedLanguageSilk,
	supportedLanguagesSilk,
} from '~/lib/game-data/silk-data/localization/supported-languages-silk';
import { assertNever } from '~/lib/util';

export const supportedLanguages = supportedLanguagesSilk;
export type Language = SupportedLanguageSilk;

export type LocalizationSource = 'silk';
export const localizationSources: LocalizationSource[] = ['silk'];

export type SheetOfSource<Source extends LocalizationSource> = Source extends 'silk' ? LocalizationDataSilk : never;
export type SheetOfAnySource = SheetOfSource<LocalizationSource>;

export type LocalizedString =
	| {
			source: 'silk';
			key: keyof LocalizationDataSilk;
	  }
	| {
			raw: string;
	  };

// TODO would make sense to use Suspense here.
export function createLocalizationStore() {
	const [usedLanguagesHistory, setUsedLanguagesHistory] = createSignal<Language[]>(['EN']);
	const currentLanguage = createMemo(() => usedLanguagesHistory()[0]);

	const loadedSheets = {
		// oxlint-disable-next-line solid/reactivity
		silk: Object.fromEntries(
			// oxlint-disable-next-line solid/reactivity
			supportedLanguages.map((lang) => [lang, createSignal<LocalizationDataSilk | 'loading' | null>(null)]),
		) as Record<Language, Signal<LocalizationDataSilk | 'loading' | null>>,
	};

	async function ensureLoaded(source: LocalizationSource) {
		const currentLang = currentLanguage();
		if (source === 'silk') {
			const [loadedSheet, setLoadedSheet] = loadedSheets.silk[currentLang];
			if (loadedSheet() == null) {
				setLoadedSheet(await loadLangSilk(currentLang));
			}
		}
	}

	const displaySheet = Object.fromEntries(
		localizationSources.map((source) => {
			// oxlint-disable-next-line solid/reactivity
			return [
				source,
				// oxlint-disable-next-line solid/reactivity
				createMemo(() => {
					const langHistory = usedLanguagesHistory();
					for (const lang of langHistory) {
						const [loadedSheet] = loadedSheets[source][lang];
						const sheet = loadedSheet();
						if (sheet && sheet !== 'loading') {
							return sheet as SheetOfAnySource;
						}
					}
					return null;
				}),
			] as const;
		}),
	) as Record<LocalizationSource, () => SheetOfAnySource | null>;

	function getStringSilk(key: keyof LocalizationDataSilk) {
		void ensureLoaded('silk');
		const text = displaySheet.silk()?.[key];
		if (!text) {
			return key.split('.')[1]; // fallback to convoName
		}
		return (
			text
				// replace new lines (for now no way to retrieve via service)
				.replace(/<br>/g, '\n')
			// replace indicators for missing translations.
			// .replace(/#!#(.*?)#!#/g, (_, inner) => {
			// 	return inner;
			// })
		);
	}

	function getString(localizedString: LocalizedString) {
		if ('raw' in localizedString) {
			return localizedString.raw;
		} else {
			switch (localizedString.source) {
				case 'silk':
					return getStringSilk(localizedString.key);
				default:
					return assertNever(localizedString.source);
			}
		}
	}

	function changeLanguage(newLang: Language) {
		if (newLang === currentLanguage()) {
			return;
		}
		if (!supportedLanguages.includes(newLang)) {
			console.warn(`Attempted to change to unsupported language: ${newLang}`);
			return;
		}
		setUsedLanguagesHistory((prev) => [newLang, ...prev.filter((lang) => lang !== newLang)]);
		localStorage.setItem('language', newLang);
	}

	onMount(() => {
		(window as any).changeLanguage = changeLanguage;
		// TODO could also server render lang via cookie
		const localStorageLang = localStorage.getItem('language') as Language | null;
		if (localStorageLang && supportedLanguages.includes(localStorageLang)) {
			changeLanguage(localStorageLang);
		}
	});

	return {
		currentLanguage,
		getStringSilk,
		changeLanguage,
		getString,
	};
}
export type LocalizationStore = ReturnType<typeof createLocalizationStore>;
export const LocalizationStoreContext = createContext<LocalizationStore | null>(null);
export function useLocalizationStore() {
	const store = useContext(LocalizationStoreContext);
	if (!store) {
		throw new Error('useLocalizationStore must be used within a LocalizationStoreProvider');
	}
	return store;
}
