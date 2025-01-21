import { MdxInnerWrapper } from '~/app/_components/mdx-layout';
import Mdx from './_page.mdx';

export const metadata = {
    title: 'Privacy policy - HKViz',
    alternates: {
        canonical: '/privacy-policy',
    },
};

export const runtime = 'edge';

export default function MDXPage() {
    return (
        <MdxInnerWrapper>
            <Mdx />
        </MdxInnerWrapper>
    );
}
