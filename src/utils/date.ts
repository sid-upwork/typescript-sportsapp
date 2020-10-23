import moment from 'moment';
import I18n, { getLanguageFromLocale } from '../utils/i18n';

export interface ITime {
    h: number;
    m: number;
    s: number;
}

/** Returns a new UTC date */
export function getNewUTCDate (): string {
    return moment.utc().format();
}

/**
 * Returns a new local date.
 *
 * Should not be used for storage!
 */
export function getNewLocalDate (): string {
    return moment().format();
}

/**
 * Converts a UTC date to a local date
 *
 * Should not be used for storage!
 */
export function convertUTCDatetoLocalDate (date: string): string {
    return moment.utc(date).local().format();
}

/** Converts a date to a UTC date */
export function convertDateToUTC (date: string): string {
    return moment.utc(date).format();
}

/**
 * Formats a date to prepare it for the API
 *
 * (If no date is provided, a new UTC date will be generated)
 */
export function formatDateForAPI (date?: string): string {
    const dateToFormat = date || getNewUTCDate();
    return moment.utc(dateToFormat).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Returns a formated local date.
 *
 * (If no date is provided, a new local date will be generated)
 *
 * Should not be used for storage!
 */
export function getFormattedDate (date?: string | number, customFormat?: string, unix?: number): string {
    const isChinese = getLanguageFromLocale(I18n.locale).shortName === 'zh';
    let dateToFormat;
    if (unix) {
        dateToFormat = moment.unix(unix).local();
    } else if (date) {
        dateToFormat = moment(date).local();
    } else {
        dateToFormat = moment();
    }
    const format = customFormat || (isChinese ? 'll' : 'MMM. D');
    return dateToFormat.format(format);
}

export function getDateFromUnix (unix?: number): Date {
    if (!unix || typeof unix !== 'number') {
        return new Date();
    }
    return moment.unix(unix).local().toDate();
}

export function convertMsToTime (ms: number): ITime {
    const milliseconds = ms % 1000;
    const ms1 = (ms - milliseconds) / 1000;
    const seconds = ms1 % 60;
    const ms2 = (ms1 - seconds) / 60;
    const minutes = ms2 % 60;
    const hours = (ms2 - minutes) / 60;

    return {
        h: hours,
        m: minutes,
        s: seconds
    };
}

export function convertTimeToSeconds (time: ITime): number {
    if (!time) {
        return 0;
    }
    const hours = time.h ? time.h * 3600 : 0;
    const minutes = time.m ? time.m * 60 : 0;
    const seconds = time.s ? time.s : 0;
    return hours + minutes + seconds;
}

export function convertSecondsToTimeLabel (seconds: number, showHours?: boolean): string {
    if (seconds !== 0 && !seconds) {
        return '';
    }
    const pad = (n: number, c: number = 2) => `00${n}`.slice(-c);
    const time = convertMsToTime(seconds * 1000);
    const hours = showHours || seconds >= 3600 ? pad(time.h) + ':' : '';
    return `${hours}${pad(time.m)}:${pad(time.s)}`;
}
