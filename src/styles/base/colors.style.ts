import chroma from 'chroma-js';

const black: string = '#101012';
const blue: string = '#006FC0';
const blueDark: string = '#8A64E8';
const blueLight: string = '#64E8DE';
const blueVeryLight: string = '#6EC5E0';
const gray: string = '#494a4d';
const grayDark: string = '#2A2C31'; // '#353638'
const grayLight: string = '#A8A9AD';
const grayVeryLight: string = '#e8e9ed';
const grayUltraLight: string = '#f0f1f5';
const grayBlueDark: string = '#3b3e4c';
const orange: string = '#F5727D';
const orangeDark: string = '#FE6F61';
const orangeLight: string = '#ffb299';
const orangeVeryLight: string = '#FFE5DC';
const pink: string = '#D57EEA';
const pinkLight: string = chroma(pink).desaturate(1.2).brighten(0.65).css();
const pinkVeryLight: string = '#F7EBFA';
const violetDark: string = '#4E30C5';
const violetLight: string = '#DCB0FF';
const violetVeryLight: string = '#B9ACD6'; // #FFCFF7
const violetUltraLight: string = '#F3E3FF';
const white: string = '#ffffff';
const highlight: string = pink;
const error = '#bc4e9c';

export default {
    main: black,
    background: white,
    textPrimary: grayDark,
    textSecondary: gray,
    header: white,
    overlay: black,
    black,
    blue,
    blueDark,
    blueLight,
    blueVeryLight,
    gray,
    grayDark,
    grayLight,
    grayVeryLight,
    grayUltraLight,
    grayBlueDark,
    orange,
    orangeDark,
    orangeLight,
    orangeVeryLight,
    pink,
    pinkLight,
    pinkVeryLight,
    violetDark,
    violetLight,
    violetVeryLight,
    violetUltraLight,
    white,
    highlight,
    error
};
