import I18n, { getLanguageFromLocale } from '../../utils/i18n';

export type TTargetedTrainingId = 'abs' | 'arms' | 'back' | 'glutes' | 'legs' | 'lower body' | 'upper body' | 'shoulders'

interface IProps {
    areas: string[];
    id: TTargetedTrainingId;
    image: any;
    slug: string[];
    title: string;
}

const TARGETED_TRAINING_ABS = require('../../static/Training/targeted-areas-abs.png');
const TARGETED_TRAINING_ARMS = require('../../static/Training/targeted-areas-arms.png');
const TARGETED_TRAINING_BACK = require('../../static/Training/targeted-areas-back.png');
const TARGETED_TRAINING_GLUTES = require('../../static/Training/targeted-areas-glutes.png');
const TARGETED_TRAINING_LEGS = require('../../static/Training/targeted-areas-legs.png');
const TARGETED_TRAINING_SHOULDERS = require('../../static/Training/targeted-areas-shoulders.png');

export default class TargetedTrainingItem implements IProps {
    public areas: string[];
    public id: TTargetedTrainingId;
    public image: string;
    public slug: string[];
    public title: string;

    constructor (props: IProps) {
        this.id = props.id;
        this.image = props.image;
        this.slug = props.slug;
        this.title = props.title;
        this.areas = props.areas;
    }

    public getAreasString (): string {
        if (this.areas && this.areas.length) {
            let areasString: string = undefined;
            this.areas.forEach((area: string, index: number) => {
                let areaFormatted: string = I18n.t(`training.targetedTraining.areas.${area}`);
                if (!I18n.locale.startsWith('zh-')) {
                    areaFormatted = areaFormatted.toLowerCase().replace(/^./, area[0].toUpperCase());
                }
                areasString = areasString === undefined ? areaFormatted : areasString + ', ' + areaFormatted;
            });
            return areasString;
        }
    }
}

export function getAllTargetedTrainingItems (): TargetedTrainingItem[] {
    const abs = new TargetedTrainingItem({
        areas: ['abs', 'core'],
        id: 'abs',
        image: TARGETED_TRAINING_ABS,
        slug: ['abs'],
        title: I18n.t('training.targetedTraining.areas.abs')
    });
    const arms = new TargetedTrainingItem({
        areas: ['forearm', 'triceps', 'biceps'],
        id: 'arms',
        image: TARGETED_TRAINING_ARMS,
        slug: ['arms'],
        title: I18n.t('training.targetedTraining.areas.arms')
    });
    const back = new TargetedTrainingItem({
        areas: ['lats', 'traps'],
        id: 'back',
        image: TARGETED_TRAINING_BACK,
        slug: ['back'],
        title: I18n.t('training.targetedTraining.areas.back')
    });
    const glutes = new TargetedTrainingItem({
        areas: ['glutes'],
        id: 'glutes',
        image: TARGETED_TRAINING_GLUTES,
        slug: ['glutes'],
        title: I18n.t('training.targetedTraining.areas.glutes')
    });
    const legs = new TargetedTrainingItem({
        areas: ['calves', 'abductors', 'quads', 'adductors', 'hamstrings'],
        id: 'legs',
        image: TARGETED_TRAINING_LEGS,
        slug: ['legs'],
        title: I18n.t('training.targetedTraining.areas.legs')
    });
    const lowerBody = new TargetedTrainingItem({
        areas: ['calves', 'abductors', 'quads', 'adductors', 'hamstrings'],
        id: 'lower body',
        image: TARGETED_TRAINING_LEGS,
        slug: ['lower-body'],
        title: I18n.t('training.targetedTraining.areas.lowerBody')
    });
    const shoulders = new TargetedTrainingItem({
        areas: ['shoulders'],
        id: 'shoulders',
        image: TARGETED_TRAINING_SHOULDERS,
        slug: ['shoulders'],
        title: I18n.t('training.targetedTraining.areas.shoulders')
    });
    const upperBody = new TargetedTrainingItem({
        areas: ['forearm', 'triceps', 'biceps'],
        id: 'upper body',
        image: TARGETED_TRAINING_ARMS,
        slug: ['upper-body'],
        title: I18n.t('training.targetedTraining.areas.upperBody')
    });

    // Return only a few of the available tags for the moment
    return [abs, lowerBody, upperBody];
}
