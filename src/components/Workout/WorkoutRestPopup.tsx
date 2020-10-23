import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';
import i18n from '../../utils/i18n';

import FadeInImage from '../FadeInImage';

import styles from '../../styles/components/Workout/WorkoutRestPopup.style';

const DURATION = 2200;
const ICON = require('../../static/icons/biceps.png');

export interface IProps {
    dismissPopup: () => void;
}

class WorkoutRestPopup extends PureComponent<IProps> {

    private visibilityTimer: any;

    public componentDidMount (): void {
        this.visibilityTimer = setTimeout(() => {
            this.props.dismissPopup();
        }, DURATION);
    }

    public componentWillUnmount (): void {
        clearTimeout(this.visibilityTimer);
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <FadeInImage
                    containerCustomStyle={styles.icon}
                    resizeMode={'contain'}
                    source={ICON}
                    // tintColor={TEXT_COLOR}
                />
                <Text style={styles.title}>
                    { i18n.t('workout.restCompleteTitle') }
                </Text>
                <Text style={styles.message}>
                    { i18n.t('workout.restCompleteMessage') }
                </Text>
            </View>
        );
    }
}

export default WorkoutRestPopup;
