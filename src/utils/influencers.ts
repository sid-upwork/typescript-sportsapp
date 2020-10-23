import api from '../utils/api';
import { AxiosResponse } from 'axios';
import { ENDPOINTS } from '../utils/endpoints';
import { IInfluencer } from '../types/user';
import { store } from '../index';
import { setInfluencers } from '../store/modules/influencers';

export function getTouchIdFromTouchLink (link: string): string {
    if (!link) {
        return undefined;
    } else {
        // URL will look like this: https://link.nuli.app/?influencer=candice
        // Or this: https://com.nuli.app/?link=https://link.nuli.app/?influencer%3Dcandice&apn=com.nuli.app&...
        // We use `decodeURIComponent()` first to avoid issues with `%3D` instead of `=` in some URLs
        const param = 'influencer';
        const afterParam = decodeURIComponent(link).split(`${param}=`)[1];
        const match = afterParam && afterParam.match(/[A-Za-z0-9]+/i);
        return match && match[0] && match[0].toLowerCase();
    }
}

export async function refreshInfluencers (): Promise<IInfluencer[]> {
    const influencersResponse: AxiosResponse = await api.get(ENDPOINTS.influencers);
    const FALLBACK_COLORS = [
        { color1: '#FE6F61', color2: '#D57EEA'},
        { color1: '#64E8DE', color2: '#8A64E8'},
        { color1: '#FFFADE', color2: '#FFCFF7'},
        { color1: '#FFCFA5', color2: '#EE4D5F'}
    ];

    // Temporary influencer colors for testing
    influencersResponse.data.forEach((influencer: IInfluencer, index: number) => {
        const cappedIndex = Math.abs(index % FALLBACK_COLORS.length);
        if (!influencer.primaryColor) {
            influencer.primaryColor = FALLBACK_COLORS[cappedIndex].color1;
        }
        if (!influencer.secondaryColor) {
            influencer.secondaryColor = FALLBACK_COLORS[cappedIndex].color2;
        }
    });

    store && store.dispatch(setInfluencers(influencersResponse.data));

    return influencersResponse.data;
}
