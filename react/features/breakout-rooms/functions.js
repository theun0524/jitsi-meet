// @flow

import { getCurrentConference } from '../base/conference';
import { toState } from '../base/redux';
import { getBackendSafeRoomName } from '../base/util';

import { FEATURE_KEY } from './constants';

/**
 * Returns the main room id.
 *
 * @param {Function|Object} stateful - The redux store, the redux
 * {@code getState} function, or the redux state itself.
 * @returns {string} Room id of the main room or undefined.
 */
export const getMainRoomId = (stateful: Function | Object) => {

    // currently we have room id in the format `vmeeting-server/sub-domain/mainRoomName`
    // whereas jitsi directly uses it as `jitsi-meet-server/mainRoomName`

    // variable pathname here retrieves string consisting of everything after the server name
    // i.e. for example for a meeting URL: `vmeeting.io/room/myRoom`, pathname will contain `/room/myRoom`

    // modified original pathname to get the roomname only and then prepended '/' at the beginning of the pathname
    let pathname = toState(stateful)['features/base/connection']?.locationURL?.pathname.split('/')[2];
    pathname = pathname.replace(/^/, '/')

    if (pathname) {
        // Remove the leading '/' from the pathname
        return getBackendSafeRoomName(pathname.slice(1));
    }

    return pathname;
};

/**
 * Returns the state of the breakout rooms feature.
 *
 * @param {Function|Object} stateful - The redux store, the redux
 * {@code getState} function, or the redux state itself.
 * @returns {Object} Breakout rooms feature state.
 */
export const getBreakoutRooms = (stateful: Function | Object) => toState(stateful)[FEATURE_KEY] || {};

/**
 * Returns the object with the rooms.
 *
 * @param {Function|Object} stateful - The redux store, the redux
 * {@code getState} function, or the redux state itself.
 * @returns {Object} Object of rooms.
 */
export const getRooms = (stateful: Function | Object) => getBreakoutRooms(stateful)?.rooms || {};

/**
 * Returns a room by its id.
 *
 * @param {Function|Object} stateful - The redux store, the redux
 * {@code getState} function, or the redux state itself.
 * @param {string} roomId - The room id.
 * @returns {Object} The room.
 */
export const getRoomById = (stateful: Function | Object, roomId: string) => getRooms(stateful)?.[roomId];

/**
 * Returns a proxy moderator conference by room id.
 *
 * @param {Function|Object} stateful - The redux store, the redux
 * {@code getState} function, or the redux state itself.
 * @param {string} roomId - The room id.
 * @returns {Object} The conference or undefined.
 */
export const getProxyModeratorConference = (stateful: Function | Object, roomId: string) => {
    const { proxyModeratorConferences = {} } = getBreakoutRooms(stateful);

    return proxyModeratorConferences[roomId];
};

/**
 * Returns the id of the current room or undefined.
 *
 * @param {Function|Object} stateful - The redux store, the redux
 * {@code getState} function, or the redux state itself.
 * @returns {string} Room id or undefined.
 */
export const getCurrentRoomId = (stateful: Function | Object) =>
getCurrentConference(stateful)?.options?.name;

/**
 * Get participants in a room.
 *
 * @param {Function|Object} stateful - The redux store, the redux
 * {@code getState} function, or the redux state itself.
 * @param {string} roomId - The room id.
 * @returns {Array} List of participants in the conference.
 */
export const getRoomParticipants = (stateful: Function | Object, roomId: string) =>
    getRoomById(stateful, roomId)?.participants || [];

/**
 * Determines whether the local participant is in a breakout room.
 *
 * @param {Function|Object} stateful - The redux store, the redux
 * {@code getState} function, or the redux state itself.
 * @returns {boolean}
 */
export const isInBreakoutRoom = (stateful: Function | Object) => {
    const mainRoomId = getMainRoomId(stateful);
    const currentRoomId = getCurrentRoomId(stateful);

    return typeof currentRoomId !== 'undefined' && currentRoomId !== mainRoomId;
};
