import React, { Component } from 'react';
import { Appearance, Picker } from 'react-native';

import colors from '../../styles/base/colors.style';

interface INativePickerItem {
    label: string;
    value: string | number;
}

interface IProps {
    items: INativePickerItem[];
    itemStyle?: any;
    onValueChange: (itemValue: string | number, itemIndex: number) => void;
    selectedValue?: string | number;
    style?: any;
}

interface IState {
    value: string | number;
}

class NativePicker extends Component<IProps, IState> {

    private isDarkMode: boolean;

    constructor (props: IProps) {
        super(props);
        this.isDarkMode = Appearance.getColorScheme() === 'dark';
        this.state = {
            value: props.selectedValue || props.items[0].value
        };
    }

    private onValueChange = (itemValue: string | number, itemIndex: number): void => {
        const { onValueChange } = this.props;
        this.setState({ value: itemValue });
        onValueChange && onValueChange(itemValue, itemIndex);
    }

    private get items (): JSX.Element[] {
        const { items } = this.props;
        let pickerItems = [];

        items.forEach((item: INativePickerItem, index: number) => {
            pickerItems.push(
                <Picker.Item key={`native-picker-item-${index}`} label={item.label} value={item.value} />
            );
        });

        return pickerItems;
    }

    public render (): JSX.Element {
        const { style, itemStyle } = this.props;

        return (
            <Picker
                itemStyle={[{ color: this.isDarkMode ? 'white' : colors.black }, itemStyle]}
                mode={'dropdown'}
                onValueChange={this.onValueChange}
                selectedValue={this.state.value}
                style={style}
            >
                { this.items }
            </Picker>
        );
    }
}

export default NativePicker;
