import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';

import chroma from 'chroma-js';
import { _constructStyles } from 'react-native-render-html/src/HTMLStyles';
import HTMLImage from 'react-native-render-html/src/HTMLImage';
import FadeInImage from './FadeInImage';
import DiffuseShadow from './DiffuseShadow';

import colors from '../styles/base/colors.style';
import styles, { IMAGE_RADIUS } from '../styles/base/html.style';

import ImageBackground from '../static/Article/html-image_background.svg';

const BULLET = require('../static/icons/bullet.png');
const QUOTE = require('../static/Article/quote.png');

export default () => {
    return {
        // Same as https://github.com/archriss/react-native-render-html/blob/master/src/HTMLRenderers.js#L6-L33
        // With a specific `activeOpacity`
        a (htmlAttribs, children, convertedCSSStyles, passProps) {
            const style = _constructStyles({
                tagName: 'a',
                htmlAttribs,
                passProps,
                styleSet: passProps.parentWrapper === 'Text' ? 'TEXT' : 'VIEW'
            });
            // !! This deconstruction needs to happen after the styles construction since
            // the passed props might be altered by it !!
            const { parentWrapper, onLinkPress, key, data } = passProps;
            const onPress = (evt) => onLinkPress && htmlAttribs && htmlAttribs.href ?
                onLinkPress(evt, htmlAttribs.href, htmlAttribs) :
                undefined;

            if (parentWrapper === 'Text') {
                return (
                    <Text {...passProps} style={style} onPress={onPress} key={key}>
                        { children || data }
                    </Text>
                );
            } else {
                return (
                    <TouchableOpacity onPress={onPress} key={key} activeOpacity={0.7}>
                        { children || data }
                    </TouchableOpacity>
                );
            }
        },
        br (htlmAttribs, children, convertedCSSStyles, passProps) {
            return null;
            // return (
            //     <Text
            //         key={passProps.key}
            //         style={{ height: 1.2 * passProps.emSize, flex: 1 }}
            //     >
            //         { '\n' }
            //     </Text>
            // );
        },
        blockquote: (htmlAttribs, children, convertedCSSStyles, passProps) => {
            const { key } = passProps;
            return (
                <View style={styles.blockquoteContainer} key={key}>
                    <Image
                        source={QUOTE}
                        style={styles.blockquoteImage}
                    />
                    <View style={styles.blockquoteTextContainer}>
                        { children }
                    </View>
                </View>
            );
        },
        img: (htmlAttribs, children, convertedCSSStyles, passProps) => {
            if (!htmlAttribs.src) {
                return false;
            }

            const { key } = passProps;
            const style = _constructStyles({
                tagName: 'img',
                htmlAttribs,
                passProps,
                styleSet: 'IMAGE'
            });
            const image = <HTMLImage source={{ uri: htmlAttribs.src }} style={style} {...passProps} />;

            return (
                <View style={styles.imgContainer} key={key}>
                    <ImageBackground style={styles.imgBackground} />
                    <View style={styles.img}>
                        <DiffuseShadow
                            horizontalOffset={Math.round(IMAGE_RADIUS * 1.5)}
                            verticalOffset={25}
                            borderRadius={IMAGE_RADIUS}
                            shadowOpacity={0.35}
                            color={chroma(colors.violetDark).darken(1.5).desaturate(1).css()}
                        />
                        { image }
                    </View>
                </View>
            );
        },
        ul: (htmlAttribs, children, convertedCSSStyles, passProps) => {
            const { rawChildren, nodeIndex, key } = passProps;
            children = children && children.map((child: any, index: number) => {
                const rawChild = rawChildren[index];
                let prefix: any = null;

                if (rawChild && rawChild.tagName === 'li') {
                    prefix = (
                        <FadeInImage
                            source={BULLET}
                            containerCustomStyle={styles.ulBullet}
                        />
                    );
                }

                return (
                    <View key={`list-${nodeIndex}-${index}-${key}`} style={styles.ulContainerInner}>
                        { prefix }
                        <View style={{ flex: 1 }}>{ child }</View>
                    </View>
                );
            });
            return (
                <View style={styles.ulContainer} key={key}>
                    { children }
                </View>
            );
        },
        ol: (htmlAttribs, children, convertedCSSStyles, passProps) => {
            const { rawChildren, nodeIndex, key } = passProps;
            children = children && children.map((child: any, index: number) => {
                const rawChild = rawChildren[index];
                let prefix: any = null;

                if (rawChild && rawChild.tagName === 'li') {
                    prefix = (
                        <View style={styles.olBullet}>
                            <Text style={styles.olBulletNumber}>{ index + 1 }.</Text>
                        </View>
                    );
                }

                return (
                    <View key={`list-${nodeIndex}-${index}-${key}`} style={styles.olContainerInner}>
                        { prefix }
                        <View style={{ flex: 1 }}>{ child }</View>
                    </View>
                );
            });
            return (
                <View style={styles.olContainer} key={key}>
                    { children }
                </View>
            );
        },
        aside: (htmlAttribs, children, convertedCSSStyles, passProps) => {
            const { key } = passProps;
            return (
                <View style={styles.asideWrapper} key={key}>
                    <View style={styles.asideBorder} />
                    <View style={styles.asideContainer}>
                        {children}
                    </View>
                </View>
            );
        }
    };
};
