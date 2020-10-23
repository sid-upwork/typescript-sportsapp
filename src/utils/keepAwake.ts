import { NativeModules } from 'react-native';

const KeepAwake = NativeModules.KeepAwake;

export function setKeepAwake (active: boolean): void {
    if (active) {
        KeepAwake?.activate();
    } else {
        KeepAwake?.deactivate();
    }
}
