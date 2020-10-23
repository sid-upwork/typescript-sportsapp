import { Platform } from 'react-native';

// On iOS, the version returned will be a string with the 'x.y.z' format
const version = Platform.Version;
const majorVersion = typeof version === 'number' ? version : parseInt(version, 10);

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const isIOS13min = isIOS && majorVersion >= 13; // Excludes iPhone 5s, iPhone 6 and iPhone 6 Plus

export const isAndroid19min = isAndroid && majorVersion >= 19; // 4.4
export const isAndroid21min = isAndroid && majorVersion >= 21; // 5.0
export const isAndroid23min = isAndroid && majorVersion >= 23; // 6.0
export const isAndroid24min = isAndroid && majorVersion >= 24; // 7.0
export const isAndroid26min = isAndroid && majorVersion >= 26; // 8.0
export const isAndroid28min = isAndroid && majorVersion >= 28; // 9.0
export const isAndroid29min = isAndroid && majorVersion >= 29; // 10.0
