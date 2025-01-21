import { MdxInnerWrapper } from '~/app/_components/mdx-layout';
import Mdx from './_page.mdx';

export const metadata = {
    title: 'Analytics guide - HKViz',
    alternates: {
        canonical: '/guides/visualizations',
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
