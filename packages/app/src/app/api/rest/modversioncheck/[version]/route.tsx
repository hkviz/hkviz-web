import { typeCheckNever } from '@hkviz/parser';
import { type ModVersion as HKVizModVersion } from '@hkviz/parser';

interface ModVersionCheckResponse {
    message: string;
    color: 'red' | 'blue' | 'cyan' | 'white' | 'green';
    show: boolean;
}

function getVersionCheckResult(version: string): ModVersionCheckResponse {
    const versionTyped = version as HKVizModVersion;
    const toUpdate = 'To update, close Hollow Knight and open a mod manager like Lumafly or Scarab.';

    // console.log(version);
    switch (versionTyped) {
        case '1.5.1.0':
        case '1.5.0.0':
            return {
                message: '',
                color: 'cyan',
                show: false,
            };
        case '1.3.0.0':
        case '1.4.0.0':
            return {
                message: `A newer version of HKViz has been released. ${toUpdate}`,
                color: 'cyan',
                show: true,
            };

        case '0.0.0.0':
        case '1.0.0.0':
        case '1.1.0.0':
        case '1.2.0.0':
            return {
                message: `You are using a old version of HKViz. ${toUpdate}`,
                color: 'red',
                show: true,
            };
        default: {
            typeCheckNever(versionTyped);
            return {
                message: `You are using a unknown version of HKViz. ${toUpdate}`,
                color: 'cyan',
                show: true,
            };
        }
    }
}

export function GET(_request: Request, { params }: { params: { version: string } }) {
    return Response.json(getVersionCheckResult(params.version));
}
