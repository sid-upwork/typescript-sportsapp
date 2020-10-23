import React, { Component, Fragment, RefObject } from 'react';
import {
    Animated, Easing, StyleSheet, BackHandler, ToastAndroid,
    NativeEventSubscription, View
} from 'react-native';
import { StackActions, NavigationActions, NavigationContainer, NavigationState } from 'react-navigation';
import { connect } from 'react-redux';
import { setTopLevelNavigator } from '../navigation/services';
import { IReduxState } from '../store/reducers';
import { setDrawerOpened } from '../store/modules/userInterface';
import { OnboardingSteps } from '../store/modules/onboarding';
import { IScreenProps } from '../index';
import { setCurrentScreen } from '../utils/analytics';
import i18n from '../utils/i18n';

import Drawer from 'react-native-drawer';

import SideMenu from './SideMenu';

import styles, {
    DRAWER_PAN_CLOSE,
    DRAWER_PAN_OPEN,
    DRAWER_OFFSET,
    DRAWER_ANIMATION_DURATION
} from '../styles/components/AppDrawer.style';

interface IProps {
    AppContainer: NavigationContainer;
    connected: boolean;
    currentStep: OnboardingSteps;
    drawerLocked: boolean;
    drawerOpened: boolean;
    email: string;
    screenProps: IScreenProps;
    setDrawerOpened: (opened: boolean) => void;
    lastTouchId?: string;
}

interface IState {
    animBackgroundOpacity: Animated.Value;
    animBackgroundTransform: Animated.Value;
    animItems: boolean;
}

class AppDrawer extends Component<IProps, IState> {

    private appContainerRef: RefObject<any>;
    private backButtonPressedOnce: boolean;
    private backButtomTimeout: any;
    private backHandler: NativeEventSubscription;
    private drawerRef: RefObject<Drawer>;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animBackgroundOpacity: new Animated.Value(0),
            animBackgroundTransform: new Animated.Value(0),
            animItems: false
        };
        this.appContainerRef = React.createRef();
        this.backButtonPressedOnce = false;
        this.drawerRef = React.createRef();
    }

    public componentDidMount (): void {
        // Manage hardware back button
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        setTopLevelNavigator(this.appContainerRef.current);
        this.checkAccess();
        this.animateBackground(1);
    }

    public componentDidUpdate (prevProps: IProps): void {
        if (prevProps.drawerOpened !== this.props.drawerOpened) {
            if (this.props.drawerOpened) {
                this.drawerRef && this.drawerRef.current && this.drawerRef.current.open();
            } else {
                this.drawerRef && this.drawerRef.current && this.drawerRef.current.close();
            }
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.backButtomTimeout);
        this.backHandler.remove();
    }

    private handleBackPress = (): boolean => {
        const appContainer = this.appContainerRef.current;
        const popupManager = this.props.screenProps?.popupManagerRef?.current;

        // If there is a popup opened we dismiss it
        if (popupManager && popupManager.currentPopup && !popupManager.currentPopup?.preventOverlayDismissal) {
            popupManager.dismissPopup();
            return true;
        }

        const routesLength = appContainer?.state?.nav?.routes?.length;
        if (routesLength > 1) {
            // If we have more than one route in the stack we just go back
            appContainer.dispatch(
                NavigationActions.back()
            );
            return true;
        } else {
            if (this.backButtonPressedOnce) {
                // If the back button has been pressed once already, we close the app
                return false;
            } else {
                // Otherwise we ask for confirmation before closing the app
                const duration = 3500;

                ToastAndroid.show(i18n.t('app.closeAppConfirmation'), duration);
                this.backButtonPressedOnce = true;

                // After a few seconds we cancel the first press, otherwise if later the user presses the back button again
                // no warning would show and the app would close right away
                this.backButtomTimeout = setTimeout(() => {
                    this.backButtonPressedOnce = false;
                }, duration + 500);

                return true;
            }
        }
    }

    private checkAccess (): void {
        const { connected, currentStep, email, lastTouchId } = this.props;
        const loggedIn = connected && !!email;

        if (!loggedIn) {
            this.appContainerRef.current.dispatch(
                StackActions.replace({ routeName: 'Onboarding' })
            );
            return;
        }

        switch (currentStep) {
            case OnboardingSteps.Onboarding:
                this.appContainerRef.current.dispatch(
                    StackActions.replace({ routeName: 'Onboarding' })
                );
                break;
            case OnboardingSteps.ProgramSelection:
                this.appContainerRef.current.dispatch(
                    StackActions.replace({ routeName: 'ProgramSelection', params: { hideHeader: true, lastTouchId } })
                );
                break;
            case OnboardingSteps.Done:
                this.appContainerRef.current.dispatch(
                    StackActions.replace({ routeName: 'Training' })
                );
                break;
            default:
                this.appContainerRef.current.dispatch(
                    StackActions.replace({ routeName: 'Onboarding' })
                );
                break;
        }
    }

    private dimOverlay = (ratio: number): StyleSheet.NamedStyles<any> => {
        let scale = 1 - ratio / 4;
        if (scale > 1) {
            scale = 1;
        }

        return {
            drawer: {
                opacity: ratio,
                transform: [
                    { scaleX: 0.9 + 0.1 * ratio },
                    { scaleY: 0.9 + 0.1 * ratio }
                ]
            },
            main: {
                transform: [
                    { translateX: -25 * ratio },
                    { scaleX: scale },
                    { scaleY: scale }
                ],
                opacity: this.mapValue(ratio, 0, 1, 1, 0.40)
            },
            mainOverlay: {}
        };
    }

    private mapValue (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    private onOpen = () => {
        if (!this.props.drawerOpened) {
            this.props.setDrawerOpened(true);
        }
    }

    private onOpenStart = () => {
        this.animateBackground(0);
        this.setState({ animItems: true });
    }

    private onClose = () => {
        this.animateBackground(1);
        this.setState({ animItems: false });
        if (this.props.drawerOpened) {
            this.props.setDrawerOpened(false);
        }
    }

    private onNavigationStateChange = (prevState: NavigationState, currentState: NavigationState) => {
        // https://reactnavigation.org/docs/en/4.x/screen-tracking.html
        const currentRouteName = this.getActiveRouteName(currentState);
        const previousRouteName = this.getActiveRouteName(prevState);

        if (previousRouteName !== currentRouteName) {
            // Notify analytics that the current screen has changed
            setCurrentScreen(currentRouteName);
        }
    }

    private animateBackground (toValue: number): void {
        const { animBackgroundOpacity, animBackgroundTransform } = this.state;

        if (toValue === 1) {
            animBackgroundOpacity.setValue(1);
            animBackgroundTransform.setValue(1);
        } else {
            const duration = DRAWER_ANIMATION_DURATION * 2.5;
            Animated.parallel([
                Animated.timing(animBackgroundOpacity, {
                    toValue,
                    duration,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                })
                // Animated.timing(animBackgroundTransform, {
                //     toValue,
                //     duration,
                //     easing: Easing.inOut(Easing.poly(4)),
                //     isInteraction: false,
                //     useNativeDriver: true
                // })
            ]).start();
        }
    }

    private getActiveRouteName (navigationState: NavigationState): string {
        if (!navigationState) {
            return null;
        }

        const route = navigationState.routes[navigationState.index];

        // Dive into nested navigators
        if (route.routes) {
            return this.getActiveRouteName(route);
        }

        return route.routeName;
    }

    private get renderContent (): JSX.Element {
        return <SideMenu animItems={this.state.animItems} />;
    }

    private get background (): JSX.Element {
        const { animBackgroundOpacity, animBackgroundTransform } = this.state;
        const animatedStyle = {
            opacity: animBackgroundOpacity,
            transform: [
                { scale: animBackgroundTransform }
            ]
        };

        // This will make the iOS modal's stack effect better by darkening the app background
        return (
            <View style={styles.backgroundContainer}>
                <Animated.View style={[styles.background, animatedStyle]} />
            </View>
        );
    }

    public render (): JSX.Element {
        const { AppContainer } = this.props;

        return (
            <Fragment>
                { this.background }
                <Drawer
                    acceptPan={!this.props.drawerLocked}
                    content={this.renderContent}
                    negotiatePan={true}
                    openDrawerOffset={DRAWER_OFFSET}
                    onClose={this.onClose}
                    onOpen={this.onOpen}
                    onOpenStart={this.onOpenStart}
                    panCloseMask={DRAWER_PAN_CLOSE}
                    panOpenMask={DRAWER_PAN_OPEN}
                    ref={this.drawerRef}
                    styles={styles}
                    tapToClose={true}
                    type={'displace'}
                    tweenDuration={DRAWER_ANIMATION_DURATION}
                    tweenEasing={'easeOutQuart'}
                    tweenHandler={this.dimOverlay}
                >
                    <AppContainer
                        ref={this.appContainerRef}
                        enableURLHandling={false}
                        screenProps={this.props.screenProps}
                        onNavigationStateChange={this.onNavigationStateChange}
                    />
                </Drawer>
            </Fragment>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    lastTouchId: state.influencers.lastTouchId,
    connected: state.auth.connected,
    currentStep: state.onboarding.currentStep,
    drawerLocked: state.userInterface.drawerLocked,
    drawerOpened: state.userInterface.drawerOpened,
    email: state.userProfile.email
});

export default connect(mapStateToProps, { setDrawerOpened })(AppDrawer);
