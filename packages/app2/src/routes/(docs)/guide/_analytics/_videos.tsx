import { r2GetPublicContentUrl, r2VideoFileKey } from '~/lib/r2';
import { Video } from './_video_component';

export function getVideoUrl(name: string) {
    return r2GetPublicContentUrl(r2VideoFileKey(name));
}

export function RoomVisibilityAnimatedVideo() {
    return (
        <Video
            width={927}
            height={486}
            srcLight={getVideoUrl('rooms_visability_anim_light.mp4')}
            srcDark={getVideoUrl('rooms_visability_anim_dark.mp4')}
        />
    );
}

export function RoomVisibilityVisitedVideo() {
    return (
        <Video
            width={927}
            height={486}
            srcLight={getVideoUrl('rooms_visability_visited_light.mp4')}
            srcDark={getVideoUrl('rooms_visability_visited_dark.mp4')}
        />
    );
}

export function RoomVisibilityAllVideo() {
    return (
        <Video
            width={927}
            height={486}
            srcLight={getVideoUrl('rooms_visability_all_light.mp4')}
            srcDark={getVideoUrl('rooms_visability_all_dark.mp4')}
        />
    );
}
