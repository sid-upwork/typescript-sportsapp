import React, { Component } from 'react';
import { View, Text, Animated, Easing, ScrollView } from 'react-native';
import chroma from 'chroma-js';
import { ENDPOINTS } from '../../utils/endpoints';
import { IWorkout } from '../../types/workout';
import { IScreenProps } from '../../index';
import { logEvent } from '../../utils/analytics';
import { orderSets } from '../../utils/workout';
import api from '../../utils/api';
import delays from '../../utils/animDelays';
import I18n from '../../utils/i18n';

import Loader from '../../components/Loader';
import SharedVerticalTitle from '../../components/SharedVerticalTitle';
import TargetedTrainingEntry from '../../components/Training/TargetedTrainingEntry';
import TargetedTrainingItem from '../../components/Training/TargetedTrainingItem';
import ErrorMessage from '../../components/ErrorMessage';

import colors from '../../styles/base/colors.style';
import styles, { TITLE_WIDTH } from '../../styles/components/Popups/TargetedTraining.style';
import LinearGradient from 'react-native-linear-gradient';

interface IProps {
    dismissPopup: () => void;
    navigation: any;
    targetedTraining: TargetedTrainingItem;
    screenProps: IScreenProps;
}

interface IState {
    fetchError: boolean;
    labelAnimationOpacity: Animated.Value;
    labelAnimationTransform: Animated.Value;
    loading: boolean;
    textAnimationOpacity: Animated.Value;
    textAnimationTransform: Animated.Value;
    workouts: IWorkout[];
    workoutsCount: number;
}

class TargetedTraining extends Component<IProps, IState> {

    private mounted: boolean = false;
    private timeout: any;

    constructor (props: IProps) {
        super(props);
        this.state = {
            fetchError: false,
            labelAnimationOpacity: new Animated.Value(0),
            labelAnimationTransform: new Animated.Value(0),
            loading: false,
            textAnimationOpacity: new Animated.Value(0),
            textAnimationTransform: new Animated.Value(0),
            workouts: [],
            workoutsCount: 0
        };
        this.timeout;
    }

    public componentDidMount (): void {
        this.mounted = true;
        this.animateLabel();
        this.animateText();
        this.fetch();

        switch (this.props.targetedTraining?.id) {
            case 'abs':
                logEvent('targeted_training_popup_abs_display');
                break;
            case 'lower body':
                logEvent('targeted_training_popup_lower_display');
                break;
            case 'upper body':
                logEvent('targeted_training_popup_upper_display');
                break;
            default:
                break;
        }
    }

    private fetch = async () => {
        const { targetedTraining } = this.props;
        this.setState({ loading: true });
        try {
            const slug = targetedTraining?.slug;
            if (!slug) {
                throw `Missing slug for ${targetedTraining?.title}`;
            }
            const workoutsData = await api.get(ENDPOINTS.workoutLists + `/slug/${slug}`);
            let workouts = workoutsData?.data?.workouts;
            if (!workouts) {
                throw 'No workouts available';
            }
            workouts = orderSets(workouts);
            if (!this.mounted) {
                return;
            }
            this.setState({
                loading: false,
                workouts,
                workoutsCount: workouts.length
            });
        } catch (error) {
            this.setState({ fetchError: true, loading: false });
        }
    }

    private retryFetch = () => {
        this.setState({ fetchError: false }, () => {
            this.fetch();
        });
    }

    private animateLabel (): void {
        const { labelAnimationOpacity, labelAnimationTransform } = this.state;
        Animated.sequence([
            Animated.delay(delays.views.targetedTraining.labelApparition),
            Animated.parallel([
                Animated.timing(labelAnimationOpacity, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(labelAnimationTransform, {
                    toValue: 1,
                    speed: 12,
                    bounciness: 6,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateText (): void {
        const { textAnimationOpacity, textAnimationTransform } = this.state;
        Animated.sequence([
            Animated.delay(delays.views.targetedTraining.textApparition),
            Animated.parallel([
                Animated.timing(textAnimationOpacity, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(textAnimationTransform, {
                    toValue: 1,
                    speed: 14,
                    bounciness: 3,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private get label (): JSX.Element {
        const { labelAnimationOpacity, labelAnimationTransform } = this.state;

        const labelContainerStyle = [
            styles.labelContainer,
            {
                opacity: labelAnimationOpacity,
                transform: [
                    {
                        translateY: labelAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-70, 0]
                        })
                    }
                ]
            }
        ];

        return (
            <Animated.View style={labelContainerStyle}>
                <SharedVerticalTitle
                    height={250}
                    textStyle={styles.label}
                    title={this.props.targetedTraining.title}
                    width={TITLE_WIDTH}
                />
            </Animated.View>
        );
    }

    private get loader (): JSX.Element {
        return (
            <Loader
                color={colors.violetDark}
                containerType={'flex'}
                withContainer={true}
            />
        );
    }

    private get error (): JSX.Element {
        return (
            <ErrorMessage
                retry={this.retryFetch}
                toastManagerRef={this.props.screenProps?.toastManagerRef}
            />
        );
    }

    private get listState (): JSX.Element {
        const { loading, fetchError, workoutsCount } = this.state;
        let content;
        if (fetchError || loading) {
            // Loading or API error
            content = fetchError ? this.error : this.loader;
        } else if (workoutsCount * 1 === 0) {
            // No workout returned
            content = (
                <ErrorMessage
                    containerStyle={styles.noItemContainer}
                    containerInnerStyle={styles.noItemContainerInner}
                    message={I18n.t('training.targetedTraining.workoutsCount.zero')}
                    textStyle={styles.noItemText}
                />
            );
        }
        return content ? (
            <View style={styles.fullSpace}>
                { content }
            </View>
        ) : null;
    }

    private get header (): JSX.Element {
        const { targetedTraining } = this.props;
        const { textAnimationOpacity, textAnimationTransform, workoutsCount } = this.state;

        const title = workoutsCount ?
            I18n.t('training.targetedTraining.workoutsCount', { count: workoutsCount * 1 }) : // multiply to force integer
            I18n.t('training.targetedTraining.workoutsCount.other', { count: '-'});
        // const areas: string = targetedTraining.getAreasString();

        const headerAnimatedStyle = {
            opacity: textAnimationOpacity,
            transform: [{
                translateY: textAnimationTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [70, 0]
                })
            }]
        };

        return (
            <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
                {/* <Text style={styles.workoutAreas}>{areas}</Text> */}
                <Text style={styles.title}>{title}</Text>
            </Animated.View>
        );
    }

    private get items (): JSX.Element | JSX.Element[] {
        const { workouts } = this.state;
        if (!workouts || !workouts.length) {
            return null;
        }
        const items = workouts.map((workout: IWorkout, index: number) => {
            return (
                <TargetedTrainingEntry
                    dismissPopup={this.props.dismissPopup}
                    targetedTrainingId={this.props.targetedTraining.id}
                    index={index}
                    key={`targeted-training-item-${index}`}
                    navigation={this.props.navigation}
                    workout={workout}
                />
            );
        });
        return items;
    }

    private get list (): JSX.Element {
        return (
            <View style={styles.listWrapper}>
                <ScrollView
                    overScrollMode={'never'}
                    pinchGestureEnabled={false}
                    showsVerticalScrollIndicator={false}
                >
                    { this.header }
                    { this.items }
                </ScrollView>
                <LinearGradient
                    colors={[chroma(colors.orangeDark).alpha(1).css(), chroma(colors.orangeDark).alpha(0).css()]}
                    locations={[0, 1]}
                    pointerEvents={'none'}
                    style={styles.topGradient}
                />
                <LinearGradient
                    colors={[chroma(colors.pink).alpha(0).css(), chroma(colors.pink).alpha(1).css()]}
                    locations={[0, 1]}
                    pointerEvents={'none'}
                    style={styles.bottomGradient}
                />
            </View>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <View style={styles.contentContainer}>
                    { this.label }
                    { this.list }
                    { this.listState }
                </View>
            </View>
        );
    }
}

export default TargetedTraining;
