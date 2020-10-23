import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';
import i18n from '../../utils/i18n';
import { debounce } from 'lodash';

import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';
import TouchableScale from '../TouchableScale';

import styles, { BUTTON_GRADIENT } from '../../styles/components/Popups/PostRegistration.style';
import workoutRestPopupStyles from '../../styles/components/Workout/WorkoutRestPopup.style';

const ICON = require('../../static/icons/gift.png');

export interface IProps {
    dismissPopup: () => void;
}

class PostRegistration extends PureComponent<IProps> {

    private onPress = (): void => {
        const { dismissPopup } = this.props;
        dismissPopup && dismissPopup();
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <FadeInImage
                    containerCustomStyle={workoutRestPopupStyles.icon}
                    resizeMode={'contain'}
                    source={ICON}
                    // tintColor={TEXT_COLOR}
                />
                <Text style={styles.title}>
                    { i18n.t('registration.postRegistrationTitle') }
                </Text>
                <Text style={styles.message}>
                    { i18n.t('registration.postRegistrationMessage') }
                </Text>
                <TouchableScale
                    activeOpacity={0.85}
                    onPress={debounce(this.onPress, 500, { 'leading': true, 'trailing': false })}
                    style={styles.buttonContainer}
                >
                    <DiffuseShadow
                        borderRadius={styles.button.borderRadius}
                        horizontalOffset={30}
                        shadowOpacity={0.2}
                        verticalOffset={10}
                    />
                    <View style={styles.button}>
                        <LinearGradient
                            angle={120}
                            colors={BUTTON_GRADIENT}
                            style={[styles.fullSpace, styles.gradient]}
                            useAngle={true}
                        />
                        <Text style={styles.buttonLabel}>
                            { i18n.t('registration.postRegistrationButton') }
                        </Text>
                    </View>
                </TouchableScale>
                <Text style={styles.note}>
                    { i18n.t('registration.postRegistrationNote') }
                </Text>
            </View>
        );
    }
}

export default PostRegistration;
