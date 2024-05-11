import { type Component } from 'solid-js';
import { render } from 'solid-js/web';
import { RoomInfo } from './room-infos';
import { ViewOptions } from './view-options';

export const DashboardMapOptions: Component = () => {
    return (
        <>
            <ViewOptions />
            <RoomInfo />
        </>
    );
};

export function renderDashboardMapOptions(element: Element) {
    return render(() => <DashboardMapOptions />, element);
}
