import React, { PureComponent, Fragment } from 'react';
import { Animated, View } from 'react-native';

import MaskedView from '@react-native-community/masked-view';

import FadeInImage from '../../components/FadeInImage';

import { viewportWidth } from '../../styles/base/metrics.style';
import styles from '../../styles/components/Workout/WorkoutExerciseImage.style';

interface IProps {
    hide: boolean;
    hScrollInputRange: number[];
    hScrollValue: Animated.Value;
    last: boolean;
    source: string;
}

interface IState {
}

class WorkoutExerciseImage extends PureComponent<IProps, IState> {

    private get imageSimpleAnimation (): JSX.Element {
        const { hScrollInputRange, hScrollValue, source } = this.props;
        const hScrollAnimatedStyle = hScrollInputRange && hScrollValue ? {
            transform: [
                {
                    translateX: hScrollValue.interpolate({
                        inputRange: hScrollInputRange,
                        outputRange: [viewportWidth, 0, -viewportWidth],
                        extrapolate: 'clamp'
                    })
                }
            ]
        } : {};
        return (
            <Animated.View style={[styles.fullSpace, hScrollAnimatedStyle]}>
                <FadeInImage
                    source={{ uri: source }}
                    containerCustomStyle={styles.fullSpace}
                    disableAnimation={true}
                />
            </Animated.View>
        );
    }

    private get imageFadeAnimation (): JSX.Element {
        const { hScrollInputRange, hScrollValue, last, source } = this.props;
        const hScrollAnimatedStyle = hScrollInputRange && hScrollValue ? {
            opacity: hScrollValue.interpolate({
                inputRange: hScrollInputRange,
                outputRange: [0, 1, last ? 0 : 1],
                extrapolate: 'clamp'
            })
        } : {};

        let lastItemUnderlay = null;
        if (last) {
            const underlayAnimatedStyle = hScrollInputRange && hScrollValue ? {
                opacity: hScrollValue.interpolate({
                    inputRange: hScrollInputRange,
                    outputRange: [0, 1, 1],
                    extrapolate: 'clamp'
                })
            } : {};
            lastItemUnderlay = <Animated.View style={[styles.fullSpace, styles.underlay, underlayAnimatedStyle]} />;
        }

        return (
            <Fragment>
                { lastItemUnderlay }
                <Animated.View style={[styles.fullSpace, hScrollAnimatedStyle]}>
                    <FadeInImage
                        source={{ uri: source }}
                        containerCustomStyle={styles.fullSpace}
                    />
                </Animated.View>
            </Fragment>
        );
    }

    private get imageMaskAnimation (): JSX.Element {
        const { hScrollInputRange, hScrollValue, source } = this.props;
        const hScrollAnimatedStyle = hScrollInputRange && hScrollValue ? {
            transform: [
                {
                    translateX: hScrollValue.interpolate({
                        inputRange: hScrollInputRange,
                        outputRange: [-viewportWidth, 0, viewportWidth],
                        extrapolate: 'clamp'
                    })
                }
            ]
        } : {};

        // Mask, SVG version: https://github.com/react-native-community/react-native-svg/issues/180#issuecomment-370276714
        // Drawback: needs to use the Image component from react-native-svg
        // Mask, native version: https://github.com/react-native-community/react-native-masked-view
        // Drawback: apparent issues with animation on Android
        const mask = (
            <Animated.View style={[styles.fullSpace, { backgroundColor: 'black'}, hScrollAnimatedStyle]} />
        );

        return (
            <MaskedView style={styles.fullSpace} maskElement={mask}>
                <FadeInImage
                    source={{ uri: source }}
                    containerCustomStyle={styles.fullSpace}
                    disableAnimation={true}
                />
            </MaskedView>
        );
    }

    public render (): JSX.Element {
        const { source, hide } = this.props;
        return source && !hide ? (
            <View style={[styles.fullSpace, styles.container]}>
                { this.imageFadeAnimation }
            </View>
        ) : null;
    }
}

export default WorkoutExerciseImage;
