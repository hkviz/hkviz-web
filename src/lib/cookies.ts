export function createCookie(name: string, value: string, days: number) {
    let expires: string;
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    } else {
        expires = '';
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

export function readCookie(name: string) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
        while (c.startsWith(' ')) {
            c = c.substring(1, c.length);
        }
        if (c.startsWith(nameEQ)) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

export function eraseCookie(name: string) {
    createCookie(name, '', -1);
}
