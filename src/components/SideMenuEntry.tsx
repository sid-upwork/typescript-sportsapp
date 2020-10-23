import React, { Component, Fragment } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Linking } from 'react-native';
import { replace, getNavigationState, INavigateMenuEntry } from '../navigation/services';
import { get } from 'lodash';
import { logEvent } from '../utils/analytics';
import { isReleaseBundleID } from '../utils/bundleId';
import { isAndroid } from '../utils/os';
import chroma from 'chroma-js';

import { DRAWER_ANIMATION_DURATION } from '../styles/components/AppDrawer.style';
import colors from '../styles/base/colors.style';
import styles from '../styles/components/SideMenuEntry.style';

interface IProps {
    active: boolean;
    animate: boolean;
    entry: INavigateMenuEntry;
    index: number;
    setDrawerOpened: (opened: boolean) => void;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
}

// https://stackoverflow.com/a/58255666/8412141
// https://stackoverflow.com/a/47830974/8412141
const FB_GROUP_ID = isReleaseBundleID() ? '2814396668674446' : '2247937278846758';
const FB_WEB_URL = `https://www.facebook.com/groups/${FB_GROUP_ID}/`;
const FB_APP_SCHEME = `fb://`;
const FB_APP_URL_IOS = `${FB_APP_SCHEME}profile/${FB_GROUP_ID}/`;
const FB_APP_URL_ANDROID = `${FB_APP_SCHEME}group/${FB_GROUP_ID}`;
const FB_APP_URL = isAndroid ? FB_APP_URL_ANDROID : FB_APP_URL_IOS;

class SideMenuEntry extends Component<IProps, IState> {

    private timeout: any;

    constructor (props: IProps) {
        super(props);
        const initialAnimatedValue = props.animate ? 1 : 0;
        this.state = {
            animOpacity: new Animated.Value(initialAnimatedValue),
            animTransform: new Animated.Value(initialAnimatedValue)
        };
    }

    public componentDidUpdate (prevProps: IProps): void {
        if (prevProps.animate !== this.props.animate) {
            this.animateItem(this.props);
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.timeout);
    }

    private animateItem (props: IProps = this.props): void {
        const { animOpacity, animTransform } = this.state;
        const { animate, index } = props;

        const toValue = animate ? 1 : 0;
        const duration = animate ? 200 : 0;
        const delay = animate ? index * 35 : 0;

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animOpacity, {
                    toValue,
                    duration,
                    easing: Easing.out(Easing.ease),
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animTransform, {
                    toValue,
                    speed: 20,
                    bounciness: 10,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private async onPress (entry: INavigateMenuEntry): Promise<void> {
        if (entry.routeName === 'Community') {
            this.props.setDrawerOpened(false);

            // If the Facebook app is available we open it, otherwise we open Facebook's webs
            const facebookAppInstalled = await Linking.canOpenURL(FB_APP_SCHEME);
            const link = facebookAppInstalled ? FB_APP_URL : FB_WEB_URL;
            Linking.openURL(link);

            logEvent('community_open');
            return;
        }

        this.props.setDrawerOpened(false);

        // We wait for the menu to close before navigating
        this.timeout = setTimeout(() => {
            if (entry.routeName !== get(getNavigationState(), 'nav.routes[0].routeName')) {
                replace(entry);
            }
        }, DRAWER_ANIMATION_DURATION);

    }

    private get activeIndicator (): JSX.Element {
        const { active } = this.props;

        if (!active) {
            return null;
        }

        // Use a view instead of relying on background color to account for animation's bounciness
        return <View style={styles.activeContainer} />;
    }

    public render (): JSX.Element {
        const { entry, active } = this.props;
        const { animOpacity, animTransform } = this.state;

        const animatedStyles = {
            opacity: animOpacity,
            transform: [{
                translateX: animTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-150, 0]
                })
            }]
        };

        const underlayColor = active ?
            'transparent' :
            chroma(colors.background).alpha(0.30).css();

        const textStyle = [
            styles.title,
            active ? styles.activeTitle : {}
        ];

        return (
            <Animated.View style={animatedStyles}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    // onPress={debounce(() => this.onPress(entry), 200, { 'leading': true, 'trailing': false })}
                    onPress={() => this.onPress(entry)}
                    style={styles.container}
                >
                    <Fragment>
                        { this.activeIndicator }
                        <Text style={textStyle}>{entry.displayName}</Text>
                    </Fragment>
                </TouchableOpacity>
            </Animated.View>
        );
    }
}

export default SideMenuEntry;
