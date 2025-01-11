import { A, useLocation } from '@solidjs/router';
import { Cookie, Download, History, Map, UsersRound } from 'lucide-solid';
import { type JSXElement } from 'solid-js';
import { HKVizText } from '~/components/HKVizText';
import { MdxOuterWrapper } from '~/components/mdx-layout';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';

function SubMenuSectionTitle(props: { children: JSXElement }) {
	return <h3 class="font-serif text-xl font-bold">{props.children}</h3>;
}
function SubMenuList(props: { children: JSXElement }) {
	return <ul class="m-0 flex list-none flex-col gap-1 p-0 pb-2">{props.children}</ul>;
}

function SubMenuLink(props: { children: JSXElement; href: string }) {
	const location = useLocation();
	const isActive = () => location.pathname === props.href;
	return (
		<li>
			<Button variant={isActive() ? 'default' : 'ghost'} as={A} href={props.href}>
				{props.children}
			</Button>
		</li>
	);
}

export default function DocsLayout(props: { children: JSXElement }) {
	return (
		<MdxOuterWrapper>
			<div class="flex flex-col lg:flex-row">
				<div class="h-fit p-3 lg:sticky lg:top-[var(--main-nav-height)]">
					<Card class="h-fit p-3">
						<SubMenuSectionTitle>
							How to{"'"}s for <HKVizText />
						</SubMenuSectionTitle>
						<SubMenuList>
							<SubMenuLink href="/guide/install">
								<Download class="h-4 pr-2" />
								How to record gameplay analytics
							</SubMenuLink>
							<SubMenuLink href="/guide/analytics">
								<Map class="h-4 pr-2" />
								How to use the analytics page
							</SubMenuLink>
						</SubMenuList>
						<Separator />
						<h3 class="mt-4 font-serif text-xl font-bold">Other links</h3>
						<SubMenuList>
							<SubMenuLink href="/credits">
								<UsersRound class="h-4 pr-2" />
								Credits
							</SubMenuLink>
							<SubMenuLink href="/privacy-policy">
								<Cookie class="h-4 pr-2" />
								Privacy policy
							</SubMenuLink>
							<SubMenuLink href="/changelog">
								<History class="h-4 pr-2" />
								Changelog
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
