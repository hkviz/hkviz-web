import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cookie, Download, Map, UsersRound } from 'lucide-react';
import { HKVizText } from '../_components/hkviz-text';
import { SubMenuLink } from '../_components/main-nav-item';
import { MdxOuterWrapper } from '../_components/mdx-layout';
import { TOCProvider } from './_content_sidebar';

function SubMenuSectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="font-serif text-xl font-bold">{children}</h3>;
}
function SubMenuList({ children }: { children: React.ReactNode }) {
    return <ul className="m-0 flex list-none flex-col gap-1 p-0 pb-2">{children}</ul>;
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
    return (
        <MdxOuterWrapper>
            <TOCProvider>
                <div className="flex flex-col lg:flex-row">
                    <div className="h-fit p-3 lg:sticky lg:top-[var(--main-nav-height)]">
                        <Card className="h-fit p-3">
                            <SubMenuSectionTitle>
                                How to{"'"}s for <HKVizText />
                            </SubMenuSectionTitle>
                            <SubMenuList>
                                <SubMenuLink href="/guide/install">
                                    <Download className="h-4 pr-2" />
                                    How to record gameplay analytics
                                </SubMenuLink>
                                <SubMenuLink href="/guide/analytics">
                                    <Map className="h-4 pr-2" />
                                    How to use the analytics page
                                </SubMenuLink>
                            </SubMenuList>
                            <Separator />
                            <h3 className="mt-4 font-serif text-xl font-bold">Other links</h3>
                            <SubMenuList>
                                <SubMenuLink href="/credits">
                                    <UsersRound className="h-4 pr-2" />
                                    Credits
                                </SubMenuLink>
                                <SubMenuLink href="/privacy-policy">
                                    <Cookie className="h-4 pr-2" />
                                    Privacy policy
                                </SubMenuLink>
                            </SubMenuList>
                        </Card>
                        {/* 
                        <Card>
                            <TOCContainer />
                        </Card> */}
                    </div>
                    {children}
                </div>
            </TOCProvider>
        </MdxOuterWrapper>
    );
}
