// For `react-native-svg-transformer``
// See https://github.com/kristerkari/react-native-svg-transformer#using-typescript
declare module '*.svg' {
    import { SvgProps } from 'react-native-svg';
    const content: React.FC<SvgProps>;
    export default content;
}
