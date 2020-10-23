import React from 'react';
import { setJSExceptionHandler } from 'react-native-exception-handler';

import CrashPopup from '../components/Popups/CrashPopup';
import PopupManager from '../components/PopupManager';
import RootLoader from '../components/RootLoader';

import { CRASH_POPUP_HEIGHT, CRASH_POPUP_WIDTH } from '../styles/components/Popups/CrashPopup.style';

export function handleJSExceptions (
    popupManagerRef: React.RefObject<PopupManager>,
    rootLoaderRef: React.RefObject<RootLoader>,
    handleInDebug?: boolean
): void {
    setJSExceptionHandler((error: Error, isFatal: boolean) => {
        exceptionhandler(error, isFatal, popupManagerRef, rootLoaderRef);
    }, handleInDebug);
}

function exceptionhandler (
    error: Error,
    isFatal: boolean,
    popupManagerRef: React.RefObject<PopupManager>,
    rootLoaderRef: React.RefObject<RootLoader>
): void {
    if (!isFatal || !popupManagerRef) {
        return;
    }
    rootLoaderRef?.current?.close();
    popupManagerRef?.current?.requestPopup({
        ContentComponent: CrashPopup,
        ContentComponentProps: { error },
        displayCloseButton: false,
        height: CRASH_POPUP_HEIGHT,
        position: 'center',
        preventOverlayDismissal: true,
        scrollView: false,
        width: CRASH_POPUP_WIDTH
    });
}
