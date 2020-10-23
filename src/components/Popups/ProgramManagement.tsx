import React, { PureComponent, Fragment } from 'react';
import { Animated, Text, View, Easing } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import crashlytics from '@react-native-firebase/crashlytics';
import { IScreenProps } from '../../index';
import { IProgressionState } from '../../store/modules/progression';
import {
    fetchProgressionProgram,
    fetchProgram,
    updateWeekIdProgressionProgram,
    resetProgressionProgram,
    refreshProgression,
    resetProgressionWeekByWeekId
} from '../../utils/progression';
import { getFormattedDate } from '../../utils/date';
import I18n from '../../utils/i18n';
import { logEvent } from '../../utils/analytics';
import { confirmPopup } from '../../utils/confirmPopup';
import { IProgressionProgram } from '../../types/progression';
import { IProgram, IWeek } from '../../types/program';
import { isAndroid } from '../../utils/os';
import { TViews } from '../../views';

import SharedButton from '../SharedButton';
import NativePicker from './NativePicker';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';

import colors from '../../styles/base/colors.style';
import styles, { MANAGE_POPUP_HEIGHT } from '../../styles/components/Popups/ProgramManagement.style';

interface IProps {
    dismissPopup: () => void;
    navigation: any;
    progression: IProgressionState;
    screenProps: IScreenProps;
}

interface IState {
    animContentOpacity: Animated.Value;
    animContentTransform: Animated.Value;
    fetchError: boolean;
    loading: boolean;
    progressionProgram: IProgressionProgram;
    updating: boolean;
    weekSelected: number;
}

class ProgramManagement extends PureComponent<IProps, IState> {

    private mounted: boolean = false;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animContentOpacity: new Animated.Value(0),
            animContentTransform: new Animated.Value(0),
            fetchError: false,
            loading: false,
            progressionProgram: undefined,
            updating: false,
            weekSelected: props.progression.week?.position >= 0 ? props.progression.week?.position : undefined
        };
    }

    public componentDidMount (): void {
        this.mounted = true;
        this.fetch();
    }

    public componentWillUnmount (): void {
        this.mounted = false;
    }

    private fetch = async (): Promise<void> => {
        const { progression } = this.props;
        if (this.mounted) {
            this.setState({ loading: true });
        }
        try {
            const progressionProgram = await fetchProgressionProgram(progression.program.id);
            if (this.mounted) {
                this.setState({ fetchError: false, loading: false, progressionProgram }, this.animateContent);
            }
        } catch (error) {
            if (this.mounted) {
                this.setState({ fetchError: true, loading: false });
            }
            console.log(error);
        }
    }

    private animateContent (): void {
        const {
            animContentOpacity,
            animContentTransform
        } = this.state;
        Animated.parallel([
            Animated.timing(animContentOpacity, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.spring(animContentTransform, {
                toValue: 1,
                speed: 10,
                bounciness: 8,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private onPressChangeProgram = () => {
        this.props.dismissPopup();

        // On Android we actually need to get rid of the underlying view of performance will greatly suffer
        const route: TViews = 'ProgramSelectionModal';
        if (isAndroid) {
            this.props.navigation.replace(route);
        } else {
            this.props.navigation.navigate(route);
        }
    }

    private onPressChangeWeek = (): void => {
        const { screenProps } = this.props;
        const { progressionProgram, weekSelected } = this.state;

        if (!progressionProgram.programId || !Number.isInteger(weekSelected)) {
            screenProps?.toastManagerRef?.current?.openToast({
                close: () => null,
                message: I18n.t('app.fetchError'),
                type: 'error'
            });
            return;
        }

        confirmPopup(async () => {
            this.setState({ updating: true });
            try {
                // screenProps?.toastManagerRef?.current?.openToast({
                //     close: () => null,
                //     message: I18n.t('app.toastUpdateMessage'),
                //     type: 'info'
                // });
                const program: IProgram = await fetchProgram(progressionProgram.programId);
                let weekId: string = undefined;
                program?.weeks.forEach((week: IWeek) => {
                    if (week?.position === weekSelected * 1) {
                        weekId = week?.id;
                    }
                });
                const updated = await updateWeekIdProgressionProgram(progressionProgram, weekId);
                if (updated) {
                    // screenProps?.toastManagerRef?.current?.openToast({
                    //     close: () => null,
                    //     message: I18n.t('app.toastUpdateSuccessMessage'),
                    //     type: 'info'
                    // });
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Training' })]
                    });
                    this.props.navigation?.dispatch(resetAction);
                    this.props.dismissPopup();

                    logEvent('week_change', {
                        influencerId: program?.author?.id,
                        influencerFirstName: program?.author?.firstName,
                        programId: program?.id,
                        programTitle: program?.title,
                        weekId,
                        weekNumber: weekSelected + 1
                    });
                } else {
                    screenProps?.toastManagerRef?.current?.openToast({
                        close: () => null,
                        message: I18n.t('app.fetchError'),
                        type: 'error'
                    });
                }
            } catch (error) {
                console.log(error);
                screenProps?.toastManagerRef?.current?.openToast({
                    close: () => null,
                    message: I18n.t('app.fetchError'),
                    type: 'error'
                });
            }
            this.setState({ updating: false });
        });
    }

    private onPressResetWeek = async (): Promise<void> => {
        const { progression } = this.props;
        confirmPopup(async () => {
            let resetSuccessful: boolean = false;
            try {
                this.setState({ updating: true });
                this.props.screenProps.toastManagerRef.current.openToast({
                    message: I18n.t('app.toastUpdateMessage'),
                    type: 'info'
                });
                resetSuccessful = await resetProgressionWeekByWeekId(progression?.week?.id);
                if (resetSuccessful) {
                    this.props.screenProps.toastManagerRef.current.openToast({
                        message: I18n.t('app.toastUpdateSuccessMessage'),
                        type: 'info'
                    });
                    // refresh progression
                    refreshProgression();
                    this.props.dismissPopup();
                } else {
                    this.props.screenProps.toastManagerRef.current.openToast({
                        close: () => null,
                        message: I18n.t('app.fetchError'),
                        type: 'error'
                    });
                }
            } catch (error) {
                crashlytics().recordError(error);
                this.props.screenProps.toastManagerRef.current.openToast({
                    close: () => null,
                    message: I18n.t('app.fetchError'),
                    type: 'error'
                });
                console.log(error);
            } finally {
                this.setState({ updating: false });
            }
        },
        undefined,
        I18n.t('programManagement.resetWeek'),
        I18n.t('programManagement.resetWeekMessage'));
    }

    private onPressResetProgram = (): void => {
        const { progressionProgram } = this.state;
        confirmPopup(async () => {
            let resetSuccessful: boolean = false;
            try {
                this.setState({ updating: true });
                this.props.screenProps.toastManagerRef.current.openToast({
                    message: I18n.t('app.toastUpdateMessage'),
                    type: 'info'
                });
                resetSuccessful = await resetProgressionProgram(progressionProgram);
                if (resetSuccessful) {
                    this.props.screenProps.toastManagerRef.current.openToast({
                        message: I18n.t('app.toastUpdateSuccessMessage'),
                        type: 'info'
                    });
                    // refresh progression
                    refreshProgression();
                    this.props.dismissPopup();
                } else {
                    this.props.screenProps.toastManagerRef.current.openToast({
                        close: () => null,
                        message: I18n.t('app.fetchError'),
                        type: 'error'
                    });
                }
            } catch (error) {
                crashlytics().recordError(error);
                this.props.screenProps.toastManagerRef.current.openToast({
                    close: () => null,
                    message: I18n.t('app.fetchError'),
                    type: 'error'
                });
                console.log(error);
            } finally {
                this.setState({ updating: false });
            }
        },
        undefined,
        I18n.t('programProgression.resetProgram'),
        I18n.t('programProgression.resetProgramMessage'));
    }

    private onValueWeekSelectorChange = (position: number) => {
        this.setState({ weekSelected: position });
    }

    private get programDetails (): JSX.Element {
        const { progression } = this.props;
        const { progressionProgram } = this.state;
        if (!progression || !progression.program || !progressionProgram) {
            return;
        }

        const title = progression.program.title || '';
        const startedAt = progressionProgram.startedAt ? getFormattedDate(progressionProgram.startedAt, 'll') : '';
        const weekPosition = Number.isInteger(progression.week.position) ? progression.week.position + 1 : 0;
        const weekCount = progressionProgram.weeks || 0;

        return title && startedAt && weekPosition ? (
            <View style={styles.programInfoWrapper}>
                <Text numberOfLines={3} style={styles.programTitle}>{ title }</Text>
                <View style={styles.programInfoContainer}>
                    <Text style={styles.programInfoLabel}>{ I18n.t('programManagement.startedOn') + ' : ' }</Text>
                    <Text style={styles.programInfoContent}>{ startedAt }</Text>
                </View>
                <View style={styles.programInfoContainer}>
                    <Text style={styles.programInfoLabel}>{ I18n.t('programManagement.currentWeek') + ' : ' }</Text>
                    <Text style={styles.programInfoContent}>{ weekPosition + ' / ' + weekCount }</Text>
                </View>
            </View>
        ) : null;
    }

    private get weekSelection (): JSX.Element {
        const { progressionProgram, weekSelected } = this.state;

        if (!progressionProgram) {
            return;
        }

        const unlockedAllWeeks = true; // hasAdminAccess();
        const unlockedWeeksCount: number = unlockedAllWeeks ? progressionProgram.weeks : progressionProgram.weeksUnlocked;

        let items = [];
        for (let i = 1; i <= unlockedWeeksCount; i++) {
            // value: i - 1 because in database the position value starts at 0, not 1
            items.push({ label: i.toString(), value: i - 1, disable: true });
        }

        return unlockedWeeksCount > 1 ? (
            <View>
                <Text style={styles.changeWeekTitle}>{ I18n.t('programManagement.myWeeks') }</Text>
                <View style={styles.changeWeekContentContainer}>
                    <NativePicker
                        itemStyle={styles.changeWeekPicker}
                        items={items}
                        onValueChange={(position: number) => this.onValueWeekSelectorChange(position)}
                        style={styles.changeWeekPickerContainer}
                        selectedValue={weekSelected}
                    />
                    <SharedButton
                        onPress={ this.onPressChangeWeek }
                        style={styles.changeWeekButton}
                        text={ I18n.t('programManagement.changeWeek')}
                    />
                </View>
            </View>
        ) : null;
    }

    private get resetButtons (): JSX.Element {
       return (
           <View>
                <Text style={styles.changeWeekTitle}>{ I18n.t('programManagement.reset') }</Text>
                <SharedButton
                    color={'white'}
                    onPress={ this.onPressResetProgram }
                    containerStyle={styles.resetButton}
                    text={ I18n.t('programProgression.resetProgramShort') }
                />
                <SharedButton
                    color={'white'}
                    onPress={ this.onPressResetWeek }
                    containerStyle={styles.resetButton}
                    text={ I18n.t('programManagement.resetWeekShort')}
                />
           </View>
       );
    }

    private get popupState (): JSX.Element {
        const { fetchError, loading } = this.state;
        let content = null;
        if (loading) {
            content = (
                <Loader
                    color={colors.violetDark}
                    withContainer={true}
                    containerType={'flex'}
                />
            );
        } else if (fetchError) {
            content = (
                <Fragment>
                    <SharedButton
                        color={'pink'}
                        onPress={ this.onPressChangeProgram }
                        text={ I18n.t('programManagement.changeProgram') }
                    />
                    <ErrorMessage
                        containerStyle={styles.fetchErrorContainer}
                        message={I18n.t('app.fetchErrorRetry')}
                        retry={this.fetch}
                        toastManagerRef={this.props.screenProps?.toastManagerRef}
                    />
                </Fragment>
            );
        }
        return content ? (
            <View style={styles.popupStateContainer}>
                { content }
            </View>
        ) : null;
    }

    private get updating (): JSX.Element {
        return this.state.updating ? (
            <View style={styles.fullSpace}>
                <Loader
                    color={colors.violetDark}
                    containerStyle={[styles.fullSpace, { height: MANAGE_POPUP_HEIGHT }]}
                    containerBlur={true}
                    containerBlurProps={{
                        blurAmount: 8,
                        blurType: 'light',
                        fallbackStyle: styles.blurAndroid
                    }}
                    withContainer={true}
                />
            </View>
        ) : null;
    }

    private get content (): JSX.Element {
        const { animContentOpacity, animContentTransform, fetchError, loading } = this.state;
        const contentStyle = [
            {
                opacity: animContentOpacity,
                transform: [
                    {
                        translateY: animContentTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                        })
                    }
                ]
            }
        ];

        let content = null;
        if (fetchError || loading) {
            content = this.popupState;
        } else {
            content = (
                <Animated.View style={contentStyle}>
                    { this.programDetails }
                    <SharedButton
                        color={'pink'}
                        onPress={ this.onPressChangeProgram }
                        text={ I18n.t('programManagement.changeProgram') }
                    />
                    { this.weekSelection }
                    { this.resetButtons }
                </Animated.View>
            );
        }
        return content;
    }

    public render (): JSX.Element {
        return (
            <Fragment>
                <View style={styles.container}>
                    { this.content }
                </View>
                { this.updating }
            </Fragment>
        );
    }
}

export default ProgramManagement;
