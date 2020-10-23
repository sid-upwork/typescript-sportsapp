import React, { Component, Fragment } from 'react';
import { View, Animated, Easing, Text } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import crashlytics from '@react-native-firebase/crashlytics';
import { IReduxState } from '../../store/reducers';
import { IProgressionState, setOpenProgressionProgramPopup } from '../../store/modules/progression';
import { fetchProgressionProgram, goToWeekPosition, resetProgressionProgram, refreshProgression } from '../../utils/progression';
import { confirmPopup } from '../../utils/confirmPopup';
import i18n from '../../utils/i18n';
import { IProgressionProgram } from '../../types/progression';
import { IScreenProps } from '../../index';

import Confetti from 'react-native-confetti';

import ErrorMessage from '../ErrorMessage';
import FadeInImage from '../FadeInImage';
import Loader from '../Loader';
import ProgressBar from '../ProgressBar';
import SharedButton from '../SharedButton';

import colors from '../../styles/base/colors.style';
import styles, { PROGRESSION_COLOR, BASE_COLOR } from '../../styles/components/Popups/ProgramProgression.style';

const ICON_MEDAL = require('../../static/icons/medal.png');
const ICON_TROPHY = require('../../static/icons/trophy.png');

interface IProps {
    dismissPopup: () => void;
    navigation: any;
    progression: IProgressionState;
    setOpenProgressionProgramPopup: (openProgressionProgramPopup: boolean) => void;
    screenProps: IScreenProps;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
    fetchError: boolean;
    loading: boolean;
    progressionProgram: IProgressionProgram;
    updating: boolean;
}

class ProgramProgression extends Component<IProps, IState> {

    private confettiRef: React.RefObject<Confetti>;
    private mounted: boolean = false;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransform: new Animated.Value(0),
            fetchError: false,
            loading: false,
            progressionProgram: undefined,
            updating: false
        };
        this.confettiRef = React.createRef();
    }

    public componentDidMount (): void {
        this.mounted = true;
        this.fetch();
    }

    public componentWillUnmount (): void {
        this.mounted = false;
        const { progression } = this.props;
        if (progression?.openProgressionProgramPopup) {
            this.props.setOpenProgressionProgramPopup(false);
        }
    }

    private animate = (): void => {
        const { animOpacity, animTransform } = this.state;
        const opacityParams = {
            toValue: 1,
            duration: 250,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue: 1,
            speed: 10,
            bounciness: 5,
            isInteraction: false,
            useNativeDriver: true
        };
        Animated.parallel([
            Animated.timing(animOpacity, opacityParams),
            Animated.spring(animTransform, springParams)
        ]).start(() => {
            this.confettiRef?.current?.startConfetti();
        });
    }

    private fetch = async (): Promise<void> => {
        const { progression } = this.props;
        if (this.mounted) {
            this.setState({ loading: true });
        }
        try {
            const progressionProgram = await fetchProgressionProgram(progression.program.id);
            if (this.mounted) {
                this.setState({
                    fetchError: false,
                    loading: false,
                    progressionProgram
                }, this.animate);
            }
        } catch (error) {
            if (this.mounted) {
                this.setState({ fetchError: true, loading: false });
            }
            console.log(error);
        }
    }

    private goToWeek = async (position: number): Promise<void> => {
        const { dismissPopup, screenProps } = this.props;
        let response: boolean = false;
        try {
            if (this.mounted) {
                this.setState({ updating: true });
            }
            response = await goToWeekPosition(position);
        } catch (error) {
            console.log(error);
        } finally {
            if (this.mounted) {
                this.setState({ updating: false }, () => {
                    if (response) {
                        dismissPopup && dismissPopup();
                    } else {
                        screenProps?.toastManagerRef?.current?.openToast &&
                        screenProps?.toastManagerRef?.current?.openToast({
                            message: i18n.t('app.fetchError'),
                            type: 'error'
                        });
                    }
                });
            }
        }
    }

    private onPressResetProgram = (): void => {
        const { screenProps } = this.props;
        const { progressionProgram } = this.state;
        confirmPopup(async () => {
            let resetSuccessful: boolean = false;
            try {
                this.setState({ updating: true });
                screenProps?.toastManagerRef?.current?.openToast({
                    message: i18n.t('app.toastUpdateMessage'),
                    type: 'info'
                });
                resetSuccessful = await resetProgressionProgram(progressionProgram);
                if (resetSuccessful) {
                    screenProps?.toastManagerRef?.current?.openToast({
                        message: i18n.t('app.toastUpdateSuccessMessage'),
                        type: 'info'
                    });
                    // refresh progression
                    refreshProgression();
                    this.props.dismissPopup();
                } else {
                    screenProps?.toastManagerRef?.current?.openToast({
                        close: () => null,
                        message: i18n.t('app.fetchError'),
                        type: 'error'
                    });
                }
            } catch (error) {
                crashlytics().recordError(error);
                screenProps?.toastManagerRef?.current?.openToast({
                    close: () => null,
                    message: i18n.t('app.fetchError'),
                    type: 'error'
                });
                console.log(error);
            } finally {
                this.setState({ updating: false });
            }
        });
    }

    private goToProgramSelection = (): void => {
        const { dismissPopup, navigation } = this.props;
        dismissPopup && dismissPopup();
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'ProgramSelectionModal' })]
        });
        navigation?.dispatch(resetAction);
    }

    private get popupState (): JSX.Element {
        const { screenProps } = this.props;
        const { fetchError, loading } = this.state;
        let content = null;
        if (loading) {
            content = (
                <Loader
                    color={BASE_COLOR}
                    withContainer={true}
                />
            );
        } else if (fetchError) {
            content = (
                <ErrorMessage
                    message={i18n.t('app.fetchErrorRetry')}
                    retry={this.fetch}
                    toastManagerRef={screenProps?.toastManagerRef}
                />
            );
        }
        return content ? (
            <View style={styles.popupStateContainer}>
                { content }
            </View>
        ) : null;
    }

    private get content (): JSX.Element {
        const { progression } = this.props;
        const { animOpacity, animTransform, fetchError, loading, progressionProgram } = this.state;

        if (!progressionProgram) {
            return;
        }

        if (fetchError || loading) {
            return this.popupState;
        }

        const animatedStyle = {
            opacity: animOpacity,
            transform: [
                {
                    translateY: animTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [350, 0]
                    })
                }
            ]
        };

        let percentage = 0;
        let title = null;
        let subtitle = null;
        let icon = null;
        let progressContent = null;
        let buttons = null;
        if (progressionProgram?.weeks === progressionProgram?.weeksDone) {
            title = i18n.t('programProgression.titleProgram');
            subtitle = i18n.t('programProgression.programFinished');
            icon = ICON_TROPHY;
            percentage = 100;
            buttons = (
                <View style={styles.buttonsContainer}>
                    <SharedButton
                        color={'pink'}
                        onPress={this.goToProgramSelection}
                        style={styles.button}
                        text={i18n.t('programSelection.chooseYourProgram')}
                        textStyle={styles.buttonText}
                    />
                    <SharedButton
                        color={'blue'}
                        onPress={this.onPressResetProgram}
                        style={styles.button}
                        text={i18n.t('programProgression.backToTheFirstWeek')}
                        textStyle={styles.buttonText}
                    />
                </View>
            );
        } else {
            title = i18n.t('programProgression.titleWeek');
            subtitle = i18n.t('programProgression.weekFinished');
            icon = ICON_MEDAL;
            percentage = Math.round((progressionProgram?.weeksDone / progressionProgram?.weeks) * 100);
            progressContent = (
                <View style={styles.completionContainer}>
                    <Text style={styles.completionTitle}>{ i18n.t('programProgression.programProgressionLabel') }</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarPercentageContainer}>
                            <Text style={styles.completionPercentage}>{`${percentage}%`}</Text>
                        </View>
                        <ProgressBar
                            duration={1200}
                            color={PROGRESSION_COLOR}
                            progress={percentage / 100}
                        />
                    </View>
                </View>
            );
            buttons = (
                <View style={styles.buttonsContainer}>
                    <SharedButton
                        color={'pink'}
                        onPress={() => this.goToWeek(progression?.week?.position + 1)}
                        style={styles.button}
                        text={i18n.t('programProgression.goToTheNextWeek')}
                        textStyle={styles.buttonText}
                    />
                </View>
            );
        }

        return (
            <Animated.View style={[styles.contentContainer, animatedStyle]}>
                <FadeInImage
                    containerCustomStyle={styles.icon}
                    resizeMode={'contain'}
                    source={icon}
                />
                <Text style={styles.title}>{ title }</Text>
                <Text style={styles.subtitle}>{ subtitle }</Text>
                { progressContent }
                { buttons }
            </Animated.View>
        );
    }

    private get updating (): JSX.Element {
        return this.state.updating ? (
            <View style={styles.fullSpace}>
                <Loader
                    color={BASE_COLOR}
                    containerStyle={styles.fullSpace}
                    withContainer={true}
                    containerBlur={true}
                    containerBlurProps={{
                        blurAmount: 8,
                        blurType: 'light'
                    }}
                />
            </View>
        ) : null;
    }

    public render (): JSX.Element {
        const confettiColors = [colors.pink, colors.orange, '#FFCD57', colors.violetDark];

        return (
            <Fragment>
                <View style={styles.container}>
                    { this.content }
                    { this.updating }
                </View>
                <Confetti
                    bsize={1.5}
                    colors={confettiColors}
                    confettiCount={50}
                    duration={1000}
                    ref={this.confettiRef}
                    size={1}
                    timeout={5}
                />
            </Fragment>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    progression: state.progression
});

export default connect(mapStateToProps, { setOpenProgressionProgramPopup }) (ProgramProgression);
