import React, { PureComponent, Fragment, RefObject } from 'react';
import { Text, View, Keyboard, Appearance } from 'react-native';
import { convertSecondsToTimeLabel } from '../../utils/date';
import { ETooltipIds } from '../../store/modules/tutorials';
import { ICircuitExercise, ISet } from '../../types/workout';
import { IScreenProps } from '../../index';
import { uniqueId } from 'lodash';
import i18n from '../../utils/i18n';
import { isAndroid } from '../../utils/os';

import { ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

import BlurWrapper from '../../components/BlurWrapper';
// import DurationPicker from '../Popups/DurationPicker';
import FadeInImage from '../../components/FadeInImage';
import Tooltip from '../Tooltip';

// import colors from '../../styles/base/colors.style';
import { getConvertedSetWeight, getSetWeightUnit } from '../../utils/units';
import styles, {
    BLUR_GRADIENT_COLORS,
    HEADER_GRADIENT_COLORS,
    PLACEHOLDER_COLOR,
    PLACEHOLDER_COLOR_ACTIVE,
    PLACEHOLDER_COLOR_DONE,
    ROW_HEIGHT,
    ROW_ACTIVE_GRADIENT_COLORS,
    ROW_DONE_GRADIENT_COLORS,
    SELECTION_COLOR,
    SELECTION_COLOR_ACTIVE,
    SELECTION_COLOR_DONE
} from '../../styles/components/Workout/WorkoutExerciseTable.style';

interface IProps {
    data: ICircuitExercise;
    exerciseIndex: number;
    lastDoneSetIndex: number;
    onBlur?: (exerciseIndex: number, setIndex: number) => Promise<void>;
    onCheckboxPress?: (exerciseIndex: number) => void;
    onSetFocus?: (
        exerciseSetIndex: number,
        columnIndex: number,
        inputWeightRef: RefObject<TextInput>,
        inputTargetRef: RefObject<TextInput>,
        inputTimeRef: RefObject<TouchableOpacity>
    ) => void;
    onSetSubmitEditing?: (exerciseIndex: number) => void;
    renderTooltips: boolean;
    screenProps: IScreenProps;
    sets: ISet[];
    updateSetState: (exerciseIndex: number, exerciseSetIndex: number, set: ISet) => void;
}

interface IState {
}

const CHECKMARK_ICON = require('../../static/icons/checkmark-thin.png');

class WorkoutExerciseTable extends PureComponent<IProps, IState> {

    private dummyMountTimer: any;
    private inputTargetRefs: RefObject<TextInput>[];
    private inputTimeRefs: RefObject<TouchableOpacity>[];
    private inputWeightRefs: RefObject<TextInput>[];
    private scrollViewRef: RefObject<ScrollView>;
    private isDarkMode: boolean;

    constructor (props: IProps) {
        super(props);
        this.inputTargetRefs = [];
        this.inputTimeRefs = [];
        this.inputWeightRefs = [];
        this.scrollViewRef = React.createRef();
        this.isDarkMode = Appearance.getColorScheme() === 'dark';
    }

    public componentDidMount (): void {
        const { lastDoneSetIndex } = this.props;
        // Why on earth is the following not working without a timer?
        // Everything is properly defined in SharedParallaxView's scrollTo and yet...
        this.dummyMountTimer = setTimeout(() => {
            this.scrollToActiveSet(lastDoneSetIndex);
        }, 1);
    }

    public componentWillUnmount (): void {
        clearTimeout(this.dummyMountTimer);
    }

    public scrollToActiveSet = (index: number, animated: boolean = true): void => {
        const scrollViewRef: any = this.scrollViewRef?.current;
        if ((index !== 0 && !index) || !scrollViewRef || !scrollViewRef?.scrollTo) {
            return;
        }
        scrollViewRef.scrollTo({
            y: index * ROW_HEIGHT,
            animated
        });
    }

    private getTargetPlaceholder (target: number): string {
        const { data: { type } } = this.props;
        return type === 'time' ? convertSecondsToTimeLabel(target) : target?.toString();
    }

    private getInputPlaceholder (target: number, isFailure?: boolean): string {
        return isFailure ? i18n.t('workout.tf') : this.getTargetPlaceholder(target);
    }

    private getWeightPlaceholder (setWeight: number, bodyweight: boolean = false): string {
        let weight = bodyweight ? '-' : '0';
        if (setWeight > 0) {
            weight = getConvertedSetWeight(setWeight).toString();
        }
        return weight;
    }

    private getWeightValue (exerciseSet: ISet): string {
        if (exerciseSet?.weight && exerciseSet?.weight !== '-') {
            return getConvertedSetWeight(exerciseSet?.weight as number).toString();
        } else {
            return exerciseSet?.weight?.toString();
        }
    }

    private getTimeInput (
        set: ISet,
        isFailureSet: boolean,
        exerciseIndex: number,
        setIndex: number,
        style: any
    ): JSX.Element {
        // const { onBlur, onSetFocus, updateSetState } = this.props;
        const seconds = set?.reps || 0;

        // const onValueChange = (value: number) => {
        //     let newSet = set;
        //     newSet.reps = value;

        //     updateSetState(exerciseIndex, setIndex, newSet);
        //     onBlur(exerciseIndex, setIndex);

        //     // We need to call forceUpdate() here because we are using PureComponents for performance reasons.
        //     // If we don't call it, WorkoutExerciseTable won't update because of the shallow comparison of the next props
        //     this.forceUpdate();
        // };

        // const onPress = () => {
        //     Keyboard.dismiss();
        //     onSetFocus(setIndex, 2, this.inputWeightRefs[setIndex], this.inputTargetRefs[setIndex], this.inputTimeRefs[setIndex]);
        //     this.props.screenProps?.popupManagerRef?.current?.requestPopup({
        //         closeButtonIcon: CHECKMARK_ICON,
        //         closeButtonIconColor: colors.violetDark,
        //         closeButtonIconSize: 34,
        //         ContentComponent: DurationPicker,
        //         ContentComponentProps: {
        //             onValueChange: onValueChange,
        //             initialTime: seconds.toString()
        //         },
        //         height: 260,
        //         position: 'bottom',
        //         scrollView: false,
        //         titleStyle: { color: colors.violetDark }
        //     });
        // };

        const onPress = () => {
            Keyboard.dismiss();
        };

        const defaultValue = this.getInputPlaceholder(seconds, isFailureSet);

        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={onPress}
                ref={this.inputTimeRefs[setIndex]}
                style={styles.inputContainer}
            >
                <Text style={[style, styles.inputTimeCustom]}>{ defaultValue }</Text>
            </TouchableOpacity>
        );

        // return (
        //     <TouchableOpacity
        //         activeOpacity={0.7}
        //         onPress={onPress}
        //         ref={this.inputTimeRefs[setIndex]}
        //         style={styles.inputContainer}
        //     >
        //         <Text style={textStyle}>{ defaultValue }</Text>
        //     </TouchableOpacity>
        // );
    }

    private get header (): JSX.Element {
        const { data } = this.props;
        const label2 = `${data?.exercise?.bodyweight ? '+' : ''}` + getSetWeightUnit();
        const label3 = data?.type === 'time' ? i18n.t('workout.time') : i18n.t('workout.reps');
        return (
            <View style={styles.headerContainer}>
                <LinearGradient
                    angle={90}
                    colors={HEADER_GRADIENT_COLORS}
                    style={[styles.fullSpace, styles.headerGradient]}
                    useAngle={true}
                />
                <View style={styles.column1} />
                <View style={styles.column2}>
                    <Text style={styles.headerLabel} numberOfLines={1}>{ label2 }</Text>
                </View>
                <View style={styles.column3}>
                    <Text style={styles.headerLabel} numberOfLines={1}>{ label3 }</Text>
                </View>
                <View style={styles.column4} />
                <View style={styles.column5} />
            </View>
        );
    }

    private get rows (): JSX.Element[] {
        const {
            exerciseIndex, data, lastDoneSetIndex, sets, updateSetState,
            onBlur, onCheckboxPress, onSetFocus, onSetSubmitEditing
        } = this.props;

        const type = data?.type;
        const bodyweight = data?.exercise?.bodyweight;

        if (!sets || !sets.length || !type || typeof bodyweight === undefined) {
            return null;
        }

        const isTime = type === 'time';
        const androidHackStyle = isAndroid ? styles.inputAndroidHack : {};
        const commonInputProps: any = {
            allowFontScaling: false,
            autoCapitalize: 'none',
            autoCorrect: false,
            clearButtonMode: 'never',
            contextMenuHidden: true,
            keyboardAppearance: this.isDarkMode ? 'dark' : 'light',
            keyboardType: 'numeric',
            placeholderTextColor: PLACEHOLDER_COLOR,
            returnKeyType: 'done',
            selectionColor: SELECTION_COLOR,
            selectTextOnFocus: true,
            style: [styles.input, androidHackStyle]
        };
        const doneInputProps = {
            placeholderTextColor: PLACEHOLDER_COLOR_DONE,
            selectionColor: SELECTION_COLOR_DONE,
            style: [commonInputProps?.style, styles.inputDone]
        };
        const activeInputProps = {
            placeholderTextColor: PLACEHOLDER_COLOR_ACTIVE,
            selectionColor: SELECTION_COLOR_ACTIVE,
            style: [commonInputProps?.style, styles.inputActive]
        };

        let items = [];
        for (let i = 0; i < sets.length; i++) {
            if (!this.inputWeightRefs[i]) {
                this.inputWeightRefs[i] = (React.createRef());
            }
            if (!this.inputTargetRefs[i]) {
                this.inputTargetRefs[i] = (React.createRef());
            }
            if (!this.inputTimeRefs[i]) {
                this.inputTimeRefs[i] = (React.createRef());
            }

            const isFailureSet = sets[i].toFailure;
            const setDone = lastDoneSetIndex >= 0 && i <= lastDoneSetIndex;
            const setActive = i === 0 && lastDoneSetIndex === undefined || i === lastDoneSetIndex + 1;
            const inputProps = {
                ...commonInputProps,
                ...(setDone ? doneInputProps : {}),
                ...(setActive ? activeInputProps : {})
            };

            const rowStyle = [
                styles.rowContainer,
                i + 1 === sets.length ? styles.rowContainerLast : {},
                setDone ? styles.rowContainerDone : {},
                setActive ? styles.rowContainerActive : {}
            ];
            const rowNumberStyle = [
                styles.rowNumber,
                setDone ? styles.rowNumberDone : {},
                setActive ? styles.rowNumberActive : {}
            ];
            const lastStyle = [
                styles.last,
                setDone ? styles.lastDone : {},
                setActive ? styles.lastValueActive : {}
            ];
            const lastValueStyle = [
                styles.lastNumber,
                setDone ? styles.lastDone : {},
                setActive ? styles.lastValueActive : {}
            ];

            const doneGradient = setDone ? (
                <LinearGradient
                    angle={90}
                    colors={ROW_DONE_GRADIENT_COLORS}
                    style={[styles.fullSpace, styles.doneGradient]}
                    useAngle={true}
                />
            ) : null;

            const activeGradient = setActive ? (
                <LinearGradient
                    angle={90}
                    colors={ROW_ACTIVE_GRADIENT_COLORS}
                    style={[styles.fullSpace, styles.activeGradient]}
                    useAngle={true}
                />
            ) : null;

            const activeBorder = setActive ? (
                <View style={[styles.fullSpace, styles.activeBorder]} pointerEvents={'none'} />
            ) : null;

            const check = setDone ? (
                <FadeInImage
                    source={CHECKMARK_ICON}
                    containerCustomStyle={styles.checkmarkIcon}
                    disableAnimation={true}
                    resizeMode={'contain'}
                    tintColor={setActive ? PLACEHOLDER_COLOR_ACTIVE : PLACEHOLDER_COLOR_DONE}
                />
            ) : null;

            const getHistoryText = (): JSX.Element => {
                if (sets[i]?.hasHistoryValue) {
                    return (
                        <Fragment>
                            { !!sets[i].weightHistoryValue && getConvertedSetWeight(sets[i].weightHistoryValue) }
                            { !!sets[i].weightHistoryValue && <Text style={styles.lastValueX}>x</Text> }
                            { this.getTargetPlaceholder(sets[i]?.repsHistoryValue) }
                        </Fragment>
                    );
                } else {
                    return (
                        <Fragment>
                            -
                        </Fragment>
                    );
                }
            };

            items.push(
                <View key={uniqueId(`row-${i}`)}>
                    <View style={rowStyle}>
                        { doneGradient }
                        { activeGradient }
                        <View style={styles.column1}>
                            <View style={styles.columnInner}>
                                <Text style={rowNumberStyle}>{ i + 1 }</Text>
                            </View>
                        </View>
                        <View style={[styles.column2, styles.columnBorderLeft]}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    { ...inputProps }
                                    blurOnSubmit={false} // Prevent keyboard flickering when focusing the next input
                                    defaultValue={this.getWeightValue(sets[i])}
                                    keyboardType={'numeric'}
                                    maxLength={5}
                                    onBlur={() => {
                                        onBlur(exerciseIndex, i);
                                    }}
                                    onChangeText={(text: string) => {
                                        let newSet = sets[i];
                                        newSet.weight = text;
                                        updateSetState(exerciseIndex, i, newSet);
                                    }}
                                    onFocus={() => {
                                        onSetFocus(i, 1, this.inputWeightRefs[i], this.inputTargetRefs[i], this.inputTimeRefs[i]);
                                    }}
                                    onSubmitEditing={() => {
                                        onSetSubmitEditing(exerciseIndex);
                                    }}
                                    placeholder={this.getWeightPlaceholder(sets[i]?.weightHistoryValue, bodyweight)}
                                    ref={this.inputWeightRefs[i]}
                                />
                            </View>
                        </View>
                        <View style={[styles.column3, styles.columnBorderLeftLight]}>
                            <View style={styles.inputContainer}>
                                {
                                    isTime ?
                                        this.getTimeInput(
                                            sets[i],
                                            isFailureSet,
                                            exerciseIndex,
                                            i,
                                            inputProps.style
                                        ) : (
                                        <TextInput
                                            { ...inputProps }
                                            keyboardType={isTime ? 'number-pad' : 'numeric'}
                                            maxLength={5}
                                            onBlur={() => {
                                                onBlur(exerciseIndex, i);
                                            }}
                                            onChangeText={(text: string) => {
                                                let newSet = sets[i];
                                                newSet.reps = parseInt(text, null);
                                                updateSetState(exerciseIndex, i, newSet);
                                            }}
                                            onFocus={() => {
                                                onSetFocus(i, 2, this.inputWeightRefs[i], this.inputTargetRefs[i], this.inputTimeRefs[i]);
                                            }}
                                            onSubmitEditing={() => {
                                                onSetSubmitEditing(exerciseIndex);
                                            }}
                                            defaultValue={this.getInputPlaceholder(sets[i]?.reps, isFailureSet)}
                                            ref={this.inputTargetRefs[i]}
                                        />
                                    )
                                }
                            </View>
                        </View>
                        <View style={[styles.column4, styles.columnBorderLeftLight]}>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                style={styles.checkboxContainer}
                                onPress={() => {
                                    onSetFocus(i, 3, this.inputWeightRefs[i], this.inputTargetRefs[i], this.inputTimeRefs[i]);
                                    onCheckboxPress(exerciseIndex);
                                }}
                            >
                                <View style={[styles.checkbox, setActive ? styles.checkboxActive : {}]}>
                                    { check }
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.column5, styles.columnBorderLeft]}>
                            <View style={styles.columnInner}>
                                <Text style={lastStyle}>{ i18n.t('workout.last') }</Text>
                                <Text style={lastValueStyle} numberOfLines={1}>
                                    { getHistoryText() }
                                </Text>
                            </View>
                        </View>
                    </View>
                    { activeBorder }
                </View>
            );
        }

        return items;
    }

    public render (): JSX.Element {
        const { data, renderTooltips } = this.props;
        const tooltip = renderTooltips ? (
            <Tooltip
                containerStyle={styles.tooltip}
                screenProps={this.props.screenProps}
                tooltipId={ETooltipIds.workoutTable}
            />
        ) : null;
        return data ? (
            <View>
                <View style={styles.container}>
                    <LinearGradient
                        angle={160}
                        colors={BLUR_GRADIENT_COLORS}
                        style={styles.fullSpace}
                        useAngle={true}
                    />
                    <BlurWrapper
                        type={'vibrancy'}
                        blurType={'light'}
                        blurAmount={30}
                        style={[styles.fullSpace, styles.setsBlur]}
                        blurStyle={styles.setsBlurIOS}
                        fallbackStyle={styles.setsBlurAndroid}
                    />
                    <View style={[styles.setsBackgroundColumn, styles.setsBackgroundColumnLeft]} />
                    <View style={[styles.setsBackgroundColumn, styles.setsBackgroundColumnRight]} />
                    { this.header }
                    <ScrollView
                        decelerationRate={'fast'}
                        overScrollMode={'never'}
                        pinchGestureEnabled={false}
                        ref={this.scrollViewRef}
                        showsVerticalScrollIndicator={false}
                        style={styles.setsScrollView}
                    >
                        { this.rows }
                        <View style={styles.setsScrollViewBottomSpacer} />
                    </ScrollView>
                </View>
                { tooltip }
            </View>
        ) : null;
    }
}

export default WorkoutExerciseTable;
