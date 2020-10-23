import React, { Component } from 'react';
import { View, Animated, Easing, Text, Image, Alert } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import { updateOnboardingStep, OnboardingSteps } from '../../store/modules/onboarding';
import { setCurrentInfluencer } from '../../store/modules/influencers';
import { setProgressionData, IProgressionState } from '../../store/modules/progression';
import { IReduxState } from '../../store/reducers';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { IProgram } from '../../types/program';
import { IProgressionProgram } from '../../types/progression';
import { debounce, orderBy } from 'lodash';
import I18n from '../../utils/i18n';
import { isAndroid } from '../../utils/os';
import { fetchProgression, updateProgramIdByUserId, retrieveProgressionProgram, fetchProgressionProgram } from '../../utils/progression';
import { logEvent } from '../../utils/analytics';
import { IInfluencer } from '../../types/user';
import { IScreenProps } from '../../index';
import chroma from 'chroma-js';

import crashlytics from '@react-native-firebase/crashlytics';
import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';
import Program, { ProgramConfirmButton } from '../Popups/Program';
import TouchableScale from '../TouchableScale';

import { viewportHeight } from '../../styles/base/metrics.style';
import colors from '../../styles/base/colors.style';
import styles, {
    LOW_FREQUENCY_GRADIENT_COLORS,
    HIGH_FREQUENCY_GRADIENT_COLORS,
    GRADIENT_LOCATIONS
} from '../../styles/components/ProgramSelection/ProgramThumbnail.style';

interface IProps {
    activeProgramId: string;
    animate?: boolean;
    index: number;
    influencer: IInfluencer;
    isFirstOpening: boolean;
    navigation: any;
    onboardingCurrentStep: OnboardingSteps;
    program: IProgram;
    screenProps: IScreenProps;
    setCurrentInfluencer: (influencer: IInfluencer) => void;
    setProgressionData: (progression: IProgressionState) => void;
    updateOnboardingStep: (step: OnboardingSteps) => void;
    userProfileId: string;
}

interface IState {
    animationOpacity: Animated.Value;
    animationTransform: Animated.Value;
}

const DUMBBELL_ICON = require('../../static/icons/dumbbell-full-white.png');

class ProgramThumbnail extends Component<IProps, IState> {

    private colorScale: Function;
    private gradientColors: string[];

    constructor (props: IProps) {
        super(props);
        const animatedInitialValue = props.animate ? 0 : 1;
        this.state = {
            animationOpacity: new Animated.Value(animatedInitialValue),
            animationTransform: new Animated.Value(animatedInitialValue)
        };
        this.gradientColors = this.getGradientColors();
        // Needs to be called after `this.getGradientColors()`
        this.colorScale = this.getInfluencerColorScale();
    }

    public componentDidMount (): void {
        if (this.props.animate) {
            this.animateItem();
        }
    }

    private onPress = (): void => {
        this.props.screenProps?.popupManagerRef?.current?.requestPopup({
            actionButton: true,
            actionButtonParams: {
                ButtonComponent: <ProgramConfirmButton />,
                touchableScale: true,
                onPress: this.onProgramConfirm
            },
            backgroundType: 'gradient',
            ContentComponent: Program,
            ContentComponentProps: { program: this.props.program },
            height: viewportHeight * 0.8,
            overflow: true,
            scrollView: false
        });
    }

    private onProgramConfirm = async (): Promise<void> => {
        const {
            isFirstOpening,
            navigation,
            onboardingCurrentStep,
            program,
            screenProps,
            userProfileId
        } = this.props;

        const openErrorToast = () => {
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: I18n.t('app.fetchError'),
                type: 'error'
            });
        };

        let programProgression: IProgressionProgram;
        screenProps?.rootLoaderRef?.current?.open && screenProps?.rootLoaderRef?.current?.open();
        try {
            // Check in db if program progression exists
            programProgression = await fetchProgressionProgram(program.id);
            // Fetch progression in order to trigger retrieval if needed
            await fetchProgression(program?.id);
        } catch (error) {
            // Program progression does not exist, create it
            if (error?.response?.status === 404) {
                const firstWeekId = orderBy(program?.weeks, 'position', 'asc')[0].id;
                try {
                    programProgression = await retrieveProgressionProgram(program?.id, firstWeekId);
                } catch (error) {
                    console.log(error?.response);
                    openErrorToast();
                    screenProps?.rootLoaderRef?.current?.close();
                    return;
                }
            }
        }

        if (programProgression) {
            try {
                // Update active program in db
                await updateProgramIdByUserId(program?.id, userProfileId);
                // Update Redux store
                await fetchProgression(program?.id);
                // Update active influencer depending on program selection
                this.props.setCurrentInfluencer(program?.author);

                // Update onboarding Step
                if (onboardingCurrentStep !== OnboardingSteps.Done) {
                    this.props.updateOnboardingStep(OnboardingSteps.Done);
                }
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'Training', params: { isFirstOpening } })]
                });
                navigation?.dispatch && navigation?.dispatch(resetAction);

                logEvent('program_selection_choice', {
                    influencerId: program?.author?.id,
                    influencerFirstName: program?.author?.firstName,
                    programId: program?.id,
                    programTitle: program?.title
                });
            } catch (error) {
                Alert.alert(I18n.t('app.fetchErrorTitle'), I18n.t('app.fetchError'));
                crashlytics().recordError(error);
            }
        } else {
            Alert.alert(I18n.t('app.fetchErrorTitle'), I18n.t('app.fetchError'));
            crashlytics().recordError(new Error('Undefined programProgression in ProgramThumbnail onProgramConfirm()'));
        }
        screenProps?.rootLoaderRef?.current?.close && screenProps?.rootLoaderRef?.current?.close();
    }

    private animateItem (): void {
        const { animationOpacity, animationTransform } = this.state;
        const cappedIndex = Math.abs(this.props.index % 10);
        const delay = cappedIndex * 120;

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animationOpacity, {
                    toValue: 1,
                    duration: 120,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animationTransform, {
                    toValue: 1,
                    speed: 13,
                    bounciness: 6,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private shouldRenderActiveOverlay (): boolean {
        const { activeProgramId, program, influencer } = this.props;
        return activeProgramId === program?.id && !!influencer?.primaryColor && !!influencer?.secondaryColor;
    }

    private getInfluencerColorScale (): Function {
        const { influencer } = this.props;
        return influencer?.primaryColor && influencer?.secondaryColor ?
            chroma.scale([influencer.primaryColor, influencer.secondaryColor]) :
            chroma.scale(this.gradientColors);
    }

    private getTintColor (): string {
        if (this.shouldRenderActiveOverlay()) {
            return this.colorScale(0.5).luminance() > 0.55 ? colors.grayBlueDark : colors.white;
        } else {
            return colors.white;
        }
    }

    private getGradientColors (): string[] {
        const { program } = this.props;
        const frequencyString = program?.frequency;
        const highestFrequency = !frequencyString ? 1 : parseInt(frequencyString.charAt(frequencyString.length - 1), 10);
        return highestFrequency > 3 ? HIGH_FREQUENCY_GRADIENT_COLORS : LOW_FREQUENCY_GRADIENT_COLORS;
    }

    private get gradientOverlay (): JSX.Element {
        const { influencer } = this.props;
        if (this.shouldRenderActiveOverlay()) {
            const gradientColors = [
                chroma(influencer.primaryColor).alpha(0.85).css(),
                chroma(influencer.secondaryColor).alpha(0.85).css()
            ];
            const style = [
                styles.fullSpace,
                styles.gradientOverlayActive,
                { borderColor: this.colorScale(0.55) }
            ];
            return (
                <LinearGradient
                    angle={160}
                    colors={gradientColors}
                    pointerEvents={'none'}
                    style={style}
                    useAngle={true}
                />
            );
        } else {
            return (
                <LinearGradient
                    colors={this.gradientColors}
                    locations={GRADIENT_LOCATIONS}
                    pointerEvents={'none'}
                    style={[styles.fullSpace, styles.gradientOverlay]}
                />
            );
        }
    }

    private get level (): JSX.Element {
        let icons: JSX.Element[] = [];
        for (let i = 0; i < this.props.program.level; i++) {
            icons.push(
                <Image
                    key={`program-thumbnail-${this.props.index}-level-icon-${i}`}
                    source={DUMBBELL_ICON}
                    style={[styles.levelIcon, { tintColor: this.getTintColor() }]}
                />
            );
        }

        return (
            <View style={styles.level}>
                <Text style={[styles.levelText, { color: this.getTintColor() }]}>
                    { I18n.t('programSelection.level') }
                </Text>
                <View style={styles.levelIconContainer}>
                    { icons }
                </View>
            </View>
        );
    }

    public render (): JSX.Element {
        const { animationOpacity, animationTransform } = this.state;
        const { program, animate } = this.props;
        const gradientColors = this.gradientColors;
        const animatedStyle = {
            opacity: animationOpacity,
            transform: [
                {
                    translateX: animationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [75, 0]
                    })
                }
            ]
        };
        const imageContainerInnerStyle: any[] = [
            styles.imageContainerInner,
            { backgroundColor: chroma(gradientColors[gradientColors.length - 1]).alpha(1).css() }
        ];

        return (
            <Animated.View style={[animatedStyle, styles.container]}>
                <TouchableScale
                    onPress={debounce(this.onPress, 500, { 'leading': true, 'trailing': false })}
                    containerStyle={styles.touchableOpacity}
                    style={styles.touchableOpacityInner}
                >
                    <View style={styles.border} />
                    <View style={styles.imageContainer}>
                        <DiffuseShadow
                            style={styles.diffuseShadow}
                            horizontalOffset={20}
                            verticalOffset={14}
                            borderRadius={20}
                            shadowOpacity={0.25}
                        />
                        <View style={imageContainerInnerStyle}>
                            <FadeInImage
                                containerCustomStyle={styles.image}
                                source={{ uri: program?.image?.thumbnailUrl }}
                                disableAnimation={!animate}
                                initialZoom={isAndroid ? undefined : (animate ? 1.4 : 1)}
                                zoomDuration={isAndroid ? undefined : 5000}
                            />
                            <View style={styles.imageOverlay}>
                                { this.gradientOverlay }
                                <View style={styles.titleContainer}>
                                    <Text numberOfLines={3} style={[styles.title, { color: this.getTintColor() }]}>
                                        { program?.title }
                                    </Text>
                                </View>
                                { this.level }
                            </View>
                        </View>
                    </View>
                </TouchableScale>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    onboardingCurrentStep: state.onboarding?.currentStep,
    userProfileId: state.userProfile?.id,
    activeProgramId: state.progression?.program?.id
});

export default withNavigation(
    connect(mapStateToProps, { setCurrentInfluencer, setProgressionData, updateOnboardingStep })
    (ProgramThumbnail)
);
