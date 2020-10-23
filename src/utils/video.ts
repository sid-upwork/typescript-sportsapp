import { AWS_CDN_URL } from './staticLinks';
import { isAndroid } from './os';

export const CDN_VIDEOS_URL = `${AWS_CDN_URL}assets/videos/`;
export const CDN_VIDEOS_THUMBS_URL = CDN_VIDEOS_URL; // `${CDN_VIDEOS_URL}thumbs/`;

export function getLocalVideoFileName (name: string): string {
    // Videos are stored as resources on iOS and in the `android/app/src/main/res/raw/` folder on Android
    // See: https://github.com/react-native-community/react-native-video/issues/125#issuecomment-583100357
    return isAndroid ? name : `${name}.mp4`;
}
