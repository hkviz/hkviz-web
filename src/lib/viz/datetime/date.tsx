import { format, formatDistance } from 'date-fns';
import { Show, type Component } from 'solid-js';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

interface AbsoluteDateProps {
	date: Date;
}

const AbsoluteDate: Component<AbsoluteDateProps> = (props) => {
	return <>{format(props.date, 'yyyy-M-d')}</>;
};

interface RelativeDateProps {
	date: Date;
	withTooltip?: boolean;
}
export function RelativeDate(props: RelativeDateProps) {
	const withTooltip = () => props.withTooltip ?? true;

	const relativeDate = () => {
		const formatted: string = formatDistance(props.date, new Date(), { addSuffix: true })
			.replace(/about /, '')
			.replace('less than ', '');
		if (formatted == 'less than a minute ago') return 'just now';
		return formatted.replace(/ minutes?/, 'm').replace(/ hours?/, 'h');
	};

	return (
		<Show when={withTooltip()} fallback={<>{relativeDate()}</>}>
			<Tooltip>
				<TooltipTrigger>
					<span>{relativeDate()}</span>
				</TooltipTrigger>
				<TooltipContent>
					<AbsoluteDate date={props.date} />
				</TooltipContent>
			</Tooltip>
		</Show>
	);
}
