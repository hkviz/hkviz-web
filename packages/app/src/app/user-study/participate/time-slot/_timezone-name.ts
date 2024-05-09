export function formatTimeZoneName(name: string) {
    return name.replaceAll('/', ' - ').replaceAll('_', ' ');
}

export function getGmtOffset(timeZone: string) {
    const date = new Date(); // You can use any specific date here
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'shortOffset',
    });

    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find((part) => part.type === 'timeZoneName');

    return timeZonePart ? `${timeZonePart.value}` : '?';
}
