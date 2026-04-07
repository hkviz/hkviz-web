import { BookOpenIcon, CookieIcon, HistoryIcon, MapIcon, UsersRoundIcon, VideoIcon } from 'lucide-solid';
import { type JSXElement } from 'solid-js';
import { MdxOuterWrapper } from '~/components/mdx-layout';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { AA, useLocation } from '~/lib/routing/AA';
import { UrlPath } from '~/lib/routing/url';

function SubMenuSectionTitle(props: { children: JSXElement }) {
	return <h3 class="font-serif text-xl font-bold">{props.children}</h3>;
}
function SubMenuList(props: { children: JSXElement }) {
	return <ul class="m-0 flex list-none flex-col gap-1 p-0 pb-2">{props.children}</ul>;
}

function SubMenuLink(props: { children: JSXElement; href: UrlPath }) {
	const location = useLocation();
	const isActive = () => location.pathname === props.href;
	return (
		<li>
			<Button variant={isActive() ? 'default' : 'ghost'} class="min-h-fit" as={AA} href={props.href}>
				{props.children}
			</Button>
		</li>
	);
}

export default function DocsLayout(props: { children: JSXElement }) {
	return (
		<MdxOuterWrapper>
			<div class="flex flex-col lg:flex-row">
				<div class="mr-2 h-fit shrink-0 p-3 lg:sticky lg:top-(--main-nav-height)">
					<Card class="h-fit p-3">
						<SubMenuSectionTitle>Guides</SubMenuSectionTitle>
						<SubMenuList>
							<SubMenuLink href="/guide/install">
								<VideoIcon class="h-4 pr-2" />
								Gameplay Recording Guide
							</SubMenuLink>
							<SubMenuLink href="/guide/analytics">
								<MapIcon class="h-4 pr-2" />
								Analytics Guide
							</SubMenuLink>
						</SubMenuList>
						<Separator />
						<h3 class="mt-4 font-serif text-xl font-bold">About</h3>
						<SubMenuList>
							<SubMenuLink href="/credits">
								<UsersRoundIcon class="h-4 pr-2" />
								Credits
							</SubMenuLink>
							<SubMenuLink href="/publications">
								<BookOpenIcon class="h-4 pr-2" />
								Publications
							</SubMenuLink>
							<SubMenuLink href="/changelog">
								<HistoryIcon class="h-4 pr-2" />
								Changelog
							</SubMenuLink>
							<SubMenuLink href="/privacy-policy">
								<CookieIcon class="h-4 pr-2" />
								Privacy Policy
							</SubMenuLink>
						</SubMenuList>
					</Card>
					{/*
                    <Card>
                        <TOCContainer />
                    </Card> */}
				</div>
				{props.children}
			</div>
		</MdxOuterWrapper>
	);
}
