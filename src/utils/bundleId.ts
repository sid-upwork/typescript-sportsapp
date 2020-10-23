import DeviceInfo from 'react-native-device-info';

// We keep this type here instead of inside a separate file just to prevent any mistake with those IDs
export type TBundleId = 'com.nuli.app.wip' | 'com.nuli.app.staging' | 'com.nuli.app';

export enum BundleIdsEnum {
    debug = 'com.nuli.app.wip',
    staging = 'com.nuli.app.staging',
    release = 'com.nuli.app'
}

export function isDebugBundleID (): boolean {
    return DeviceInfo.getBundleId() === BundleIdsEnum.debug;
}

export function isStagingBundleID (): boolean {
    return DeviceInfo.getBundleId() === BundleIdsEnum.staging;
}

export function isReleaseBundleID (): boolean {
    const bundleId = DeviceInfo.getBundleId();
    // Always default to prod
    return bundleId !== BundleIdsEnum.debug && bundleId !== BundleIdsEnum.staging;
}
