import { ExternalLinkMdx } from '~/components/external-link';
import { siSteam, siHumblebundle, siGogdotcom } from 'simple-icons';
import { SimpleIcon } from '~/components/simple-icon';

export function HollowKnightStores() {
	return (
		<ul>
			<li>
				<ExternalLinkMdx href="https://store.steampowered.com/app/367520/Hollow_Knight/" noIcon={true}>
					<SimpleIcon icon={siSteam} class="mr-2 h-5 w-5 opacity-70 group-hover:opacity-100" />
					Steam
				</ExternalLinkMdx>
			</li>
			<li>
				<ExternalLinkMdx href="https://www.gog.com/game/hollow_knight" noIcon={true}>
					<SimpleIcon icon={siGogdotcom} class="mr-2 h-5 w-5 opacity-70 group-hover:opacity-100" />
					GOG
				</ExternalLinkMdx>
			</li>
			<li>
				<ExternalLinkMdx href="https://www.humblebundle.com/store/hollow-knight" noIcon={true}>
					<SimpleIcon icon={siHumblebundle} class="mr-2 h-5 w-5 opacity-70 group-hover:opacity-100" />
					Humble Bundle
				</ExternalLinkMdx>
			</li>
		</ul>
	);
}
