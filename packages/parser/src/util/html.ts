export function parseHtmlEntities(str: string): string {
    return str
        .replace(/&#([0-9]{1,3});/gi, function (_match, numStr) {
            const num = parseInt(numStr, 10); // read num as normal number
            return String.fromCharCode(num);
        })
        .replace(/&amp;/g, '&');
}
