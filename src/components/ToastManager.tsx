import React, { Component } from 'react';
import { View } from 'react-native';

import Toast, { IProps as IToastProps } from './Toast';

import styles from '../styles/components/ToastManager.style';

interface IProps {}

interface IState {
    toasts: IToastProps[];
}

class ToastManager extends Component<IProps, IState> {

    private toastsToClose: number;

    constructor (props: IProps) {
        super(props);
        this.state = {
            toasts: []
        };
        this.toastsToClose = 0;
    }

    public openToast (params: IToastProps): void {
        this.setState({ toasts: [...this.state.toasts, params] });
    }

    public closeToast = (): void => {
        this.toastsToClose++;
        // To make sure that all animations are played correctly, we don't empty the stack until all the toasts are ready to be unmounted
        if (this.state.toasts.length === this.toastsToClose) {
            this.setState({ toasts: [] }, () => this.toastsToClose = 0);
        }
    }

    public render (): JSX.Element {
        const toasts = this.state.toasts.map((toast: IToastProps, index: number) => {
            return (
                <Toast
                    close={this.closeToast}
                    duration={toast.duration}
                    key={`toast-${index}`}
                    message={toast.message}
                    type={toast.type}
                    onPress={toast.onPress}
                />
            );
        });

        return (
            <View style={styles.container} pointerEvents={'box-none'}>
                { toasts }
            </View>
        );
    }
}

export default ToastManager;
