import { isReleaseBundleID } from './bundleId';
import { isAndroid } from './os';

const IS_PROD = isReleaseBundleID();

export const AWS_CDN_URL = IS_PROD ? 'https://cdn.nuli.app/' : 'https://cdn.staging.nuli.app/';

export const STORE_URL = isAndroid ?
    'https://play.google.com/store/apps/details?id=com.nuli.app' :
    'https://itunes.apple.com/app/id1492681304';

export const UNSUBSCRIBE_URL = isAndroid ?
    'https://play.google.com/store/account/subscriptions?package=PACKAGE_NAME&sku=PRODUCT_ID' :
    'https://apps.apple.com/account/subscriptions';

export const FEEDBACK_EMAIL = IS_PROD ? 'feedback@nuli.app' : 'feedback.beta@nuli.app';
export const SUPPORT_EMAIL = 'support@nuli.app';

const WEBSITE_BASE_URL = 'https://nuli.app/';
export const PRIVACY_POLICY_URL = `${WEBSITE_BASE_URL}privacy-policy/`;
export const TERMS_URL = `${WEBSITE_BASE_URL}terms/`;
export const FAQ_URL = `${WEBSITE_BASE_URL}faq-support/`;

export const CSLFIT_URL = WEBSITE_BASE_URL;
export const MELIORENCE_URL = 'https://www.meliorence.com/';

export const LOGIN_IMAGE_URL = 'https://i.imgur.com/H09AcHZ.png';
