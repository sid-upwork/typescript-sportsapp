import * as Keychain from 'react-native-keychain';
import { resetPinCodeInternalStates, deleteUserPinCode } from '@haskkor/react-native-pincode';

// Default name from react-native-pincode
// https://github.com/jarden-digital/react-native-pincode#options
const PIN_CODE_KEYCHAIN_NAME = 'reactNativePinCode';

export async function setPinCodeInKeychain (pinCode: string): Promise<void> {
    await Keychain.setInternetCredentials(PIN_CODE_KEYCHAIN_NAME, PIN_CODE_KEYCHAIN_NAME, pinCode);
}

export async function resetPinCodeInKeychain (): Promise<void> {
    await deleteUserPinCode();
    await resetPinCodeInternalStates();
}
