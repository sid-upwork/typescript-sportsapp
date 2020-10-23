import React, { PureComponent } from 'react';
import { View, Animated, Easing } from 'react-native';
import delays from '../../utils/animDelays';

import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from '../DiffuseShadow';
import Loader from '../Loader';

import styles, {
    PLACEHOLDER_GRADIENT,
    PLACEHOLDER_GRADIENT_VARIANT,
    DIFFUSE_SHADOW_COLOR,
    DIFFUSE_SHADOW_OPACITY,
    DIFFUSE_SHADOW_BORDER_RADIUS,
    DIFFUSE_SHADOW_VERTICAL_OFFSET,
    DIFFUSE_SHADOW_HORIZONTAL_OFFSET
} from '../../styles/components/Training/MyProgramEntry.style';

interface IProps {
    animated?: boolean;
    index: number;
}

interface IState {
    animPlaceholderOpacity: Animated.Value;
    animOpacity: Animated.Value;
}

export default class MyProgramFakeEntry extends PureComponent<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animPlaceholderOpacity: new Animated.Value(0),
            animOpacity: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animate();
        this.animatePlaceholder();
    }

    public componentDidUpdate (): void {
        this.animatePlaceholder();
    }

    private animate (): void {
        const { animOpacity } = this.state;
        const { index } = this.props;
        const delay = delays.views.training.myProgramItems + index * 100;

        Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animOpacity, {
                toValue: 1,
                duration: 100,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private animatePlaceholder (): void {
        if (!this.props.animated) {
            return;
        }

        const { animPlaceholderOpacity } = this.state;

        Animated.loop(
            Animated.sequence([
                Animated.timing(animPlaceholderOpacity, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.ease,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.timing(animPlaceholderOpacity, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.ease,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ).start();
    }

    private get loader (): JSX.Element {
        const { animated } = this.props;
        // WARNING: the loader clearly has performance issues -> In need of investigation
        // Just uncomment it below and comment `animatePlaceholderScrollView()` in `MyProgram.tsx` to see it in action
        return animated ? <Loader color={'#FFFFFF'} withContainer={true} /> : null;
    }

    public render (): JSX.Element {
        const { animPlaceholderOpacity, animOpacity } = this.state;
        const animatedStyle = {
            opacity: animOpacity
        };
        const animPlaceholderStyle = {
            opacity: animPlaceholderOpacity
        };

        return(
            <Animated.View style={[styles.itemContainer, animatedStyle]}>
                <View style={styles.borderContainer}>
                    <View style={styles.border} />
                </View>
                <DiffuseShadow
                    style={styles.diffuseShadow}
                    horizontalOffset={DIFFUSE_SHADOW_HORIZONTAL_OFFSET}
                    verticalOffset={DIFFUSE_SHADOW_VERTICAL_OFFSET}
                    borderRadius={DIFFUSE_SHADOW_BORDER_RADIUS}
                    shadowOpacity={DIFFUSE_SHADOW_OPACITY}
                    color={DIFFUSE_SHADOW_COLOR}
                />
                <View style={[styles.contentContainer, styles.contentContainerPlaceholder]}>
                    <LinearGradient
                        angle={150}
                        colors={PLACEHOLDER_GRADIENT_VARIANT}
                        style={styles.fullSpace}
                        useAngle={true}
                    />
                    <Animated.View style={[styles.fullSpace, animPlaceholderStyle]}>
                        <LinearGradient
                            angle={150}
                            colors={PLACEHOLDER_GRADIENT}
                            style={styles.fullSpace}
                            useAngle={true}
                        />
                    </Animated.View>
                    {/* { this.loader } */}
                </View>
            </Animated.View>
        );
    }
}
