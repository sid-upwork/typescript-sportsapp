import React, { Component } from 'react';

import Popup, { IPopupParams } from './Popup';

interface IProps {}

interface IState {
    currentPopup: IPopupParams;
}

class PopupManager extends Component<IProps, IState> {

    public currentPopupRef: React.RefObject<Popup>;
    public popupBacklog: IPopupParams[];
    // This flag prevents a popup from getting skipped if requestPopup() is called while currentPopup is being set
    public settingCurrentPopup: boolean;

    constructor (props: IProps) {
        super(props);
        this.state = {
            currentPopup: null
        };
        this.currentPopupRef = React.createRef();
        this.popupBacklog = [];
        this.settingCurrentPopup = false;
    }

    public get currentPopup (): IPopupParams {
        return this.state.currentPopup;
    }

    public requestPopup (params: IPopupParams): void {
        const { currentPopup } = this.state;

        if (currentPopup === null && !this.settingCurrentPopup) {
            // If no popup is currently opened we display a new one
            this.settingCurrentPopup = true;
            this.setState({ currentPopup: params }, () => { this.settingCurrentPopup = false; });
        } else {
            // If a popup is already open, we add this one to the backlog
            this.popupBacklog = [params, ...this.popupBacklog];
        }
    }

    public dismissPopup (): void {
        if (this.currentPopupRef && this.currentPopupRef.current) {
            this.currentPopupRef.current.dismiss();
        }
    }

    public emptyBacklog (): void {
        this.popupBacklog = [];
        this.dismissPopup();
    }

    private onPopupDismissed = (): void => {
        if (this.popupBacklog.length > 0) {
            // If we have more popups in the backlog we update currentPopup
            this.settingCurrentPopup = true;
            this.setState({ currentPopup: this.popupBacklog[0] }, () => {
                // We remove the popup we just opened from the backlog
                this.popupBacklog.shift();
                this.settingCurrentPopup = false;
            });
        } else {
            // Otherwise we just empty currentPopup
            this.setState({ currentPopup: null });
        }

        this.currentPopupRef = React.createRef();
    }

    public render (): JSX.Element {
        const { currentPopup } = this.state;

        return currentPopup ? (
            <Popup
                onPopupDismissed={this.onPopupDismissed}
                params={currentPopup}
                ref={this.currentPopupRef}
            />
        ) : null;
    }
}

export default PopupManager;
