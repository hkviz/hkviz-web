import { ContentCenterWrapper } from './content-wrapper';

export function AuthNeeded() {
    return (
        <ContentCenterWrapper>
            <p>
                This page requires authentication. Please <a href="/api/auth/signin">sign in</a> to continue.
            </p>
        </ContentCenterWrapper>
    );
}
