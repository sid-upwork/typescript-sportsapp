import React, { Component } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import delays from '../utils/animDelays';
import i18n, { getLanguageFromLocale } from '../utils/i18n';

import styles from '../styles/components/CustomTabBar.style';

interface IProps {
    index: number;
    focused: boolean;
    route: any;
    tabWidth: number;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
}

export default class CustomTabBarLabel extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateItem();
    }

    private isVerticalLanguage (): boolean {
        return getLanguageFromLocale(i18n.locale).isVerticalLanguage;
    }

    private animateItem (): void {
        const { animOpacity, animTransform } = this.state;
        const delay = delays.views.recipes.tabs.label + this.props.index * 110;
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 100,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animTransform, {
                    toValue: 1,
                    speed: 15,
                    bounciness: 7,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private get labelStyle (): any {
        const { focused } = this.props;
        return [
            styles.tabBarLabel,
            styles[focused ? 'tabBarLabelActive' : 'tabBarLabelInactive']
        ];
    }

    private get verticalLanguageLabel (): JSX.Element {
        const { route, tabWidth } = this.props;
        const title = route?.title;

        if (!title || !title.length) {
            return null;
        }

        // Since the entire tab bar is rotated, it's really complicated to get the Chinese characters properly rendered (only one per line)
        // We need to extract each character and render them individually in a rotated container with the proper dimensions
        let charactersArray = [];
        for (let i = 0; i < title.length; i++) {
            charactersArray.push(title.charAt(i));
        }
        const characters = charactersArray.map((character: string, index: number) => {
            return (
                <Text
                    key={`custom-tab-bar-label-${index}`}
                    style={[this.labelStyle, styles.VLCharacter]}
                >
                    { character }
                </Text>
            );
        });
        return (
            <View style={[styles.VLLabelContainer, { width: tabWidth }]}>
                <View style={[styles.VLLabelContainerInner, { height: tabWidth }]}>
                    { characters }
                </View>
            </View>
        );
    }

    private get horizontalLanguageLabel (): JSX.Element {
        const { route } = this.props;
        return (
            <Text numberOfLines={1} style={this.labelStyle}>{ route?.title }</Text>
        );
    }

    private get label (): JSX.Element {
        return !this.isVerticalLanguage() ? this.horizontalLanguageLabel : this.verticalLanguageLabel;
    }

    public render (): JSX.Element {
        const { animOpacity, animTransform } = this.state;
        const animatedStyle = {
            opacity: animOpacity,
            transform: [{
                translateY: animTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-35, 0]
                })
            }]
        };

        return (
            <Animated.View style={animatedStyle} numberOfLines={1}>
                { this.label }
            </Animated.View>
        );
    }
}
