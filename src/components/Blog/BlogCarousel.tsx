import React, { Component, Fragment } from 'react';
import { View, ViewStyle, Animated, Easing } from 'react-native';
import { IArticle } from '../../types/article';

import Carousel, { getInputRangeFromIndexes } from 'react-native-snap-carousel';

import { ARTICLES_IN_CAROUSEL } from '../../views/Blog';
import myProgramStyles from '../../styles/components/Training/MyProgram.style';
import styles, { SLIDER_WIDTH } from '../../styles/components/Blog/BlogCarousel.style';

interface IProps {
    data: any[];
    scrollEnabled?: boolean;
    height: number;
    inverted?: boolean;
    renderItem: ({ item, index }: { item: IArticle, index: number }) => JSX.Element;
    style?: ViewStyle;
}

interface IState {
    animationOpacity: Animated.Value;
}

class BlogCarousel extends Component<IProps, IState> {

    public carouselRef: React.RefObject<any>;
    private scrollX: Animated.Value;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animationOpacity: new Animated.Value(0)
        };
        this.carouselRef = React.createRef();
        this.scrollX = new Animated.Value(0);
    }

    public componentDidMount (): void {
        this.animate(true);
    }

    public animate (animateIn?: boolean): void {
        Animated.sequence([
            Animated.timing(this.state.animationOpacity, {
                toValue: animateIn ? 1 : 0,
                duration: 250,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private scrollInterpolator (index: number, carouselProps: any): Object {
        const range = [3, 2, 1, 0, -1];
        const inputRange = getInputRangeFromIndexes(range, index, carouselProps);
        const outputRange = range;

        return { inputRange, outputRange };
    }

    private animatedStyles (index: number, animatedValue: Animated.Value, carouselProps: any): Object {
        const sizeRef = carouselProps.vertical ? carouselProps.itemHeight : carouselProps.itemWidth;
        const translateProp = carouselProps.vertical ? 'translateY' : 'translateX';

        return {
            zIndex: carouselProps.data.length - index,
            opacity: animatedValue.interpolate({
                inputRange: [2, 3],
                outputRange: [1, 0]
            }),
            transform: [{
                rotate: animatedValue.interpolate({
                    inputRange: [-1, 0, 1, 2, 3],
                    outputRange: ['-25deg', '0deg', '-3deg', '1.8deg', '0deg'],
                    extrapolate: 'clamp'
                })
            }, {
                [translateProp]: animatedValue.interpolate({
                    inputRange: [-1, 0, 1, 2, 3],
                    outputRange: [
                        -sizeRef * 0.5,
                        0,
                        -sizeRef, // centered
                        -sizeRef * 2, // centered
                        -sizeRef * 3 // centered
                    ],
                    extrapolate: 'clamp'
                })
            }]
        };
    }

    private get bullets (): JSX.Element {
        const { data } = this.props;

        if (!data) {
            return null;
        }

        const position = Animated.divide(this.scrollX, SLIDER_WIDTH);

        const bullets = data.map((_: IArticle, index: number) => {
            const opacity = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [0, 1, 0],
                extrapolate: 'clamp'
            });

            return (
                <View key={`shared-carousel-bullet-${index}`} style={myProgramStyles.scrollViewBulletContainer}>
                    <Animated.View style={[myProgramStyles.scrollViewBullet, { opacity }]} />
                </View>
            );
        });

        return (
            <View style={[myProgramStyles.scrollViewBulletWrapper, styles.scrollViewBulletWrapper]}>
                <View style={myProgramStyles.scrollViewBulletWrapperInner}>
                    <Fragment>{bullets}</Fragment>
                </View>
            </View>
        );
    }

    public render (): JSX.Element {
        const { height, inverted, style, data, renderItem, scrollEnabled } = this.props;

        const animatedStyles = {
            opacity: this.state.animationOpacity
        };

        const containerStyles = [
            styles.container,
            { height },
            style
        ];

        const carouselSpecificProps: any = inverted ? {
            layout: 'stack',
            layoutCardOffset: 10,
            firstItem: ARTICLES_IN_CAROUSEL - 1
        } : {
            contentContainerCustomStyle: styles.carousel,
            scrollInterpolator: this.scrollInterpolator,
            slideInterpolatedStyle: this.animatedStyles
        };

        return (
            <View style={containerStyles}>
                <View style={styles.carouselContainer}>
                    <Animated.View style={animatedStyles}>
                        <Carousel
                            { ...carouselSpecificProps }
                            containerCustomStyle={styles.carousel}
                            data={data}
                            disableIntervalMomentum={true}
                            itemWidth={SLIDER_WIDTH}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { x: this.scrollX }}}],
                                { useNativeDriver: true }
                            )}
                            ref={this.carouselRef}
                            renderItem={renderItem}
                            scrollEnabled={scrollEnabled}
                            sliderWidth={SLIDER_WIDTH}
                            useExperimentalSnap={true}
                            useScrollView={true}
                        />
                    </Animated.View>
                </View>
                { this.bullets }
            </View>
        );
    }
}

export default BlogCarousel;
