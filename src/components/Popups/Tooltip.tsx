import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { setTooltipStatus, ETooltipIds } from '../../store/modules/tutorials';
import i18n from '../../utils/i18n';
import chroma from 'chroma-js';

import LinearGradient from 'react-native-linear-gradient';

import Switch from '../Switch';

import colors from '../../styles/base/colors.style';
import styles from '../../styles/components/Popups/Tooltip.style';

interface IProps {
    dismissPopup: () => void;
    setTooltipStatus: (tooltipId: ETooltipIds, hide: boolean) => void;
    message?: string;
    tooltipId: ETooltipIds;
}

interface IState {
    hide: boolean;
}

class Tooltip extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            hide: false
        };
    }

    private onChangeSwitch = (value: boolean): void  => {
        // Using a close button to trigger `setTooltipStatus()` is not a valid option since users can close the popup
        // by tapping the overlay or using the hardware back button on android
        this.setState({ hide: value });
        this.props.setTooltipStatus(this.props.tooltipId, value);
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
                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>{i18n.t('tooltips.hideMessage')}</Text>
                    <Switch onChange={this.onChangeSwitch} value={this.state.hide} />
                </View>
            </View>
        );
    }
}

export default connect(null, { setTooltipStatus })(Tooltip);
