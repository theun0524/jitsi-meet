/* eslint-disable require-jsdoc */
import { toState } from '../features/base/redux';
import { getServerURL } from '../features/base/settings';

export function getAuthServerURL(stateful) {
    const state = toState(stateful);
    const serverUrl = getServerURL(state);

    return serverUrl;
}

export function getLocationURL(stateful) {
    const state = toState(stateful);
    const locationURL = state['features/base/connection'].locationURL;

    return `https://${locationURL._host}`;
}
