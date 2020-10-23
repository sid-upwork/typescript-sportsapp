import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';
import i18n from '../../utils/i18n';

import FadeInImage from '../FadeInImage';

import thankYouStyles from '../../styles/components/Popups/ThankYou.style';
import workoutRestPopupStyles from '../../styles/components/Workout/WorkoutRestPopup.style';

const ICON = require('../../static/icons/biceps.png');

export interface IProps {
    dismissPopup: () => void;
}

class PostRegistrationChooseProgram extends PureComponent<IProps> {

    public render (): JSX.Element {
        return (
            <View style={thankYouStyles.container}>
                <FadeInImage
                    containerCustomStyle={workoutRestPopupStyles.icon}
                    resizeMode={'contain'}
                    source={ICON}
                    // tintColor={TEXT_COLOR}
                />
                <Text style={thankYouStyles.title}>
                    { i18n.t('programSelection.postRegistrationTitle') }
                </Text>
                <Text style={thankYouStyles.message}>
                    { i18n.t('programSelection.postRegistrationMessage') }
                </Text>
            </View>
        );
    }
}

export default PostRegistrationChooseProgram;
