import { ContentCenterWrapper } from '~/components/content-wrapper';

export default function NotFound() {
    return (
        <ContentCenterWrapper>
            <h1 class="font-serif text-3xl font-semibold">404 - Page not found</h1>
        </ContentCenterWrapper>
    );
    // return <Navigate href="/" />;
}
