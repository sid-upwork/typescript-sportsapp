import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { connect } from 'react-redux';
import { setDrawerOpened } from '../store/modules/userInterface';
import { replace, getNavigationState, INavigateMenuEntry } from '../navigation/services';
import { IReduxState } from '../store/reducers';
import { TViews } from '../views/index';
import { initialRouteName } from '../navigation/AppContainer';
import { IMedia } from '../types/media';
import { get, debounce } from 'lodash';
import i18n from '../utils/i18n';
import chroma from 'chroma-js';

import FadeInImage, { ERROR_PLACEHOLDER_SOURCE } from './FadeInImage';
import SideMenuEntry from './SideMenuEntry';

import { DRAWER_ANIMATION_DURATION } from '../styles/components/AppDrawer.style';
import colors from '../styles/base/colors.style';
import styles from '../styles/components/SideMenu.style';

interface IProps {
    animItems: boolean;
    firstName: string;
    lastName: string;
    picture: IMedia;
    pinCodeEnabled: boolean;
    setDrawerOpened: (opened: boolean) => void;
}

interface IState {
    currentRouteName: TViews;
}

const GEAR_ICON = require('../static/icons/gear.png');

class SideMenu extends Component<IProps, IState> {

    private timeout: any;

    constructor (props: IProps) {
        super(props);
        this.state = {
            currentRouteName: initialRouteName
        };
    }

    public componentDidUpdate (): void {
        const routeName: TViews = get(getNavigationState(), 'nav.routes[0].routeName');

        if (routeName && routeName !== this.state.currentRouteName) {
            this.setState({ currentRouteName : getNavigationState().nav.routes[0].routeName });
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.timeout);
    }

    private onPressSettings = (): void => {
        this.props.setDrawerOpened(false);

        // We wait for the menu to close before navigating
        this.timeout = setTimeout(() => {
            if (get(getNavigationState(), 'nav.routes[0].routeName') !== 'Settings') {
                replace({ routeName: 'Settings', params: {} });
            }
        }, DRAWER_ANIMATION_DURATION);
    }

    private getMenuEntries (): INavigateMenuEntry[] {
        let entries: INavigateMenuEntry[] = [
            {
                displayName: i18n.t('menu.training'),
                params: {},
                routeName: 'Training'
            },
            {
                displayName: i18n.t('menu.recipes'),
                params: {},
                routeName: 'Recipes'
            },
            {
                displayName: i18n.t('menu.blog'),
                params: {},
                routeName: 'Blog'
            },
            {
                displayName: i18n.t('menu.community'),
                params: {},
                routeName: 'Community'
            }
        ];

        if (this.props.pinCodeEnabled === false) {
            entries.splice(3, 0, {
                displayName: i18n.t('menu.progressPictures'),
                params: {},
                routeName: 'ProgressPictures'
            });
        } else {
            entries.splice(3, 0, {
                displayName: i18n.t('menu.progressPictures'),
                params: {
                    protectedRouteName: 'ProgressPictures'
                },
                routeName: 'PinCodeNoTransition'
            });
        }

        return entries;
    }

    private get header (): JSX.Element {
        const { picture } = this.props;
        // The error placeholder is not showing up on Android...
        const source = picture?.thumbnailUrl ? { uri: picture?.thumbnailUrl } : ERROR_PLACEHOLDER_SOURCE;
        return (
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={debounce(this.onPressSettings, 200, { 'leading': true, 'trailing': false })}
                    style={styles.portraitBorder}
                >
                    <FadeInImage
                        duration={300}
                        containerCustomStyle={styles.portraitContainer}
                        imageStyle={styles.portrait}
                        source={source}
                    />
                </TouchableOpacity>
                <Text style={styles.name}>{ this.props.firstName } { this.props.lastName }</Text>
                {/* { this.program } */}
            </View>
        );
    }

    private get entries (): JSX.Element {
        const items = this.getMenuEntries().map((entry: INavigateMenuEntry, index: number) => {
            let routeName: TViews;
            // In the case of PinCode and PinCodeNoTransition, we want to match with protectedRouteName not routeName
            if ((entry.routeName === 'PinCode' || entry.routeName === 'PinCodeNoTransition') && entry.params?.protectedRouteName) {
                routeName = entry.params?.protectedRouteName;
            } else {
                routeName = entry.routeName;
            }

            return (
                <SideMenuEntry
                    active={routeName === this.state.currentRouteName}
                    animate={this.props.animItems}
                    index={index}
                    key={`side-menu-entry-${index}`}
                    entry={entry}
                    setDrawerOpened={this.props.setDrawerOpened}
                />
            );
        });

        return (
            <ScrollView
                contentContainerStyle={styles.entriesInner}
                decelerationRate={'fast'}
                overScrollMode={'never'}
                showsVerticalScrollIndicator={false}
                style={styles.entries}
            >
                { items }
            </ScrollView>
        );
    }

    private get settings (): JSX.Element {
        const backgroundColor = this.state.currentRouteName === 'Settings' ?
            chroma(colors.pink).brighten(0.25) :
            chroma('white').alpha(0.15);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={debounce(this.onPressSettings, 500, { 'leading': true, 'trailing': false })}
                style={[styles.settings, { backgroundColor }]}
            >
                <View style={styles.settingsIconContainer}>
                    <Image source={GEAR_ICON} style={styles.settingsIcon} />
                </View>
                <Text style={styles.settingsLabel}>{ i18n.t('menu.settings') }</Text>
            </TouchableOpacity>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                { this.header }
                { this.entries }
                { this.settings }
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    firstName: state.userProfile.firstName,
    lastName: state.userProfile.lastName,
    picture: state.userProfile.picture,
    pinCodeEnabled: state.userProfile.pinCodeEnabled
});

export default connect(mapStateToProps, { setDrawerOpened })(SideMenu);
