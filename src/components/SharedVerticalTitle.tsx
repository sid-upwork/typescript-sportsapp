import React, { Component } from 'react';
import { View, Text } from 'react-native';
import I18n, { getLanguageFromLocale } from '../utils/i18n';

import { viewportHeight } from '../styles/base/metrics.style';
import styles, { TITLE_CONTAINER_WIDTH, getLineHeight } from '../styles/components/SharedVerticalTitle.style';

interface IProps {
    title: string;
    width: number;
    fontSize?: number;
    height?: number;
    innerStyle?: any;
    innerStyleHorizontal?: any;
    innerStyleVertical?: any;
    IconComponent?: JSX.Element;
    numberOfLines?: number;
    rotateDirection?: 'clockwise' | 'counter-clockwise';
    style?: any;
    styleHorizontal?: any;
    styleVertical?: any;
    textStyle?: any;
    textStyleHorizontal?: any;
    textStyleVertical?: any;
}

interface IState {}

class SharedVerticalTitle extends Component<IProps, IState> {

    private get rotationDegrees (): string {
        const { rotateDirection } = this.props;
        return rotateDirection === 'clockwise' ? '90deg' : '-90deg';
    }

    public render (): JSX.Element {
        const {
            fontSize, height, IconComponent, innerStyle, innerStyleHorizontal, innerStyleVertical, numberOfLines, rotateDirection,
            style, styleHorizontal, styleVertical, textStyle, textStyleHorizontal, textStyleVertical, title, width
        } = this.props;
        const isVerticalLanguage = getLanguageFromLocale(I18n.locale).isVerticalLanguage;
        const isClockwise = rotateDirection === 'clockwise';
        const hasIcon = !!IconComponent;
        const editedTitle = isVerticalLanguage ? title.split('').join('\n') : title;
        const containerWidth = width || TITLE_CONTAINER_WIDTH;
        const containerHeight = height || Math.round(viewportHeight / 2);
        const containerMergedStyle = [
            styles.container,
            style,
            isVerticalLanguage ? styleVertical : styleHorizontal,
            isVerticalLanguage ? {
                width: containerWidth,
                height: height || null,
                overflow: !!height ? 'hidden' : 'visible'
            } : {
                width: containerWidth,
                height: containerHeight
            }
        ];
        const containerInnerMergedStyle = isVerticalLanguage ? [
            styles.containerInnerRotated,
            innerStyleVertical || {},
            {
                width: width || null,
                alignItems: 'center'
            }
        ] : [
            styles.containerInnerRotated,
            isClockwise ? styles.containerInnerRotatedClockwise : styles.containerInnerRotatedCounterClockwise,
            hasIcon ? [
                styles.containerInnerRotatedRow,
                { justifyContent: isClockwise ? 'flex-start' : 'flex-end' }
            ] : {},
            innerStyle || {},
            innerStyleHorizontal || {},
            {
                width: containerHeight,
                height: containerWidth,
                transform: [
                    { rotate: this.rotationDegrees },
                    { translateY: -((containerHeight - containerWidth) / 2)},
                    { translateX: ((containerHeight - containerWidth) / 2) * (isClockwise ? 1 : -1)}
                ]
            }
        ];
        const textFontSize = fontSize || (textStyle && textStyle.fontSize);
        const textMergedStyle = [
            styles.title,
            isVerticalLanguage ? styles.titleVerticalLanguage : styles.titleHorizontalLanguage,
            textFontSize ? { lineHeight: getLineHeight(textFontSize, isVerticalLanguage) } : {},
            textStyle,
            isVerticalLanguage ? textStyleVertical : textStyleHorizontal
        ];
        const lines = isVerticalLanguage ? undefined : (numberOfLines || 1);

        return (
            <View style={containerMergedStyle}>
                <View style={containerInnerMergedStyle}>
                    { IconComponent }
                    <Text style={textMergedStyle} numberOfLines={lines}>{ editedTitle }</Text>
                </View>
            </View>
        );
    }
}

export default SharedVerticalTitle;
