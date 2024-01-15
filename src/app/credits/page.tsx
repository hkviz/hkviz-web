import { Metadata } from 'next';
import { MdxInnerWrapper, MdxOuterWrapper } from '../_components/mdx-layout';
import Mdx from './_page.mdx';

export const metadata: Metadata = {
    title: 'Credits - HKViz',
    alternates: {
        canonical: '/credits',
    },
};

export default function Credits() {
    return (
        <MdxOuterWrapper>
            <MdxInnerWrapper>
                <Mdx />
            </MdxInnerWrapper>
        </MdxOuterWrapper>
    );
}
