import React, { Component, Fragment } from 'react';
import { Animated, Easing } from 'react-native';
import delays from '../utils/animDelays';

import chroma from 'chroma-js';
import Reanimated from 'react-native-reanimated';
import { TabBar, SceneRendererProps, NavigationState, Route } from 'react-native-tab-view';
import CustomTabBarLabel from './CustomTabBarLabel';
import LinearGradient from 'react-native-linear-gradient';

import styles, { TAB_BAR_WIDTH } from '../styles/components/CustomTabBar.style';
import colors from '../styles/base/colors.style';

import { RecipeTypes } from '../views/Recipes';

interface IProps extends SceneRendererProps {
    navigationState: NavigationState<Route>;
    routes: { key: RecipeTypes, title: string }[];
}

interface IState {
    animIndicatorOpacity: Animated.Value;
    animIndicatorTransform: Animated.Value;
}
export default class CustomTabBar extends Component<IProps, IState> {

    private tabWidth: number;

    constructor (props: IProps) {
        super(props);
        this.tabWidth = TAB_BAR_WIDTH / (props.navigationState?.routes?.length || 4);
        this.state = {
            animIndicatorOpacity: new Animated.Value(0),
            animIndicatorTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateItem();
    }

    private animateItem (): void {
        const { animIndicatorOpacity, animIndicatorTransform } = this.state;
        Animated.sequence([
            Animated.delay(delays.views.recipes.tabs.indicator),
            Animated.parallel([
                Animated.timing(animIndicatorOpacity, {
                    toValue: 1,
                    duration: 100,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animIndicatorTransform, {
                    toValue: 1,
                    speed: 15,
                    bounciness: 7,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    // https://github.com/react-native-community/react-native-tab-view/blob/30216d3a5e199c22e68e17878dd66cff4a5dfb21/src/TabBarIndicator.tsx
    // https://github.com/react-native-community/react-native-tab-view/blob/01ba66e244882ce98ac624e82f71f9c43e810378/example/src/CustomIndicatorExample.tsx
    private renderIndicator = (props: any): JSX.Element => {
        const { animIndicatorOpacity, animIndicatorTransform } = this.state;
        const { position, navigationState } = props;
        const { routes } = navigationState;

        const translateX = Reanimated.multiply(
            Reanimated.max(Reanimated.min(position, routes.length - 1), 0),
            this.tabWidth
        );
        const containerStyle = [
            styles.tabBarIndicatorContainer,
            {
                width: this.tabWidth,
                transform: [{ translateX }] as any
            }
        ];
        const indicatorStyle = [
            styles.tabBarIndicator,
            {
                opacity: animIndicatorOpacity,
                transform: [{ scaleX: animIndicatorTransform }]
            }
        ];

        return (
            <Reanimated.View style={containerStyle}>
                <Animated.View style={indicatorStyle} />
            </Reanimated.View>
        );
    }

    private renderLabel = (props: any): JSX.Element => {
        const { routes } = this.props;
        let index = 0;

        for (let i = 0; i < routes.length; i++) {
            if (props.route.key === routes[i].key) {
                index = i;
            }
        }

        return (
            <CustomTabBarLabel
                {...props}
                index={index}
                tabWidth={this.tabWidth}
            />
        );
    }

    public render (): JSX.Element {
        const fadeColors: string[] = [
            chroma(colors.background).alpha(1).css(),
            chroma(colors.background).alpha(1).css(),
            chroma(colors.background).alpha(0.5).css(),
            chroma(colors.background).alpha(0).css()
        ];
        const fadeLocations: number[] = [0, 0.1, 0.75, 1];
        const tabStyle = [
            styles.tab,
            { width: this.tabWidth }
        ];

        return (
            <Fragment>
                <LinearGradient
                    pointerEvents={'none'}
                    style={styles.fadeEffect}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={fadeColors}
                    locations={fadeLocations}
                />
                <TabBar
                  {...this.props}
                  style={styles.tabBar}
                  tabStyle={tabStyle}
                  renderLabel={this.renderLabel}
                  renderIndicator={this.renderIndicator}
                  pressOpacity={0.7}
                  pressColor={colors.highlight}
                />
            </Fragment>
        );
    }
}
