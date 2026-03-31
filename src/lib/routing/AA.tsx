import { A, AnchorProps, Location, useLocation as useLocationNative } from '@solidjs/router';
import { createEffect, JSXElement } from 'solid-js';
import { urlPath, UrlPath } from './url';

export type InternalAnchorProps = Omit<AnchorProps, 'href'> & {
	href: UrlPath;
};

export const AA: (props: InternalAnchorProps) => JSXElement = import.meta.env.DEV
	? (props) => {
			createEffect(() => {
				// showing url errors in dev, to catch invalid urls from mdx files
				urlPath(props.href);
			});
			return <A {...props} />;
		}
	: A;

export const useLocation = useLocationNative as <S = unknown>() => Location<S> & { pathname: UrlPath };
