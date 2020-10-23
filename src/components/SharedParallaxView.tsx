import React, { PureComponent } from 'react';
import { View, FlatListProps, Animated, FlatList, ScrollView, StyleSheet, ScrollViewProps } from 'react-native';

interface IProps extends ScrollViewProps, FlatListProps<any> {
    flatlist?: boolean;
    params?: any;
    onScrollThresholdReached?: (passed: boolean) => void;
    renderBackground?: (options: {}, params?: any) => JSX.Element;
    renderForeground?: (options: {}, params?: any) => JSX.Element;
    renderScrollViewBackgroundChild?: (options: {}, params?: any) => JSX.Element;
    renderScrollViewForegroundChild?: (options: {}, params?: any) => JSX.Element;
    scrollThreshold?: number;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default class SharedParallaxView extends PureComponent<IProps, {}> {

    public static defaultProps: IProps = {
        renderBackground: null,
        renderForeground: null,
        renderScrollViewBackgroundChild: null,
        data: null,
        renderItem: null
    };

    public onAnimatedScroll: () => void;
    public hasReachedMinHeight: boolean = false;
    public scrollAnimatedValue: Animated.Value = new Animated.Value(0);
    public scrollPosition: number = 0;
    public scrollThresholdPassed: boolean = false;
    public flatListRef: React.RefObject<FlatList<any>> = React.createRef();
    public scrollViewRef: React.RefObject<ScrollView> = React.createRef();

    constructor (props: IProps) {
        super(props);
        const key = props.horizontal ? 'x' : 'y';
        this.onAnimatedScroll = Animated.event(
            [{ nativeEvent: { contentOffset: { [key]: this.scrollAnimatedValue } } }],
            {
                listener: this.onScroll,
                useNativeDriver: true
            }
        );
    }

    public getScrollNode = (): any => {
        const { flatlist } = this.props;
        const ref = flatlist ? this.flatListRef : this.scrollViewRef;
        // `getNode()` seems to have an issue with its own `this` reference
        // const getNode = get(ref, 'current.getNode');
        return ref.current;
    }

    // Use this for ScrollView
    public scrollTo = ({ x, y, animated }: { x?: number; y?: number; animated?: boolean }): void => {
        const node = this.getScrollNode();
        if (!node || !node.scrollTo) {
            return;
        }
        node.scrollTo({
            x: x || 0,
            y: y || 0,
            animated: typeof animated !== 'undefined' ? animated : true
        });
    }

    // Use this for FlatList
    public scrollToOffset = ({ offset, animated }: { offset: number; animated?: boolean }): void => {
        const node = this.getScrollNode();
        if (!node || !node.scrollToOffset) {
            return;
        }
        node.scrollToOffset({
            offset,
            animated: typeof animated !== 'undefined' ? animated : true
        });
    }

    // Use this for FlatList
    public scrollToIndex = ({ index, animated }: { index: number; animated?: boolean }): void => {
        const node = this.getScrollNode();
        if (!node || !node.scrollToIndex) {
            return;
        }
        node.scrollToIndex({
            index,
            animated: typeof animated !== 'undefined' ? animated : true
        });
    }

    public onScroll = (event: any) => {
        const { horizontal, onScroll, onScrollThresholdReached, scrollThreshold } = this.props;
        const scrollPosition = event.nativeEvent.contentOffset[horizontal ? 'x' : 'y'];

        this.scrollPosition = scrollPosition;

        if (!!scrollThreshold && !!onScrollThresholdReached) {
            const thresholdPassed = scrollPosition >= scrollThreshold;
            if (thresholdPassed !== this.scrollThresholdPassed) {
                this.scrollThresholdPassed = thresholdPassed;
                onScrollThresholdReached(thresholdPassed);
            }
        }

        if (onScroll) {
            onScroll(event);
        }
    }

    public triggerForceUpdate = (): void => {
        this.forceUpdate();
    }

    private get background (): JSX.Element {
        const { params, renderBackground } = this.props;

        if (!renderBackground) {
            return null;
        }

        return (
            <View style={{...StyleSheet.absoluteFillObject}} pointerEvents={'box-none'}>
                { renderBackground({ animatedValue: this.scrollAnimatedValue }, params) }
            </View>
        );
    }

    private get scrollViewBackgroundChild (): JSX.Element {
        const { params, renderScrollViewBackgroundChild } = this.props;

        if (!renderScrollViewBackgroundChild) {
            return null;
        }

        return renderScrollViewBackgroundChild({ animatedValue: this.scrollAnimatedValue }, params);
    }

    private get scrollViewForeroundChild (): JSX.Element {
        const { params, renderScrollViewForegroundChild } = this.props;

        if (!renderScrollViewForegroundChild) {
            return null;
        }

        return renderScrollViewForegroundChild({ animatedValue: this.scrollAnimatedValue }, params);
    }

    private get foreground (): JSX.Element {
        const { params, renderForeground } = this.props;

        if (!renderForeground) {
            return null;
        }

        return (
            <View style={{...StyleSheet.absoluteFillObject}} pointerEvents={'box-none'}>
                { renderForeground({ animatedValue: this.scrollAnimatedValue }, params) }
            </View>
        );
    }

    private get scrollView (): JSX.Element {
        const {
            children,
            ...scrollViewProps
        } = this.props;

        return (
            <AnimatedScrollView
                overScrollMode={'never'}
                pinchGestureEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                {...scrollViewProps}
                ref={this.scrollViewRef}
                onScroll={this.onAnimatedScroll}
                scrollEventThrottle={1}
            >
                { this.scrollViewBackgroundChild }
                { children }
                { this.scrollViewForeroundChild }
            </AnimatedScrollView>
        );
    }

    private get flatList (): JSX.Element {
        const {
            children,
            ...flatListProps
        } = this.props;

        return (
            <AnimatedFlatList
                overScrollMode={'never'}
                pinchGestureEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                {...flatListProps}
                ref={this.flatListRef}
                onScroll={this.onAnimatedScroll}
                scrollEventThrottle={1}
            />
        );
    }

    public render (): JSX.Element {
        return (
            <View style={{flex: 1}}>
                { this.background }
                { this.props.flatlist ? this.flatList : this.scrollView }
                { this.foreground }
            </View>
        );
    }
}
