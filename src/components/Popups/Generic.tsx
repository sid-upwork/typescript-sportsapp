import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import chroma from 'chroma-js';

import LinearGradient from 'react-native-linear-gradient';

import colors from '../../styles/base/colors.style';
import styles from '../../styles/components/Popups/Tooltip.style';

interface IProps {
    dismissPopup: () => void;
    message?: string;
}

interface IState {
    hide: boolean;
}

class Generic extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            hide: false
        };
    }

    private getScrollViewFade (position: 'top' | 'bottom'): JSX.Element {
        const isTop = position === 'top';

        const overlayColors: string[] = [
            chroma(colors.white).alpha(isTop ? 1 : 0).css(),
            chroma(colors.white).alpha(isTop ? 0 : 1).css()
        ];

        const gradientStyles = [
            styles.scrollViewGradientInner,
            {
                top: isTop ? 0 : null,
                bottom: !isTop ? 0 : null
            }
        ];

        return (
            <LinearGradient
                colors={overlayColors}
                locations={[0, 1]}
                pointerEvents={'none'}
                style={gradientStyles}
            />
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <View style={styles.scrollViewContainer}>
                    <ScrollView
                        contentContainerStyle={styles.scrollViewInner}
                        overScrollMode={'never'}
                        pinchGestureEnabled={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.message}>{ this.props.message }</Text>
                    </ScrollView>
                    { this.getScrollViewFade('top') }
                    { this.getScrollViewFade('bottom') }
                </View>
            </View>
        );
    }
}

export default Generic;
