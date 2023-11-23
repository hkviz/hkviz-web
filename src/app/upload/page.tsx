import { getServerAuthSession } from '~/server/auth';
import { AuthNeeded } from '../_components/auth-needed';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { UploadForm } from '../_components/upload-form';

export default async function Upload() {
    const session = await getServerAuthSession();

    if (!session) {
        return <AuthNeeded />;
    }

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-4">
                {/* <h1 className="text-4xl font-extrabold tracking-tight">Upload a HollowKnight run</h1> */}
                <UploadForm />
            </div>
        </ContentCenterWrapper>
    );
}
