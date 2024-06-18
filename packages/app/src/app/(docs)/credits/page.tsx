import { type Metadata } from 'next';
import { MdxInnerWrapper } from '../../../../../app2/src/components/mdx-layout';
import Mdx from './_page.mdx';

export const metadata: Metadata = {
    title: 'Credits - HKViz',
    alternates: {
        canonical: '/credits',
    },
};

export default function Credits() {
    return (
        <MdxInnerWrapper>
            <Mdx />
        </MdxInnerWrapper>
    );
}
