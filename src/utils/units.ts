import { store } from '../index';
import I18n from './i18n';
import { TUnitsSystems } from '../types/user';

export function getSetWeightUnit (): string {
    const unitSystem: TUnitsSystems = store?.getState().userProfile?.unitSystem;

    if (unitSystem === 'imperial') {
        return I18n.t('global.units.lbs');
    } else {
        return I18n.t('global.units.kg');
    }
}

export function getSetWeightUnitSystem (): TUnitsSystems {
    return store?.getState().userProfile?.unitSystem === 'imperial' ? 'imperial' : 'metric';
}

export function getConvertedSetWeight (kilos: number): number {
    if (!kilos) {
        return 0;
    }

    const unitSystem: TUnitsSystems = store?.getState().userProfile?.unitSystem;

    if (unitSystem === 'imperial') {
        return roundToOneDecimal(kilosToPounds(kilos));
    } else {
        return roundToOneDecimal(kilos);
    }
}

export function getFormatedSetWeight (kilos: number): string {
    if (typeof kilos === 'undefined') {
        return '';
    }

    const unitSystem: TUnitsSystems = store?.getState().userProfile?.unitSystem;

    if (unitSystem === 'imperial') {
        return roundToOneDecimal(kilosToPounds(kilos)) + ' ' + I18n.t('global.units.lbs');
    } else {
        return roundToOneDecimal(kilos) + ' ' + I18n.t('global.units.kg');
    }
}

export function getFormatedRecipeWeight (grams: number): string {
    if (typeof grams === 'undefined') {
        return '';
    }

    const unitSystem: TUnitsSystems = store?.getState().userProfile?.unitSystem;

    if (grams >= 1000) {
        if (unitSystem === 'imperial') {
            return roundToOneDecimal(kilosToOunces(grams / 1000)) + ' ' + I18n.t('global.units.oz');
        } else {
            return roundToOneDecimal(grams / 1000) + ' ' + I18n.t('global.units.kg');
        }
    } else {
        if (unitSystem === 'imperial') {
            return roundToOneDecimal(gramsToOunces(grams)) + ' ' + I18n.t('global.units.oz');
        } else {
            return roundToOneDecimal(grams) + ' ' + I18n.t('global.units.g');
        }
    }
}

export function getFormatedRecipeVolume (milliliters: number): string {
    const unitSystem: TUnitsSystems = store?.getState().userProfile?.unitSystem;

    if (unitSystem === 'imperial') {
        return roundToOneDecimal(millilitersToOunces(milliliters)) + ' ' + I18n.t('global.units.oz');
    } else {
        return roundToOneDecimal(milliliters) + ' ' + I18n.t('global.units.ml');
    }
}

// Conversion functions
export function kilosToPounds (kilos: number): number {
    return kilos * 2.2046;
}

export function PoundsToKilos (pounds: number): number {
    return pounds / 2.2046;
}

export function gramsToOunces (grams: number): number {
    return grams * 0.035274;
}

export function kilosToOunces (kilos: number): number {
    return kilos * 35.274;
}

export function millilitersToOunces (milliliters: number): number {
    return milliliters * 0.033814;
}

export function roundToOneDecimal (value: number): number {
    return Math.round(value * 10) / 10;
}
