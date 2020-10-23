import React, { Component, Fragment } from 'react';
import { Animated, Easing, View, Vibration } from 'react-native';
import { IReduxState } from '../../store/reducers';
import { connect } from 'react-redux';
import { getFileReference } from '../../utils/file';
import i18n from '../../utils/i18n';

import Video from 'react-native-video';

import BlurWrapper from '../BlurWrapper';

import styles from '../../styles/components/Workout/WorkoutStartCountdown.style';

// import BackgroundShapeTopRight from '../../static/ProgramSelection/background-top.svg';
import BackgroundShapeLeft from '../../static/Workout/countdown-left.svg';
import BackgroundShapeRight from '../../static/Workout/countdown-right.svg';

interface IProps {
    callback?: () => void;
    workoutSounds: boolean;
}

interface IState {
    animGlobalOpacity: Animated.Value;
    animShapeLeftOpacity: Animated.Value;
    animShapeLeftTransform: Animated.Value;
    animShapeRightOpacity: Animated.Value;
    animShapeRightTransform: Animated.Value;
    anim3Opacity: Animated.Value;
    anim3Transform: Animated.Value;
    anim2Opacity: Animated.Value;
    anim2Transform: Animated.Value;
    anim1Opacity: Animated.Value;
    anim1Transform: Animated.Value;
    animLabelOpacity: Animated.Value;
    animLabelTransform: Animated.Value;
    playSound3: boolean;
    playSound2: boolean;
    playSound1: boolean;
    playSoundGo: boolean;
    touchThrough: boolean;
}

class WorkoutStartCountdown extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animGlobalOpacity: new Animated.Value(1),
            animShapeLeftOpacity: new Animated.Value(0),
            animShapeLeftTransform: new Animated.Value(0),
            animShapeRightOpacity: new Animated.Value(0),
            animShapeRightTransform: new Animated.Value(0),
            anim3Opacity: new Animated.Value(0),
            anim3Transform: new Animated.Value(0),
            anim2Opacity: new Animated.Value(0),
            anim2Transform: new Animated.Value(0),
            anim1Opacity: new Animated.Value(0),
            anim1Transform: new Animated.Value(0),
            animLabelOpacity: new Animated.Value(0),
            animLabelTransform: new Animated.Value(0),
            playSound3: false,
            playSound2: false,
            playSound1: false,
            playSoundGo: false,
            touchThrough: false
        };
    }

    public componentDidMount (): void {
        this.animate();
    }

    private animate (): void {
        const {
            animGlobalOpacity,
            animShapeLeftOpacity, animShapeLeftTransform,
            animShapeRightOpacity, animShapeRightTransform,
            anim3Opacity, anim3Transform,
            anim2Opacity, anim2Transform,
            anim1Opacity, anim1Transform,
            animLabelOpacity, animLabelTransform
        } = this.state;
        const { callback, workoutSounds } = this.props;
        const animationDuration = 700;
        const delay = 1000 - animationDuration;
        const outAnimationDuration = 500;

        const numberOpacityParams = {
            toValue: 1,
            duration: animationDuration,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const numberTransformParams = {
            toValue: 1,
            duration: animationDuration,
            easing: Easing.out(Easing.poly(4)),
            isInteraction: false,
            useNativeDriver: true
        };
        const shapeAnimOutParams = {
            toValue: 0,
            duration: outAnimationDuration,
            easing: Easing.inOut(Easing.poly(4)),
            isInteraction: false,
            useNativeDriver: true
        };

        Animated.sequence([
            Animated.delay(1000),
            Animated.parallel([
                Animated.parallel([
                    Animated.timing(animShapeRightOpacity, {
                        toValue: 1,
                        duration: 150,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(animShapeRightTransform, {
                        toValue: 1,
                        speed: 14,
                        bounciness: 6,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ]),
                Animated.sequence([
                    Animated.delay(120),
                    Animated.parallel([
                        Animated.timing(animShapeLeftOpacity, {
                            toValue: 1,
                            duration: 150,
                            easing: Easing.linear,
                            isInteraction: false,
                            useNativeDriver: true
                        }),
                        Animated.spring(animShapeLeftTransform, {
                            toValue: 1,
                            speed: 12,
                            bounciness: 5,
                            isInteraction: false,
                            useNativeDriver: true
                        })
                    ])
                ])
            ])
        ]).start(() => {
            workoutSounds && this.setState({ playSound3: true });
            Animated.parallel([
                Animated.timing(anim3Opacity, numberOpacityParams),
                Animated.timing(anim3Transform, numberTransformParams)
            ]).start(() => {
                workoutSounds && this.setState({ playSound2: true });
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.parallel([
                        Animated.timing(anim2Opacity, numberOpacityParams),
                        Animated.timing(anim2Transform, numberTransformParams)
                    ])
                ]).start(() => {
                    workoutSounds && this.setState({ playSound1: true });
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.parallel([
                            Animated.timing(anim1Opacity, numberOpacityParams),
                            Animated.timing(anim1Transform, numberTransformParams)
                        ])
                    ]).start(() => {
                        workoutSounds && this.setState({ playSoundGo: true });
                        Animated.sequence([
                            Animated.delay(delay),
                            Animated.parallel([
                                Animated.timing(animLabelOpacity, numberOpacityParams),
                                Animated.timing(animLabelTransform, numberTransformParams)
                            ])
                        ]).start(() => {
                            Animated.parallel([
                                Animated.parallel([
                                    Animated.timing(animShapeRightOpacity, shapeAnimOutParams),
                                    Animated.timing(animShapeRightTransform, shapeAnimOutParams)
                                ]),
                                Animated.sequence([
                                    Animated.delay(120),
                                    Animated.parallel([
                                        Animated.timing(animShapeLeftOpacity, shapeAnimOutParams),
                                        Animated.timing(animShapeLeftTransform, shapeAnimOutParams)
                                    ])
                                ]),
                                Animated.timing(animGlobalOpacity, shapeAnimOutParams)
                            ]).start(() => {
                                Vibration.vibrate(400);
                                this.setState({ touchThrough: true });
                                callback && callback();
                            });
                        });
                    });
                });
            });
        });
    }

    private get opacityInterpolation (): Animated.InterpolationConfigType {
        return {
            inputRange: [0, 0.4, 1],
            outputRange: [0, 1, 0]
        };
    }

    private get shapes (): JSX.Element {
        const {
            animShapeLeftOpacity, animShapeLeftTransform,
            animShapeRightOpacity, animShapeRightTransform
        } = this.state;
        const shapeLeftAnimatedStyle = {
            opacity: animShapeLeftOpacity,
            transform: [
                {
                    translateX: animShapeLeftTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [140, 0]
                    })
                },
                {
                    rotate: animShapeLeftTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['30deg', '0deg']
                    })
                },
                {
                    scale: animShapeLeftTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1]
                    })
                }
            ]
        };
        const shapeRightAnimatedStyle = {
            opacity: animShapeRightOpacity,
            transform: [
                {
                    translateX: animShapeRightTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [140, 0]
                    })
                },
                {
                    rotate: animShapeRightTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['98deg', '0deg']
                    })
                },
                {
                    scale: animShapeRightTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1]
                    })
                }
            ]
        };
        return (
            <View style={styles.fullSpace}>
                {/* <BackgroundShapeTopRight
                    style={styles.shapeTopRight}
                    height={styles.shapeTopRight.height}
                    width={styles.shapeTopRight.width}
                /> */}
                <Animated.View style={[styles.fullSpace, shapeLeftAnimatedStyle]}>
                    <BackgroundShapeLeft
                        style={styles.shapeLeft}
                        height={styles.shapeLeft.height}
                        width={styles.shapeLeft.width}
                    />
                </Animated.View>
                <Animated.View style={[styles.fullSpace, shapeRightAnimatedStyle]}>
                    <BackgroundShapeRight
                        style={styles.shapeRight}
                        height={styles.shapeRight.height}
                        width={styles.shapeRight.width}
                    />
                </Animated.View>
            </View>
        );
    }

    private get sounds (): JSX.Element {
        const { playSound3, playSound2, playSound1, playSoundGo } = this.state;
        const { workoutSounds } = this.props;
        return workoutSounds ? (
            <Fragment>
                { <Video paused={!playSound3} source={{ uri: getFileReference('3', 'mp3') }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSound2} source={{ uri: getFileReference('2', 'mp3') }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSound1} source={{ uri: getFileReference('1', 'mp3') }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSoundGo} source={{ uri: getFileReference('go', 'mp3') }} ignoreSilentSwitch={'obey'} /> }
            </Fragment>
        ) : null;
    }

    private get number3 (): JSX.Element {
        const { anim3Opacity, anim3Transform } = this.state;
        const animatedStyle = {
            opacity: anim3Opacity.interpolate(this.opacityInterpolation),
            transform: [{ scale: anim3Transform }]
        };
        return (
            <View style={styles.numberContainer}>
                <Animated.Text style={[styles.number, animatedStyle]}>3</Animated.Text>
            </View>
        );
    }

    private get number2 (): JSX.Element {
        const { anim2Opacity, anim2Transform } = this.state;
        const animatedStyle = {
            opacity: anim2Opacity.interpolate(this.opacityInterpolation),
            transform: [{ scale: anim2Transform }]
        };
        return (
            <View style={styles.numberContainer}>
                <Animated.Text style={[styles.number, animatedStyle]}>2</Animated.Text>
            </View>
        );
    }

    private get number1 (): JSX.Element {
        const { anim1Opacity, anim1Transform } = this.state;
        const animatedStyle = {
            opacity: anim1Opacity.interpolate(this.opacityInterpolation),
            transform: [{ scale: anim1Transform }]
        };
        return (
            <View style={styles.numberContainer}>
                <Animated.Text style={[styles.number, animatedStyle]}>1</Animated.Text>
            </View>
        );
    }

    private get go (): JSX.Element {
        const { animLabelOpacity, animLabelTransform } = this.state;
        const animatedStyle = {
            opacity: animLabelOpacity.interpolate(this.opacityInterpolation),
            transform: [{ scale: animLabelTransform }]
        };
        return (
            <View style={styles.numberContainer}>
                <Animated.Text style={[styles.number, styles.label, animatedStyle]}>{ i18n.t('global.go') }</Animated.Text>
            </View>
        );
    }

    public render (): JSX.Element {
        const { animGlobalOpacity, touchThrough } = this.state;
        return (
            <Animated.View
                style={[styles.fullSpace, { opacity: animGlobalOpacity }]}
                pointerEvents={touchThrough ? 'none' : 'auto'}
            >
                { this.sounds }
                <BlurWrapper
                    type={'vibrancy'}
                    blurType={'xlight'}
                    blurAmount={22}
                    blurStyle={styles.fullSpace}
                    fallbackStyle={styles.overlayBlurAndroid}
                />
                { this.shapes }
                { this.number3 }
                { this.number2 }
                { this.number1 }
                { this.go }
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    workoutSounds: state.userProfile.workoutSounds
});

export default connect(mapStateToProps, null)(WorkoutStartCountdown);
