import { isStagingBundleID } from './bundleId';

export function openStringifiedErrorAlertStaging (err: Error): void {
    if (!err || typeof err !== 'object' || !isStagingBundleID()) {
        return;
    }
    // https://stackoverflow.com/a/26199752/8412141
    JSON.stringify(err, Object.getOwnPropertyNames(err));
}
