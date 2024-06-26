import { type Component } from 'solid-js';
import type { SimpleIcon as SimpleIconType } from 'simple-icons';

interface SimpleIconProps {
    icon: SimpleIconType;
    class?: string;
    color?: 'brand' | 'current';
}

export const SimpleIcon: Component<SimpleIconProps> = (props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            height={24}
            width={24}
            fill={props.color == 'brand' ? props.icon.hex : 'currentColor'}
        >
            <path d={props.icon.path} />
        </svg>
    );
};
