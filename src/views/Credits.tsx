import React, { Component } from 'react';
import { View, Animated, Easing, Text, Image, Linking, Alert } from 'react-native';
import delays from '../utils/animDelays';
import i18n, { getLanguageFromLocale } from '../utils/i18n';
import { logEvent } from '../utils/analytics';
import { CSLFIT_URL, MELIORENCE_URL } from '../utils/staticLinks';
import LinearGradient from 'react-native-linear-gradient';

import BackgroundTop from '../static/Settings/background-top.svg';
import DiffuseShadow from '../components/DiffuseShadow';
import Header from '../components/Header';
import SharedParallaxView from '../components/SharedParallaxView';
import TouchableScale from '../components/TouchableScale';

import { viewportHeight } from '../styles/base/metrics.style';
import settingsStyles, { COLOR_GRADIENT } from '../styles/views/Settings.style';
import styles, { BACKGROUND_TOP_WIDTH, BACKGROUND_TOP_HEIGHT, GRADIENT_COLORS } from '../styles/views/Credits.style';

const DOWN_ARROW_ICON = require('../static/icons/down-arrow.png');

const CREDITS_LIBRARIES: ICreditsLibrary[] = [
    {
        library: 'React',
        url: 'https://reactjs.org/'
    },
    {
        library: 'React Native',
        url: 'https://reactnative.dev/'
    },
    {
        library: 'Redux',
        url: 'https://redux.js.org/'
    }
]

const CREDITS_ICONS: ICreditsIcon[] = [
    {
        author: 'Katerina Limpitsouni',
        authorUrl: 'https://twitter.com/ninaLimpi',
        website: 'undraw.co',
        websiteUrl: 'https://undraw.co/'
    },
    {
        author: 'Freepik',
        authorUrl: 'https://www.flaticon.com/authors/freepik',
        website: 'www.flaticon.com',
        websiteUrl: 'https://www.flaticon.com/'
    },
    {
        author: 'Google',
        authorUrl: 'https://www.flaticon.com/authors/google',
        website: 'www.flaticon.com',
        websiteUrl: 'https://www.flaticon.com/'
    },
    {
        author: 'Vectors Market',
        authorUrl: 'https://www.flaticon.com/authors/vectors-market',
        website: 'www.flaticon.com',
        websiteUrl: 'https://www.flaticon.com/'
    },
    {
        author: 'Those Icons',
        authorUrl: 'https://www.flaticon.com/authors/those-icons',
        website: 'www.flaticon.com',
        websiteUrl: 'https://www.flaticon.com/'
    },
    {
        author: 'Pixel Perfect',
        authorUrl: 'https://www.flaticon.com/authors/pixel-perfect',
        website: 'www.flaticon.com',
        websiteUrl: 'https://www.flaticon.com/'
    },
    {
        author: 'itim2101',
        authorUrl: 'https://www.flaticon.com/authors/itim2101',
        website: 'www.flaticon.com',
        websiteUrl: 'https://www.flaticon.com/'
    }
];

interface ICreditsLibrary {
    library: string;
    url: string;
}

interface ICreditsIcon {
    author: string;
    authorUrl: string;
    website: string;
    websiteUrl: string;
}

interface IProps {}

interface IState {
    backgroundTopAnimationOpacity: Animated.Value;
    backgroundTopAnimationTransform: Animated.Value;
    creditAnimationOpacity: Animated.Value;
    creditAnimationTransform: Animated.Value;
}

class Credits extends Component<IProps, IState> {

    private isVerticalLanguage: boolean;

    constructor (props: IProps) {
        super(props);
        this.isVerticalLanguage = getLanguageFromLocale(i18n.locale).isVerticalLanguage;
        this.state = {
            backgroundTopAnimationOpacity: new Animated.Value(0),
            backgroundTopAnimationTransform: new Animated.Value(0),
            creditAnimationOpacity: new Animated.Value(0),
            creditAnimationTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateBackground();
        this.animateContent();
    }

    private animateBackground (): void {
        const {
            backgroundTopAnimationOpacity,
            backgroundTopAnimationTransform
        } = this.state;

        Animated.parallel([
            Animated.delay(delays.views.credits.backgroundTopApparition),
            Animated.parallel([
                Animated.timing(backgroundTopAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(backgroundTopAnimationTransform, {
                    toValue: 1,
                    speed: 10,
                    bounciness: 6,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateContent (): void {
        const { creditAnimationOpacity, creditAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.credits.creditApparition),
            Animated.parallel([
                Animated.timing(creditAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(creditAnimationTransform, {
                    toValue: 1,
                    speed: 15,
                    bounciness: 8,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private openURL (url: string): void {
        Linking.canOpenURL(url).then((supported: boolean) => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert(i18n.t('app.fetchErrorTitle'), i18n.t('app.fetchError'));
            }
        });
    }

    private openCSLFITWebsite = (): void => {
        logEvent('credits_open', { company: 'cslfit' });
        Linking.openURL(CSLFIT_URL);
    }

    private openMeliorenceWebsite = (): void => {
        logEvent('credits_open', { company: 'meliorence' });
        Linking.openURL(MELIORENCE_URL);
    }

    private getBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const {
            backgroundTopAnimationOpacity,
            backgroundTopAnimationTransform
        } = this.state;

        const backgroundTopAnimatedStyle = [
            styles.backgroundTop,
            {
                opacity: backgroundTopAnimationOpacity,
                transform: [
                    {
                        translateX: backgroundTopAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [100, 0]
                        })
                    }
                ]
            }
        ];

        const backgroundTopScrollAnimatedStyle = {
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [0, -viewportHeight * 0.5]
                    })
                }
            ]
        };

        return (
            <View>
                <Animated.View style={backgroundTopAnimatedStyle}>
                    <Animated.View style={backgroundTopScrollAnimatedStyle}>
                        <BackgroundTop width={BACKGROUND_TOP_WIDTH} height={BACKGROUND_TOP_HEIGHT} />
                    </Animated.View>
                </Animated.View>
            </View>
        );
    }

    private getForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <Header animatedValue={animatedValue} mode={'backPink'} />
        );
    }

    private get libraryEntries (): JSX.Element[] {
        const entries = CREDITS_LIBRARIES.map((libraryInfo: ICreditsLibrary, index: number) => {
            return (
                <TouchableScale
                    activeOpacity={0.7}
                    activeScale={0.96}
                    key={`credits-library-entry-${index}`}
                    onPress={() => this.openURL(libraryInfo?.url)}
                >
                    <DiffuseShadow
                        borderRadius={20}
                        horizontalOffset={30}
                        shadowOpacity={0.15}
                        style={styles.entryDiffuseShadow}
                    />
                    <View style={styles.entryContainer}>
                        <View style={styles.entryContainerLeft}>
                            <Text style={styles.entryTitle}>{ libraryInfo?.library }</Text>
                        </View>
                        <View style={styles.entryButtonContainer}>
                            <LinearGradient
                                angle={150}
                                colors={GRADIENT_COLORS}
                                style={[styles.fullSpace, styles.entryButtonGradient]}
                                useAngle={true}
                            />
                            <Image source={DOWN_ARROW_ICON} style={styles.entryButtonIcon} />
                        </View>
                    </View>
                </TouchableScale>
            );
        });
        return entries;
    }

    private get iconEntries (): JSX.Element[] {
        const entries = CREDITS_ICONS.map((iconInfo: ICreditsIcon, index: number) => {
            const author = (
                <Text
                    onPress={() => this.openURL(iconInfo?.authorUrl)}
                    style={styles.iconEntryLink}
                >
                    { this.isVerticalLanguage ? '' : ' ' }
                    { iconInfo?.author }
                    { ' ' }
                </Text>
            );
            const website = (
                <Text
                    onPress={() => this.openURL(iconInfo?.websiteUrl)}
                    style={styles.iconEntryLink}
                >
                    { this.isVerticalLanguage ? '' : ' ' }
                    { iconInfo?.website }
                </Text>
            );
            return (
                <View
                    key={`credits-library-entry-${index}`}
                    style={styles.iconEntryContainer}
                >
                    <View style={styles.iconEntryBullet} />
                    <Text style={styles.iconEntry}>
                        <Text>{ i18n.t('credits.iconCreditsPrefix') }</Text>
                        { this.isVerticalLanguage ? website : author }
                        <Text>{ i18n.t('credits.iconCreditsMiddle') }</Text>
                        { this.isVerticalLanguage ? author : website }
                        <Text>{ i18n.t('credits.iconCreditsSuffix') }</Text>
                    </Text>
                </View>
            );
        });
        return entries;
    }

    private get credits (): JSX.Element {
        const { creditAnimationOpacity, creditAnimationTransform } = this.state;
        const animatedStyle = [
            styles.creditCategoryTitle,
            {
                opacity: creditAnimationOpacity,
                transform: [
                    {
                        translateY: creditAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [120, 0]
                        })
                    }
                ]
            }
        ];

        return (
            <Animated.View style={[styles.creditsContainer, animatedStyle]}>
                <Text style={styles.creditCategoryTitle}>{ i18n.t('credits.icons') }</Text>
                { this.iconEntries }
                <Text style={styles.creditCategoryTitle}>{ i18n.t('credits.libraries') }</Text>
                { this.libraryEntries}
            </Animated.View>
        );
    }

    private get copyright (): JSX.Element {
        return (
            <View style={settingsStyles.copyrightContainer}>
                <LinearGradient
                    angle={160}
                    colors={COLOR_GRADIENT}
                    style={settingsStyles.copyrightGradient}
                    useAngle={true}
                />
                <Text style={settingsStyles.copyright}>
                    <Text>{ i18n.t('settings.madeByPrefix') }</Text>
                    <Text
                        onPress={this.openCSLFITWebsite}
                        style={settingsStyles.copyrightLink}
                    >
                        { i18n.t('settings.companyNameCSL') }
                    </Text>
                    <Text>{ i18n.t('settings.madeByMiddle') }</Text>
                    <Text
                        onPress={this.openMeliorenceWebsite}
                        style={settingsStyles.copyrightLink}
                    >
                        { i18n.t('settings.companyNameMeliorence') }
                    </Text>
                    <Text>{ i18n.t('settings.madeBySuffix') }</Text>
                </Text>
            </View>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <SharedParallaxView
                    contentContainerStyle={styles.scrollView}
                    renderBackground={this.getBackground}
                    renderForeground={this.getForeground}
                >
                    { this.credits }
                </SharedParallaxView>
                { this.copyright }
            </View>
        );
    }
}

export default Credits;
