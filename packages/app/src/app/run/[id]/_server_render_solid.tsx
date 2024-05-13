import { GameplayDashboard, renderToString, type GameplayDashboardProps } from '@hkviz/viz-ui';

export function renderDashboardToString(props: GameplayDashboardProps): string {
    return renderToString(GameplayDashboard, props);
}
