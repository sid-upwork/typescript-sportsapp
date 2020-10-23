// Code adapted from:
// https://github.com/souvik-ghosh/react-native-default-menu/

import React, { Component } from 'react';
import {
    View,
    UIManager,
    findNodeHandle,
    TouchableWithoutFeedback,
    ActionSheetIOS,
    Platform,
    ViewProps
} from 'react-native';
import i18n from '../utils/i18n';

interface IProps extends ViewProps {
    cancelButtonIndex?: number;
    destructiveButtonIndex?: number;
    options: string[];
    onError?: () => void;
    onPress: (eventName: 'string', index: number) => void;
}

interface IState {
}

class NativeSelectionMenu extends Component<IProps, IState> {

    private refNode: any;

    private showActionSheet = () => {
        const { options, destructiveButtonIndex, onPress } = this.props;
        const actions = [i18n.t('global.cancel'), ...options];
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: actions,
                cancelButtonIndex: 0,
                destructiveButtonIndex: destructiveButtonIndex + 1 || -1
            },
            buttonIndex => {
                onPress(
                    actions[buttonIndex],
                    buttonIndex > 0 ? buttonIndex - 1 : undefined
                );
            }
        );
    }

    private showPopupMenu = () => {
        const { options, onError, onPress } = this.props;
        const node = findNodeHandle(this.refNode);
        UIManager.showPopupMenu(node, options, onError, onPress);
    }

    private onPress = () => {
        if (Platform.OS === 'ios') {
            this.showActionSheet();
            return;
        }
        this.showPopupMenu();
    }

    public render (): JSX.Element {
        const { style, children } = this.props;
        return (
            <TouchableWithoutFeedback onPress={this.onPress}>
            <View
                ref={node => { this.refNode = node; }}
                style={style}
            >
                {children}
            </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default NativeSelectionMenu;
