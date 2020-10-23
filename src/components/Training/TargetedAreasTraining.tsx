import React, { PureComponent, Fragment } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { withNavigation } from 'react-navigation';
import { ETooltipIds } from '../../store/modules/tutorials';
import { IScreenProps } from '../../index';
import { debounce } from 'lodash';
import I18n from '../../utils/i18n';
import chroma from 'chroma-js';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';
import PopupManager from '../PopupManager';
import TargetedTraining from '../Popups/TargetedTraining';
import TargetedTrainingItem, { getAllTargetedTrainingItems } from './TargetedTrainingItem';
import Tooltip from '../Tooltip';
import TouchableScale from '../TouchableScale';

import colors from '../../styles/base/colors.style';
import { viewportHeight } from '../../styles/base/metrics.style';
import targetTrainingStyles from '../../styles/components/Popups/TargetedTraining.style';
import styles, { ITEM_WIDTH, ITEM_MARGIN_RIGHT } from '../../styles/components/Training/TargetedAreasTraining.style';

import Blob from '../../static/Training/targeted-background.svg';
import ItemBackgroundShape from '../../static/Training/targeted-areas-background_shape.svg';

interface IProps {
    containerStyle?: any;
    navigation: any;
    onOpen?: () => void;
    onClose?: () => void;
    popupManagerRef: React.RefObject<PopupManager>;
    screenProps: IScreenProps;
}

interface IState {}

class TargetedAreasTraining extends PureComponent<IProps, IState> {

    private onPress = (targetedTrainingItem: TargetedTrainingItem) => {
        const BackgroundComponent = (
            <FadeInImage
                source={targetedTrainingItem.image}
                containerCustomStyle={targetTrainingStyles.backgroundContainer}
                tintColor={chroma(colors.orangeVeryLight).alpha(0.18).css()}
            />
        );

        this.props.popupManagerRef.current.requestPopup({
            backgroundType: 'gradient',
            BackgroundComponent,
            ContentComponent: TargetedTraining,
            ContentComponentProps: {
                navigation: this.props.navigation,
                targetedTraining: targetedTrainingItem,
                screenProps: this.props.screenProps
            },
            height: Math.round(viewportHeight * 0.6),
            scrollView: false,
            onOpen: this.props.onOpen || undefined,
            onClose: this.props.onClose || undefined
        });
    }

    private get label (): JSX.Element {
        return (
            <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{I18n.t('training.targetedTraining.title')}</Text>
                <Tooltip
                    containerStyle={styles.tooltip}
                    gradientType={'blue'}
                    screenProps={this.props.screenProps}
                    tooltipId={ETooltipIds.trainingTargetedArea}
                />
            </View>
        );
    }

    private get items (): JSX.Element {
        const items = getAllTargetedTrainingItems();
        if (items.length <= 0) {
            return null;
        }

        const result = items.map((targetedTrainingItem: TargetedTrainingItem, index: number) => {
            const itemContainerStyle = [
                styles.itemContainer,
                Math.abs(index % 2) === 1 ? styles.oddItemContainer : {}
            ];
            return (
                <TouchableScale
                    key={`targeted-training-${index}`}
                    style={itemContainerStyle}
                    onPress={debounce(() => this.onPress(targetedTrainingItem),
                        500,
                        { 'leading': true, 'trailing': false }
                    )}
                >
                    <View style={styles.itemShadowContainer}>
                        <View style={styles.itemShadowWapper}>
                            <DiffuseShadow
                                style={styles.itemShadow}
                                horizontalOffset={0}
                                verticalOffset={16}
                                borderRadius={60}
                                shadowOpacity={0.3}
                                color={colors.violetDark}
                            />
                        </View>
                    </View>
                    <ItemBackgroundShape style={styles.itemBackgroundShape} />
                    <View style={styles.itemContentContainer}>
                        <FadeInImage
                            source={targetedTrainingItem.image}
                            containerCustomStyle={styles.itemIcon}
                            tintColor={colors.violetDark}
                            disableAnimation={true}
                        />
                        <Text style={styles.itemLabel}>{ targetedTrainingItem.title }</Text>
                    </View>
                </TouchableScale>
            );
        });

        return <Fragment>{result}</Fragment>;
    }

    public render (): JSX.Element {
        const { containerStyle } = this.props;

        return (
            <View style={containerStyle}>
                <View style={styles.container}>
                    <Blob style={styles.backgroundBlob} />
                    {this.label}
                    <ScrollView
                        style={styles.scrollview}
                        contentContainerStyle={styles.scrollContentContainer}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        overScrollMode={'never'}
                        snapToAlignment={'start'}
                        snapToInterval={ITEM_WIDTH + ITEM_MARGIN_RIGHT}
                        decelerationRate={'fast'}
                    >
                        { this.items }
                    </ScrollView>
                </View>
            </View>
        );
    }
}

export default withNavigation(TargetedAreasTraining);
