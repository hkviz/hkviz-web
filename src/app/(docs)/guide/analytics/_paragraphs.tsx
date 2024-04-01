import { Pin } from 'lucide-react';
import { LinkableParagraph } from './_linkable_paragraph';

export function PinParagraph() {
    return (
        <LinkableParagraph id="room-pin">
            To stop the shown room from changing by hovering over them, you can pin it with the{' '}
            <Pin className="inline-block h-4 w-4" aria-label="Pin" />
            -button in the room analytics panel or by clicking a room on the map.
        </LinkableParagraph>
    );
}
