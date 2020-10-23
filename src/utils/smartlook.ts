import Smartlook from 'smartlook-react-native-wrapper';
import { checkFirstLaunch } from './init';
import { isStagingBundleID, isReleaseBundleID } from './bundleId';

const RECORD = isStagingBundleID() || isReleaseBundleID();

function startRecord (): void {
    if (RECORD) {
        Smartlook.startRecording();
    }
}

export async function startSmartlookRecordRandomly (): Promise<void> {
    const shouldLaunchSmartlook = Math.random() <= 0.25;
    const isRecording = await Smartlook.isRecording();

    if (shouldLaunchSmartlook && !isRecording) {
        startRecord();
    }
}

export async function startSmartlookRecordOnFirstAppLaunch (): Promise<void> {
    const isFirstLaunch = await checkFirstLaunch();
    const isRecording = await Smartlook.isRecording();

    if (isFirstLaunch && !isRecording) {
        startRecord();
    }
}
