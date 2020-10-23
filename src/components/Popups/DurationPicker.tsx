import React, { Component } from 'react';
import { Picker, View, Text } from 'react-native';

import colors from '../../styles/base/colors.style';
import styles from '../../styles/components/Popups/DurationPicker.style';

interface IProps {
    onValueChange: (seconds: number) => void;
    initialTime: number;
}

interface IState {
    minutes: string;
    seconds: string;
}

class DurationPicker extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);

        const initalMinutes = Math.floor(props.initialTime / 60).toString();
        const initalSeconds = (props.initialTime % 60).toString();

        this.state = {
            minutes: initalMinutes || '0',
            seconds: initalSeconds || '0'
        };
    }

    private onSecondsChange = (itemValue: string): void => {
        this.setState({ seconds: itemValue }, () => this.onValueChange());
    }

    private onMinutesChange = (itemValue: string): void => {
        this.setState({ minutes: itemValue }, () => this.onValueChange());
    }

    private onValueChange = (): void => {
        const { minutes, seconds } = this.state;

        this.props.onValueChange((parseInt(minutes, 10) * 60) + parseInt(seconds, 10));
    }

    private getPicker (type: 'minutes' | 'seconds'): JSX.Element {
        const items = [];

        for (let i = 0; i < 60; i++) {
            items.push(
                <Picker.Item
                    key={`duration-picker-${type}-${i}`}
                    label={i.toString()}
                    value={i}
                />
            );
        }

        const onValueChange = type === 'minutes' ? this.onMinutesChange : this.onSecondsChange;
        const selectedValue = type === 'minutes' ? parseInt(this.state.minutes, 10) : parseInt(this.state.seconds, 10);

        return (
            <Picker
                itemStyle={styles.item}
                mode={'dropdown'}
                onValueChange={onValueChange}
                selectedValue={selectedValue}
                style={styles.picker}
            >
                { items }
            </Picker>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                { this.getPicker('minutes') }
                <Text style={styles.seperator}>:</Text>
                { this.getPicker('seconds') }
            </View>
        );
    }
}

export default DurationPicker;
