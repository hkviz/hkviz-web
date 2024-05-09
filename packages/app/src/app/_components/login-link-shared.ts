export function getLoginLink(callbackUrl: string) {
    return '/api/auth/signin?callbackUrl=' + callbackUrl;
}
