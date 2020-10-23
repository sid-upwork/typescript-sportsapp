import React, { PureComponent } from 'react';
import { Animated, Easing, TouchableOpacity, View } from 'react-native';
import { debounce } from 'lodash';
import { INextExerciseData } from '../../views/Workout';
import { ETooltipIds } from '../../store/modules/tutorials';
import { IScreenProps } from '../../index';
import delays from '../../utils/animDelays';
import i18n from '../../utils/i18n';
import { isIOS } from '../../utils/os';

import LinearGradient from 'react-native-linear-gradient';

import FadeInImage from '../FadeInImage';
import Tooltip from '../Tooltip';
// import TouchableScale from '../TouchableScale';
import WorkoutBottomSubmenuButton from './WorkoutBottomSubmenuButton';
import WorkoutBottomNext from './WorkoutBottomNext';

// import colors from '../../styles/base/colors.style';
import styles, {
    // BUTTON_COMPLETE_GRADIENT_COLORS,
    BUTTON_COMPLETE_TRANSLATE_X,
    BUTTON_PLUS_ICON_COLOR,
    // BUTTON_SET_ACTIVE_GRADIENT_COLORS,
    SHEET_MENU_BACKGROUND_GRADIENT,
    SHEET_MENU_TOTAL_HEIGHT,
    SHEET_NEXT_HEIGHT
} from '../../styles/components/Workout/WorkoutBottomButtons.style';

const COMPLETE_ICON = require('../../static/icons/complete.png');
const EXIT_ICON = require('../../static/icons/exit.png');
const HISTORY_ICON = require('../../static/icons/history.png');
const MENU_ICON = require('../../static/icons/menu.png');
// const NEXT_ICON = require('../../static/icons/next.png');
const SUMMARY_ICON = require('../../static/icons/summary.png');

interface IProps {
    nextExerciseData: INextExerciseData;
    hide?: boolean;
    showSetActiveButton?: boolean;
    onPressComplete?: () => void;
    onPressCompleteWorkout?: () => void;
    onPressHistory?: () => void;
    onPressOverview?: () => void;
    onPressQuit?: () => void;
    screenProps: IScreenProps;
}

interface IState {
    animButtonPlusShadowOpacity: Animated.Value;
    animButtonPlusTransform: Animated.Value;
    animButtonPlusIconTransform: Animated.Value;
    animHideCompleteOpacity: Animated.Value;
    animHideCompleteTransform: Animated.Value;
    animHideNextOpacity: Animated.Value;
    animHideNextTransform: Animated.Value;
    animHideSetActiveOpacity: Animated.Value;
    animHideSetActiveTransform: Animated.Value;
    // animReplaceCompleteOpacity: Animated.Value;
    // animReplaceCompleteTransform: Animated.Value;
    // animReplaceSetActiveOpacity: Animated.Value;
    // animReplaceSetActiveTransform: Animated.Value;
    animSheetMenuOpacity: Animated.Value;
    animSheetMenuTransform: Animated.Value;
    animSheetNextOpacity: Animated.Value;
    animSheetNextTransform: Animated.Value;
    animSheetNextBackground: Animated.Value;
    animSheetOverlay: Animated.Value;
    sheetExpanded: boolean;
}

class WorkoutBottomButtons extends PureComponent<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animButtonPlusShadowOpacity: new Animated.Value(0),
            animButtonPlusTransform: new Animated.Value(0),
            animButtonPlusIconTransform: new Animated.Value(0),
            animHideCompleteOpacity: new Animated.Value(1),
            animHideCompleteTransform: new Animated.Value(1),
            animHideNextOpacity: new Animated.Value(1),
            animHideNextTransform: new Animated.Value(1),
            animHideSetActiveOpacity: new Animated.Value(1),
            animHideSetActiveTransform: new Animated.Value(1),
            // animReplaceCompleteOpacity: new Animated.Value(props.showSetActiveButton ? 0 : 1),
            // animReplaceCompleteTransform: new Animated.Value(props.showSetActiveButton ? 0 : 1),
            // animReplaceSetActiveOpacity: new Animated.Value(props.showSetActiveButton ? 1 : 0),
            // animReplaceSetActiveTransform: new Animated.Value(props.showSetActiveButton ? 1 : 0),
            animSheetMenuOpacity: new Animated.Value(0),
            animSheetMenuTransform: new Animated.Value(0),
            animSheetNextOpacity: new Animated.Value(0),
            animSheetNextTransform: new Animated.Value(0),
            animSheetNextBackground: new Animated.Value(0),
            animSheetOverlay: new Animated.Value(0),
            sheetExpanded: false
        };
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { hide, showSetActiveButton } = this.props;
        if (hide !== prevProps.hide) {
            this.animateHide(!hide);
        }
        // if (showSetActiveButton !== prevProps.showSetActiveButton) {
        //     this.animateButtonReplacement(showSetActiveButton);
        // }
    }

    private animateHide (animateIn?: boolean): void {
        const {
            animHideCompleteOpacity, animHideCompleteTransform,
            animHideNextOpacity, animHideNextTransform,
            animHideSetActiveOpacity, animHideSetActiveTransform
        } = this.state;
        const toValue = animateIn ? 1 : 0;
        const commonProps = {
            toValue,
            isInteraction: false,
            useNativeDriver: true
        };

        Animated.parallel([
            Animated.sequence([
                Animated.delay(animateIn ? delays.views.workout.videoStopUIDelay : delays.views.workout.videoLaunchUIDelay - 80),
                Animated.parallel([
                    Animated.timing(animHideCompleteOpacity, {
                        ...commonProps,
                        duration: 50,
                        easing: Easing.linear
                    }),
                    Animated.spring(animHideCompleteTransform, {
                        ...commonProps,
                        speed: 12,
                        bounciness: 6
                    }),
                    Animated.timing(animHideSetActiveOpacity, {
                        ...commonProps,
                        duration: 50,
                        easing: Easing.linear
                    }),
                    Animated.spring(animHideSetActiveTransform, {
                        ...commonProps,
                        speed: 12,
                        bounciness: 6
                    })
                ])
            ]),
            Animated.sequence([
                Animated.delay(animateIn ? delays.views.workout.videoStopUIDelay + 80 : delays.views.workout.videoLaunchUIDelay - 160),
                Animated.parallel([
                    Animated.timing(animHideNextOpacity, {
                        ...commonProps,
                        duration: 50,
                        easing: Easing.linear
                    }),
                    Animated.spring(animHideNextTransform, {
                        ...commonProps,
                        speed: 15,
                        bounciness: 7
                    })
                ])
            ])
        ]).start();
    }

    // private animateButtonReplacement (showSetActiveButton?: boolean): void {
    //     const {
    //         animReplaceCompleteOpacity, animReplaceCompleteTransform,
    //         animReplaceSetActiveOpacity, animReplaceSetActiveTransform
    //     } = this.state;
    //     const completeToValue = showSetActiveButton ? 0 : 1;
    //     const setActiveToValue = showSetActiveButton ? 1 : 0;
    //     const commonProps = {
    //         isInteraction: false,
    //         useNativeDriver: true
    //     };

    //     Animated.parallel([
    //         Animated.parallel([
    //             Animated.timing(animReplaceCompleteOpacity, {
    //                 ...commonProps,
    //                 toValue: completeToValue,
    //                 duration: 50,
    //                 easing: Easing.linear
    //             }),
    //             Animated.spring(animReplaceCompleteTransform, {
    //                 ...commonProps,
    //                 toValue: completeToValue,
    //                 speed: 12,
    //                 bounciness: 6
    //             })
    //         ]),
    //         Animated.parallel([
    //             Animated.timing(animReplaceSetActiveOpacity, {
    //                 ...commonProps,
    //                 toValue: setActiveToValue,
    //                 duration: 50,
    //                 easing: Easing.linear
    //             }),
    //             Animated.spring(animReplaceSetActiveTransform, {
    //                 ...commonProps,
    //                 toValue: setActiveToValue,
    //                 speed: 12,
    //                 bounciness: 6
    //             })
    //         ])
    //     ]).start();
    // }

    private animateSheetIn (): void {
        const {
            animSheetMenuOpacity, animSheetMenuTransform, animSheetNextOpacity, animSheetNextTransform, animSheetOverlay,
            animHideCompleteOpacity, animHideCompleteTransform, animHideSetActiveOpacity, animHideSetActiveTransform,
            animButtonPlusShadowOpacity, animButtonPlusTransform, animButtonPlusIconTransform
        } = this.state;
        const toValue = 1;
        const duration = 250;
        const commonProps = {
            toValue,
            isInteraction: false,
            useNativeDriver: true
        };

        Animated.parallel([
            Animated.parallel([
                Animated.timing(animSheetMenuOpacity, {
                    ...commonProps,
                    duration: 50,
                    easing: Easing.linear
                }),
                Animated.spring(animSheetMenuTransform, {
                    ...commonProps,
                    speed: 18,
                    bounciness: 4
                })
            ]),
            Animated.parallel([
                Animated.timing(animSheetNextOpacity, {
                    ...commonProps,
                    duration: 50,
                    easing: Easing.linear
                }),
                Animated.spring(animSheetNextTransform, {
                    ...commonProps,
                    speed: 28,
                    bounciness: 6
                })
            ]),
            Animated.timing(animSheetOverlay, {
                ...commonProps,
                duration,
                easing: Easing.linear
            }),
            Animated.timing(animButtonPlusShadowOpacity, {
                ...commonProps,
                duration: duration / 2,
                easing: Easing.linear
            }),
            Animated.spring(animButtonPlusTransform, {
                ...commonProps,
                speed: 15,
                bounciness: 7
            }),
            Animated.spring(animButtonPlusIconTransform, {
                ...commonProps,
                speed: 12,
                bounciness: 4
            }),
            Animated.timing(animHideCompleteOpacity, {
                ...commonProps,
                toValue: 0,
                duration,
                easing: Easing.linear
            }),
            Animated.spring(animHideCompleteTransform, {
                ...commonProps,
                toValue: 0,
                speed: 14,
                bounciness: 6
            }),
            Animated.timing(animHideSetActiveOpacity, {
                ...commonProps,
                toValue: 0,
                duration,
                easing: Easing.linear
            }),
            Animated.spring(animHideSetActiveTransform, {
                ...commonProps,
                toValue: 0,
                speed: 14,
                bounciness: 6
            })
        ]).start();
    }

    private animateSheetOut (callback?: () => void): void {
        const {
            animSheetMenuOpacity, animSheetMenuTransform, animSheetNextOpacity, animSheetNextTransform, animSheetOverlay,
            animHideCompleteOpacity, animHideCompleteTransform, animHideSetActiveOpacity, animHideSetActiveTransform,
            animButtonPlusShadowOpacity, animButtonPlusTransform, animButtonPlusIconTransform
        } = this.state;
        const toValue = 0;
        const opacityDuration = 150;
        const transformDuration = 250;
        const commonProps = {
            toValue,
            isInteraction: false,
            useNativeDriver: true
        };

        Animated.parallel([
            Animated.sequence([
                Animated.timing(animSheetMenuTransform, {
                    ...commonProps,
                    duration: transformDuration,
                    easing: Easing.in(Easing.poly(4))
                }),
                Animated.timing(animSheetMenuOpacity, {
                    ...commonProps,
                    duration: opacityDuration,
                    easing: Easing.linear
                })
            ]),
            Animated.sequence([
                Animated.delay(Math.round(transformDuration * 0.35)),
                Animated.timing(animSheetNextTransform, {
                    ...commonProps,
                    duration: transformDuration,
                    easing: Easing.in(Easing.poly(4))
                }),
                Animated.timing(animSheetNextOpacity, {
                    ...commonProps,
                    duration: opacityDuration,
                    easing: Easing.linear
                })
            ]),
            Animated.timing(animSheetOverlay, {
                ...commonProps,
                duration: opacityDuration,
                easing: Easing.linear
            }),
            Animated.sequence([
                Animated.delay(Math.round(transformDuration * 0.5)),
                Animated.parallel([
                    Animated.timing(animButtonPlusShadowOpacity, {
                        ...commonProps,
                        duration: opacityDuration,
                        easing: Easing.linear
                    }),
                    Animated.spring(animButtonPlusTransform, {
                        ...commonProps,
                        speed: 15,
                        bounciness: 7
                    }),
                    Animated.spring(animButtonPlusIconTransform, {
                        ...commonProps,
                        speed: 12,
                        bounciness: 4
                    }),
                    Animated.timing(animHideCompleteOpacity, {
                        ...commonProps,
                        toValue: 1,
                        duration: opacityDuration,
                        easing: Easing.linear
                    }),
                    Animated.spring(animHideCompleteTransform, {
                        ...commonProps,
                        toValue: 1,
                        speed: 14,
                        bounciness: 6
                    }),
                    Animated.timing(animHideSetActiveOpacity, {
                        ...commonProps,
                        toValue: 1,
                        duration: opacityDuration,
                        easing: Easing.linear
                    }),
                    Animated.spring(animHideSetActiveTransform, {
                        ...commonProps,
                        toValue: 1,
                        speed: 14,
                        bounciness: 6
                    })
                ])
            ])
        ]).start(() => {
            callback && callback();
        });
    }

    private toggleMagicButton = (): void => {
        const { sheetExpanded } = this.state;
        if (sheetExpanded) {
            this.setState({ sheetExpanded: false }, () => {
                this.animateSheetOut();
            });
        } else {
            this.setState({ sheetExpanded: true }, () => {
                this.animateSheetIn();
            });
        }
    }

    private get overlay (): JSX.Element {
        const { animSheetOverlay, sheetExpanded } = this.state;
        const animatedStyle = {
            opacity: animSheetOverlay
        };
        const pointerEvents = sheetExpanded ? 'auto' : 'none';
        const onPress = debounce(this.toggleMagicButton, 500, { 'leading': true, 'trailing': false });
        return (
            <View style={styles.overlayContainer} pointerEvents={pointerEvents}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onPress}
                    style={styles.fullSpace}
                >
                    <Animated.View style={[styles.fullSpace, styles.overlay, animatedStyle]} />
                </TouchableOpacity>
            </View>
        );
    }

    private get menuSheet (): JSX.Element {
        const { animSheetMenuTransform, animSheetMenuOpacity, sheetExpanded } = this.state;
        const { onPressCompleteWorkout, onPressHistory, onPressOverview, onPressQuit, screenProps } = this.props;
        const backgroundAnimatedStyle = {
            opacity: animSheetMenuOpacity,
            transform: [
                {
                    translateY: animSheetMenuTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [SHEET_MENU_TOTAL_HEIGHT, 1]
                    })
                }
            ]
        };
        return (
            <Animated.View style={[styles.menuSheetContainer, backgroundAnimatedStyle]}>
                <LinearGradient
                    angle={160}
                    colors={SHEET_MENU_BACKGROUND_GRADIENT}
                    style={[styles.fullSpace, styles.menuSheetGradient]}
                    useAngle={true}
                />
                <View style={styles.menuSheetInnerContainer}>
                    <WorkoutBottomSubmenuButton
                        animate={sheetExpanded}
                        icon={HISTORY_ICON}
                        index={0}
                        label={i18n.t('workout.history')}
                        onPress={onPressHistory}
                        screenProps={screenProps}
                        tooltipId={ETooltipIds.workoutMenuHistory}
                    />
                    <WorkoutBottomSubmenuButton
                        animate={sheetExpanded}
                        icon={SUMMARY_ICON}
                        index={1}
                        label={i18n.t('workout.overview')}
                        onPress={onPressOverview}
                        screenProps={screenProps}
                        tooltipId={ETooltipIds.workoutMenuSummary}
                    />
                    <WorkoutBottomSubmenuButton
                        animate={sheetExpanded}
                        icon={COMPLETE_ICON}
                        index={2}
                        label={i18n.t('workout.complete')}
                        onPress={onPressCompleteWorkout}
                        screenProps={screenProps}
                        tooltipId={ETooltipIds.workoutMenuComplete}
                    />
                    <WorkoutBottomSubmenuButton
                        animate={sheetExpanded}
                        icon={EXIT_ICON}
                        index={3}
                        label={i18n.t('workout.quit')}
                        onPress={onPressQuit}
                        screenProps={screenProps}
                        tooltipId={ETooltipIds.workoutMenuQuit}
                    />
                </View>
            </Animated.View>
        );
    }

    private get nextSheet (): JSX.Element {
        const { animSheetNextOpacity, animSheetNextTransform, sheetExpanded } = this.state;
        const { nextExerciseData } = this.props;
        const animatedStyle = {
            opacity: animSheetNextOpacity,
            transform: [
                {
                    translateY: animSheetNextTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [SHEET_NEXT_HEIGHT, 1]
                    })
                }
            ]
        };
        return (
            <Animated.View style={[styles.nextSheetContainer, animatedStyle]}>
                <WorkoutBottomNext
                    animate={sheetExpanded}
                    data={nextExerciseData}
                />
            </Animated.View>
        );
    }

    private get sheet (): JSX.Element {
        const { sheetExpanded } = this.state;
        const pointerEvents = sheetExpanded ? 'auto' : 'none';
        return (
            <View style={styles.sheetContentContainer} pointerEvents={pointerEvents}>
                { this.menuSheet }
                { this.nextSheet }
            </View>
        );
    }

    private get magicButton (): JSX.Element {
        const {
            animHideNextOpacity, animHideNextTransform,
            animButtonPlusTransform, animButtonPlusShadowOpacity,
            animButtonPlusIconTransform
        } = this.state;
        const { screenProps } = this.props;
        const animatedHideStyle = {
            opacity: animHideNextOpacity.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 1, 1]
            }),
            transform: [
                {
                    translateX: animHideNextTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [BUTTON_COMPLETE_TRANSLATE_X, 0]
                    })
                }
            ]
        };
        const buttonShadowAnimatedStyle = {
            opacity: animButtonPlusShadowOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0]
            }),
            transform: [
                {
                    scale: animButtonPlusTransform.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.2, 1]
                    })
                }
            ]
        };
        const iconAnimatedStyle = {
            transform: [
                {
                    rotate: animButtonPlusIconTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '270deg']
                    })
                }
            ]
        };
        const onPress = debounce(this.toggleMagicButton, 500, { 'leading': true, 'trailing': false });
        return (
            <Animated.View style={[styles.buttonPlusContainer, animatedHideStyle]}>
                <Animated.View style={[styles.fullSpace, styles.buttonPlusBackground, buttonShadowAnimatedStyle]} />
                <Animated.View style={[styles.fullSpace, iconAnimatedStyle]}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={[styles.fullSpace, styles.buttonPlusIconContainer]}
                        onPress={onPress}
                    >
                        <FadeInImage
                            resizeMode={'contain'}
                            source={MENU_ICON}
                            containerCustomStyle={styles.buttonPlusIcon}
                            tintColor={BUTTON_PLUS_ICON_COLOR}
                        />
                    </TouchableOpacity>
                </Animated.View>
                <Tooltip
                    containerStyle={styles.tooltip}
                    screenProps={screenProps}
                    tooltipId={ETooltipIds.workoutMenu}
                />
            </Animated.View>
        );
    }

    // private get buttonComplete (): JSX.Element {
    //     const {
    //         animHideCompleteOpacity, animHideCompleteTransform,
    //         animReplaceCompleteOpacity, animReplaceCompleteTransform
    //     } = this.state;
    //     const { onPressComplete } = this.props;
    //     const hideAnimatedStyle = {
    //         opacity: animHideCompleteOpacity.interpolate({
    //             inputRange: [0, 0.1, 1],
    //             outputRange: [0, 1, 1]
    //         }),
    //         transform: [
    //             {
    //                 translateX: animHideCompleteTransform.interpolate({
    //                     inputRange: [0, 1],
    //                     outputRange: [BUTTON_COMPLETE_TRANSLATE_X, 0]
    //                 })
    //             }
    //         ]
    //     };
    //     const replaceAnimatedStyle = {
    //         opacity: animReplaceCompleteOpacity.interpolate({
    //             inputRange: [0, 0.1, 1],
    //             outputRange: [0, 1, 1]
    //         }),
    //         transform: [
    //             {
    //                 translateX: animReplaceCompleteTransform.interpolate({
    //                     inputRange: [0, 1],
    //                     outputRange: [BUTTON_COMPLETE_TRANSLATE_X, 0]
    //                 })
    //             }
    //         ]
    //     };
    //     return (
    //         <Animated.View style={hideAnimatedStyle}>
    //             <Animated.View style={replaceAnimatedStyle}>
    //                 <TouchableScale
    //                     containerStyle={styles.buttonCompleteContainer}
    //                     style={[styles.fullSpace, styles.buttonComplete]}
    //                     onPress={onPressComplete}
    //                 >
    //                     <LinearGradient
    //                         angle={160}
    //                         colors={BUTTON_COMPLETE_GRADIENT_COLORS}
    //                         style={[styles.fullSpace, styles.buttonCompleteGradient]}
    //                         useAngle={true}
    //                     />
    //                     <FadeInImage
    //                         source={NEXT_ICON}
    //                         containerCustomStyle={styles.buttonCompleteIcon}
    //                         disableAnimation={true}
    //                         resizeMode={styles.buttonCompleteIcon.resizeMode}
    //                         tintColor={styles.buttonCompleteIcon.color}
    //                     />
    //                 </TouchableScale>
    //             </Animated.View>
    //         </Animated.View>
    //     );
    // }

    // private get buttonSetActive (): JSX.Element {
    //     const {
    //         animHideSetActiveOpacity, animHideSetActiveTransform,
    //         animReplaceSetActiveOpacity, animReplaceSetActiveTransform
    //     } = this.state;
    //     const hideAnimatedStyle = {
    //         opacity: animHideSetActiveOpacity.interpolate({
    //             inputRange: [0, 0.1, 1],
    //             outputRange: [0, 1, 1]
    //         }),
    //         transform: [
    //             {
    //                 translateX: animHideSetActiveTransform.interpolate({
    //                     inputRange: [0, 1],
    //                     outputRange: [BUTTON_COMPLETE_TRANSLATE_X, 0]
    //                 })
    //             }
    //         ]
    //     };
    //     const replaceAnimatedStyle = {
    //         opacity: animReplaceSetActiveOpacity.interpolate({
    //             inputRange: [0, 0.1, 1],
    //             outputRange: [0, 1, 1]
    //         }),
    //         transform: [
    //             {
    //                 translateX: animReplaceSetActiveTransform.interpolate({
    //                     inputRange: [0, 1],
    //                     outputRange: [BUTTON_COMPLETE_TRANSLATE_X, 0]
    //                 })
    //             }
    //         ]
    //     };
    //     return (
    //         <Animated.View style={hideAnimatedStyle}>
    //             <Animated.View style={replaceAnimatedStyle}>
    //                 <TouchableScale
    //                     containerStyle={styles.buttonCompleteContainer}
    //                     style={[styles.fullSpace, styles.buttonSetActive]}
    //                 >
    //                     <LinearGradient
    //                         angle={160}
    //                         colors={BUTTON_SET_ACTIVE_GRADIENT_COLORS}
    //                         style={[styles.fullSpace, styles.buttonCompleteGradient]}
    //                         useAngle={true}
    //                     />
    //                     <FadeInImage
    //                         source={NEXT_ICON}
    //                         containerCustomStyle={styles.buttonSetActiveIcon}
    //                         disableAnimation={true}
    //                         resizeMode={styles.buttonCompleteIcon.resizeMode}
    //                         tintColor={styles.buttonCompleteIcon.color}
    //                     />
    //                 </TouchableScale>
    //             </Animated.View>
    //         </Animated.View>
    //     );
    // }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                { this.overlay }
                {/* { this.buttonComplete } */}
                {/* { this.buttonSetActive } */}
                { this.sheet }
                { this.magicButton }
            </View>
        );
    }
}

export default WorkoutBottomButtons;
