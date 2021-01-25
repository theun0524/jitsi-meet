import { jitsiLocalStorage } from '@jitsi/js-utils';
import axios from 'axios';
import tokenLocalStorage from '../../api/tokenLocalStorage';
import { setJWT } from '../base/jwt/actions';
import { getLocalVideoTrack } from '../base/tracks';
import { createBackgroundEffect } from '../stream-effects/background';

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

        console.log('submitBackgroundSelectionTab:', newState);
        axios.patch(`${apiBase}/account`, { background })
        .then(resp => {
            dispatch(setJWT(resp.data));
            tokenLocalStorage.setItem(resp.data, getState());

            const localTrack = getLocalVideoTrack(getState()['features/base/tracks']);

            if (conference && localTrack && localTrack.jitsiTrack) {
                console.log('submitBackgroundSelectionTab:', localTrack);
                if (background) {
                    const backgroundImageUrl = `${apiBase}/backgrounds/${background}/hd`;
    
                    createBackgroundEffect(backgroundImageUrl).then(effect => {
                        localTrack.jitsiTrack.setEffect(effect);
                    })
                } else {
                    localTrack.jitsiTrack.setEffect(undefined);
                }
            }
        })
    };
}
