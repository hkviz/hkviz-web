import { CompletionChartDocIconWrapper } from '~/app/run/[id]/_dynamic_loader';

/**
 * this page should not exist, but next somehow doesnt bundle the _dynamic components correctly if these
 * are only imported from mdx files
 * @returns
 */

export default function A() {
    return <CompletionChartDocIconWrapper />;
}
