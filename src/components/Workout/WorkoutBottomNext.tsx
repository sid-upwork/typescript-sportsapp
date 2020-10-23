import React, { Component, Fragment } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import i18n from '../../utils/i18n';
import { INextExerciseData } from '../../views/Workout';
import { getCircuitType } from '../../utils/workout';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage, { ERROR_PLACEHOLDER_SOURCE } from '../FadeInImage';
import SharedVerticalTitle from '../SharedVerticalTitle';

import styles, { IMAGE_HEIGHT, COMING_UP_WIDTH } from '../../styles/components/Workout/WorkoutBottomNext.style';

interface IProps {
    animate: boolean;
    data: INextExerciseData;
}

interface IState {
    animComingUpOpacity: Animated.Value;
    animComingUpTransform: Animated.Value;
    animImageOpacity: Animated.Value;
    animImageTransform: Animated.Value;
    animTextOpacity: Animated.Value;
    animTextTransform: Animated.Value;
}

class WorkoutBottomNext extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animComingUpOpacity: new Animated.Value(1),
            animComingUpTransform: new Animated.Value(1),
            animImageOpacity: new Animated.Value(1),
            animImageTransform: new Animated.Value(1),
            animTextOpacity: new Animated.Value(1),
            animTextTransform: new Animated.Value(1)
        };
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { animate } = this.props;
        if (animate !== prevProps.animate && animate) {
            this.animate(this.props);
        }
    }

    private animate (props: IProps = this.props): void {
        const {
            animComingUpOpacity, animComingUpTransform,
            animImageOpacity, animImageTransform,
            animTextOpacity, animTextTransform
        } = this.state;
        const toValue = 1;
        const delay = 200;
        const opacityParams = {
            toValue,
            duration: 150,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue,
            speed: 15,
            bounciness: 7,
            isInteraction: false,
            useNativeDriver: true
        };

        animComingUpOpacity.setValue(0);
        animComingUpTransform.setValue(0);
        animImageOpacity.setValue(0);
        animImageTransform.setValue(0);
        animTextOpacity.setValue(0);
        animTextTransform.setValue(0);

        Animated.parallel([
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(animComingUpOpacity, opacityParams),
                    Animated.spring(animComingUpTransform, springParams)
                ])
            ]),
            Animated.sequence([
                Animated.delay(delay + 80),
                Animated.parallel([
                    Animated.timing(animImageOpacity, opacityParams),
                    Animated.spring(animImageTransform, springParams)
                ])
            ]),
            Animated.sequence([
                Animated.delay(delay + 160),
                Animated.parallel([
                    Animated.timing(animTextOpacity, opacityParams),
                    Animated.spring(animTextTransform, springParams)
                ])
            ])
        ]).start();
    }

    private get info (): JSX.Element {
        const { animTextOpacity, animTextTransform } = this.state;
        const { data } = this.props;
        const textAnimatedStyles = {
            opacity: animTextOpacity,
            transform: [{
                translateX: animTextTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [70, 0]
                })
            }]
        };
        const containerStyle = [
            styles.infoContainer,
            !data ? styles.infoContainerEmpty : {},
            textAnimatedStyles
        ];
        const content = data ? (
            <Fragment>
                <Text style={styles.circuitType} numberOfLines={1}>{ getCircuitType(data?.circuitLength) }</Text>
                <Text style={styles.title} numberOfLines={2}>{ data?.title }</Text>
                <Text style={styles.set} numberOfLines={1}>
                    { data && `${i18n.t('workout.set')} ${data?.nextSetIndex + 1}/${data?.totalSets}` }
                </Text>
            </Fragment>
        ) : (
            <Text style={styles.titleEmpty} numberOfLines={2}>
                { '⇧\n' }
                { i18n.t('workout.complete') }
            </Text>
        );
        return (
            <Animated.View style={containerStyle}>
                { content }
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        const {
            animComingUpOpacity, animComingUpTransform,
            animImageOpacity, animImageTransform,
        } = this.state;
        const { data } = this.props;
        const imageAnimatedStyles = {
            opacity: animImageOpacity,
            transform: [{
                translateX: animImageTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                })
            }]
        };
        const comingUpAnimatedStyles = {
            opacity: animComingUpOpacity,
            transform: [{
                translateX: animComingUpTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                })
            }]
        };
        const source = data?.thumbnail ? { uri: data?.thumbnail } : ERROR_PLACEHOLDER_SOURCE;
        const imageStyle = [
            styles.image,
            !data ? styles.imageEmpty : {}
        ];
        return (
            <View style={styles.container}>
                <View style={styles.imageWrapper}>
                    <Animated.View style={comingUpAnimatedStyles}>
                        <SharedVerticalTitle
                            height={IMAGE_HEIGHT}
                            textStyle={styles.comingUpLabel}
                            title={i18n.t('workout.comingUp')}
                            width={COMING_UP_WIDTH}
                        />
                    </Animated.View>
                    <Animated.View style={[styles.imageContainer, imageAnimatedStyles]}>
                        <DiffuseShadow
                            borderRadius={styles.image.borderRadius}
                            horizontalOffset={18}
                            shadowOpacity={0.22}
                            verticalOffset={9}
                        />
                        <FadeInImage
                            source={source}
                            containerCustomStyle={imageStyle}
                            imageStyle={imageStyle}
                            duration={300}
                            loader={'none'}
                        />
                    </Animated.View>
                </View>
                { this.info }
            </View>
        );
    }
}

export default WorkoutBottomNext;
