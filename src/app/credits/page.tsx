import { MdxInnerWrapper, MdxOuterWrapper } from '../_components/mdx-layout';
import Mdx from './_page.mdx';

export default function Credits() {
    return (
        <MdxOuterWrapper>
            <MdxInnerWrapper>
                <Mdx />
            </MdxInnerWrapper>
        </MdxOuterWrapper>
    );
}
