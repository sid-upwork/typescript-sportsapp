import React, { Component } from 'react';
import { View, Text, Animated, Easing, Image, ScrollView, Linking } from 'react-native';
import { IProgram } from '../../types/program';
import chroma from 'chroma-js';
import i18n from '../../utils/i18n';
import delays from '../../utils/animDelays';

import DiffuseShadow from '../../components/DiffuseShadow';
import FadeInImage from '../../components/FadeInImage';
import GradientOverlay from '../../components/GradientOverlay';
import HTML from 'react-native-render-html';
import HTMLRenderersDefault from '../../components/HTMLRenderer';
import LinearGradient from 'react-native-linear-gradient';

import tagStyles, { BASE_FONT_STYLE } from '../../styles/base/html.style';
import colors from '../../styles/base/colors.style';
import styles from '../../styles/components/Popups/Program.style';

interface IProps {
    program: IProgram;
}

interface IState {
    backdropAnimationOpacity: Animated.Value;
    imageAnimationOpacity: Animated.Value;
    imageAnimationTransform: Animated.Value;
}

const CALENDAR_ICON = require('../../static/icons/calendar.png');
const SQUAT_ICON = require('../../static/icons/squat.png');
const DUMBBELL_ICON = require('../../static/icons/dumbbell-full-white.png');
const LOCATION_ICON = require('../../static/icons/location.png');
const KETTLEBELL_ICON = require('../../static/icons/kettlebell.png');

class Program extends Component<IProps, IState> {

    private timeout: any;

    constructor (props: IProps) {
        super(props);
        this.state = {
            backdropAnimationOpacity: new Animated.Value(0),
            imageAnimationOpacity: new Animated.Value(0),
            imageAnimationTransform: new Animated.Value(0)
        };
        this.timeout;
    }

    public componentDidMount (): void {
        this.animateBackdrop();
        this.animateImage();
    }

    private animateBackdrop (animateOut?: boolean): void {
        const delay = animateOut ? 0 : delays.views.program.backdropApparition;
        Animated.sequence([
            Animated.delay(delay),
            Animated.timing(this.state.backdropAnimationOpacity, {
                toValue: animateOut ? 0 : 1,
                duration: animateOut ? 200 : 500,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private animateImage (): void {
        Animated.sequence([
            Animated.delay(delays.views.program.imageApparition),
            Animated.parallel([
                Animated.timing(this.state.imageAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(this.state.imageAnimationTransform, {
                    toValue: 1,
                    speed: 12,
                    bounciness: 6,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private alterNode = (node: any) => {
        node.attribs = { ...(node.attribs || {}), style: `color:white;` };
        return node;
    }

    private getInfo (
        title: string, icon: any, iconStyle: any, value: string, paddingRight?: boolean, large?: boolean
    ): JSX.Element {
        return (
            <View style={[large ? styles.infoLarge : styles.info, paddingRight ? { paddingRight: 9 } : { paddingLeft: 9 }]}>
                <Text numberOfLines={1} style={styles.infoTitle}>{ title }</Text>
                <View style={styles.infoValueContainer}>
                    <Image source={icon} style={[styles.infoIcon, iconStyle]} />
                    <Text style={styles.infoValue}>{ value }</Text>
                </View>
            </View>
        );
    }

    private get image (): JSX.Element {
        const { imageAnimationOpacity, imageAnimationTransform } = this.state;
        const { program } = this.props;

        const animatedStyle = [
            styles.imageContainer,
            { opacity: imageAnimationOpacity },
            {
                transform: [{
                    translateX: imageAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 0]
                    })
                }]
            }
        ];

        return (
            <Animated.View style={animatedStyle}>
                <DiffuseShadow style={styles.diffuseShadow} borderRadius={20} />
                <View style={styles.imageContainerInner}>
                    <FadeInImage
                        containerCustomStyle={styles.image}
                        source={{ uri: program && program.image && program.image.thumbnailUrl }}
                    />
                    <View style={styles.imageOverlay}>
                        { this.imageGradientOverlay }
                        <Text numberOfLines={4} style={styles.title}>{ program && program.title }</Text>
                    </View>
                </View>
            </Animated.View>
        );
    }

    private get imageGradientOverlay (): JSX.Element {
        const overlayColors: string[] = [
            chroma(colors.violetDark).alpha(0).css(),
            chroma(colors.violetDark).alpha(0.4).css(),
            chroma(colors.violetDark).alpha(0.7).css()
        ];
        const overlayLocation: number[] = [0, 0.6, 1];

        return (
            <GradientOverlay colors={overlayColors} locations={overlayLocation} />
        );
    }

    private get infos (): JSX.Element {
        const { program } = this.props;
        const { equipment, location } = program;

        if (!program) {
            return null;
        }

        const duration = program.duration + ' ' + i18n.t('program.weeks');
        const frequency = i18n.t('program.daysAWeek', { days: program.frequency });
        const level = i18n.t('program.level' + program.level);

        return (
            <ScrollView
                contentContainerStyle={styles.infoContainer}
                overScrollMode={'never'}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.infoBorderContainer}>
                    { this.getInfo(i18n.t('program.duration'), CALENDAR_ICON, styles.calendarIcon, duration, true) }
                    { this.getInfo(i18n.t('program.frequency'), SQUAT_ICON, styles.squatIcon, frequency) }
                    { this.getInfo(i18n.t('program.level'), DUMBBELL_ICON, styles.dumbbellIcon, level, true) }
                    { this.getInfo(i18n.t('program.location'), LOCATION_ICON, styles.locationIcon, location) }
                    { this.getInfo(i18n.t('program.equipment'), KETTLEBELL_ICON, styles.kettlebellIcon, equipment, true, true) }
                </View>
                <View style={styles.infoDescripion}>
                    <HTML
                        allowFontScaling={false}
                        alterNode={this.alterNode}
                        baseFontStyle={BASE_FONT_STYLE}
                        html={program.description}
                        onLinkPress={(_: any, href: string) => Linking.openURL(href) }
                        renderers={HTMLRenderersDefault()}
                        tagStyles={tagStyles}
                    />
                </View>
                <Text style={styles.infoTip}>{ i18n.t('program.tip') }</Text>
            </ScrollView>
        );
    }

    private get scrollViewGradient (): JSX.Element {
        const overlayColors: string[] = [
            chroma(colors.pink).alpha(0).css(),
            chroma(colors.pink).alpha(1).css()
        ];

        return (
            <LinearGradient
                colors={overlayColors}
                locations={[0, 1]}
                pointerEvents={'none'}
                style={styles.scrollViewGradient}
            />
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <View style={styles.containerInner}>
                    { this.image }
                    { this.infos }
                    { this.scrollViewGradient }
                </View>
            </View>
        );
    }
}

export default Program;

interface IConfirmmButtonProps {}

interface IConfirmmButtonState {
    confirmButtonAnimationTransform: Animated.Value;
}

export class ProgramConfirmButton extends Component<IConfirmmButtonProps, IConfirmmButtonState> {

    constructor (props: IConfirmmButtonProps) {
        super(props);
        this.state = {
            confirmButtonAnimationTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateConfirmButton();
    }

    private animateConfirmButton (): void {
        Animated.sequence([
            Animated.delay(delays.views.program.confirmButtonApparition),
            Animated.parallel([
                Animated.timing(this.state.confirmButtonAnimationTransform, {
                    toValue: 1,
                    duration: 300,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    public render (): JSX.Element {
        const { confirmButtonAnimationTransform } = this.state;
        const confirmButtonAnimatedStyle = [
            styles.confirmButton,
            {
                transform: [{
                    scale: confirmButtonAnimationTransform.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.1, 1]
                    })
                }]
            }
        ];

        const overlayColors: string[] = [colors.blueLight, colors.blueDark];

        return (
            <Animated.View style={confirmButtonAnimatedStyle}>
                <LinearGradient
                    angle={176}
                    colors={overlayColors}
                    locations={[0, 1]}
                    style={styles.confirmButtonGradient}
                    useAngle={true}
                />
                <Text style={styles.confirmButtonLabel}>{i18n.t('program.confirm')}</Text>
            </Animated.View>
        );
    }
}
