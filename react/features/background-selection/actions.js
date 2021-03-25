import { jitsiLocalStorage } from '@jitsi/js-utils';
import axios from 'axios';
import tokenLocalStorage from '../../api/tokenLocalStorage';
import { setJWT } from '../base/jwt/actions';
import { getLocalVideoTrack } from '../base/tracks';
import { createBackgroundEffectV2 } from '../stream-effects/background-v2';

const apiBase = process.env.VMEETING_API_BASE;

/**
 * Submits the settings related to background selection.
 *
 * @param {Object} newState - The new settings.
 * @returns {Function}
 */
export function submitBackgroundSelectionTab(newState) {
    return (dispatch, getState) => {
        const { user } = getState()['features/base/jwt'];
        const { selectedBackgroundId: background } = newState;
        const { conference } = getState()['features/base/conference'];
        const applyBackgroundEffect = () => {
            const localTrack = getLocalVideoTrack(getState()['features/base/tracks']);
    
            if (conference && localTrack && localTrack.jitsiTrack) {
                if (background) {
                    const backgroundImageUrl = `${apiBase}/backgrounds/${background}/hd`;
    
                    createBackgroundEffectV2(backgroundImageUrl).then(effect => {
                        localTrack.jitsiTrack.setEffect(effect);
                    })
                } else {
                    localTrack.jitsiTrack.setEffect(undefined);
                }
            }
        };

        console.log('submitBackgroundSelectionTab:', newState);
        const oldBackground = user
            ? user.background
            : jitsiLocalStorage.getItem('background');

        if (oldBackground === background) return;

        if (user) {
            axios.patch(`${apiBase}/account`, { background })
            .then(resp => {
                dispatch(setJWT(resp.data));
                tokenLocalStorage.setItem(resp.data, getState());
                applyBackgroundEffect();
            })
        } else {
            jitsiLocalStorage.setItem('background', background);
            applyBackgroundEffect();
        }
    };
}
