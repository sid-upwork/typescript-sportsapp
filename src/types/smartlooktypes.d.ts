declare module 'smartlook-react-native-wrapper' {
    import {Component} from 'react';

    export type ComponentReference = React.Component<any, any> | React.ComponentClass<any>;
    export type NavigationEvent = 'enter' | 'exit';

    class Smartlook extends Component<Smartlook> {
        // SETUP

        /**
         * Initializes Smartlook
         * @param apiKey {string} unique 40 character key identifying your app (can be found in the dashboard)
         * @param fps {string=} framerate of screen capturing in frames per second (allowed values between 2 and 10)
         */
        public static setup(apiKey: string, fps: number | null): void;

        /**
         * Initializes Smartlook and starts recording events and screen recording
         * @param apiKey {string} unique 40 character key identifying your app (can be found in the dashboard)
         * @param fps {string} framerate of screen capturing in frames per second (allowed values between 2 and 10)
         */
        public static setupAndStartRecording(apiKey: string, fps: number): void;

        /**
         * Specifies a key used to find specific user’s recordings in the Dashboard
         * @param idKey {string} used to identify the user in the dashboard
         * @param sessionProperties {object=} additional user information, such as name, email and other custom properties
         */
        public static setUserIdentifier(idKey: string, sessionProperties?: object | null): void;

        // START & STOP

        /**
         * Starts recording events and screen recording
         */
        public static startRecording(): void;

        /**
         * Stops screen recording
         */
        public static stopRecording(): void;

        /**
         * Evaluates if the SDK is currently recording or not
         */
        public static isRecording(): Promise<boolean>;

        // ANALYTICS

        /**
         * Measures the duration of any time-sensitive or long-running action events
         * @param eventName {string} name of the event to be measured
         */
        public static timeEvent(eventName: string): void;

        /**
         * Registers a custom event with the given additional properties
         * @param eventName {string} name used to identify the event being monitored
         * @param properties {object=} supplemental properties to be associated with the event
         */
        public static trackCustomEvent(eventName: string, properties: object | null): void;

        /**
         * Tracks transition between screens
         * @param screenName {string} name of the screen
         * @param type {NavigationEvent} either 'enter' or 'exit', where the latter also records the duration from the previous corresponding 'enter' event
         */
        public static trackNavigationEvent(screenName: string, type: NavigationEvent): void;

        // SENSITIVE MODE

        /**
         * Prevents the SDK from video recording any screen at all. Keeps recording events.
         */
        public static startFullscreenSensitiveMode(): void;

        /**
         * Instructs the SDK to start video recording screens again
         */
        public static stopFullscreenSensitiveMode(): void;

        /**
         * Checks if the screen video recording is enabled.
         */
        public static isFullscreenSensitiveModeActive(): boolean;

        /**
         * Enables video recording of WebViews. Note that this is disabled by default.
         * @param enabled {boolean} flag determining whether WebView video recording should be enabled
         */
        public static enableWebviewRecording(enabled: boolean): void;

        /**
         * Blacklists screen from being recorded
         * @param component {Component} screen component reference
         */
        public static markViewAsSensitive<T>(component: ComponentReference): void;

        /**
         * Removes screen from recording blacklist
         * @param component {Component} screen component reference
         */
        public static unmarkViewAsSensitive(component: ComponentReference): void;

        // GLOBAL EVENT PROPERTIES

        /**
         * Sets properties that will be added to every event sent from the SDK in the future.
         */
        public static setGlobalProperties(properties: object): void;

        /**
         * Sets properties that will be added to every event sent from the SDK in the future.
         * Such properties have higher priority so in merging process those from global scope
         * will override custom properties with the same key. Note that immutable properties
         * have the highest priority and once set they cannot be overridden (only removed).
         * @param properties {object} key-value immutable properties to be added to the global scope
         */
        public static setGlobalImmutableProperties(properties: object): void;

        /**
         * Removes some global property from a given key
         * @param key {string} the property name
         */
        public static removeSuperPropertyByKey(key: string): void;

        /**
         * Remove all registered global event properties
         */
        public static removeAllSuperProperties(): void;

        // OTHERS

        /**
         * Obtains the URL leading to the dashboard for a currently recorded session
         */
        public static getDashboardSessionUrl(): string;

        /**
         * Sets custom referrer value and source of the current installation
         * @param referrer {string} custom referrer name
         * @param source {string} custom source
         */
        public static setReferrer(referrer: string, source: string): void;

        /**
         * Enables the integration with Crashlytics
         * @param enabled flag determining whether or not the Crashlytics integration should be active
         */
        public static enableCrashlytics(enabled: boolean): void;
    }

    export default Smartlook;
}
