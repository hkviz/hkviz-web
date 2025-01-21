import { MdxInnerWrapper } from '~/app/_components/mdx-layout';
import Mdx from './_page.mdx';

export const metadata = {
    title: 'Install guide - HKViz',
    alternates: {
        canonical: '/guides/install',
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
