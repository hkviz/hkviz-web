import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { assertNever } from '@hkviz/parser';
import { type NavigationFlow } from './type';

export function routerRedirectToFlow({
    router,
    flow,
    urlPostfix,
}: {
    router: AppRouterInstance;
    flow: NavigationFlow;
    urlPostfix?: string;
}) {
    switch (flow) {
        case 'ingame-auth':
            return router.push('/ingameauth/cookie' + (urlPostfix ?? ''));
        case 'user-study':
            return router.push('/user-study/flow' + (urlPostfix ?? ''));
        default:
            assertNever(flow);
    }
}
