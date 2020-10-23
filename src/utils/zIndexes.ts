import { isAndroid } from './os';

export default {
    header: isAndroid ? 0 : 20 // Android and zindex...
};
