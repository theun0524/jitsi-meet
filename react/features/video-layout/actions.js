// @flow

import arrayMove from 'array-move';
import { concat, debounce, findIndex, keyBy, map, sortBy } from 'lodash';
import type { Dispatch } from 'redux';
import { getCurrentConference } from '../base/conference';
import { getParticipantCount, getParticipants } from '../base/participants';
import { isLocalCameraTrackMuted } from '../base/tracks';

import {
    SCREEN_SHARE_REMOTE_PARTICIPANTS_UPDATED,
    SELECT_ENDPOINTS,
    SET_PAGE_INFO,
    SET_PAGE_ORDER,
    SET_TILE_VIEW
} from './actionTypes';
import { LAYOUTS } from './constants';
import { getCurrentLayout, getMaxColumnCount, getPageData, shouldDisplayTileView } from './functions';

declare var interfaceConfig;

const orderBy = {
    displayName: (...data) =>
        concat(...map(data, part => sortBy(part, [p => {
            return getParticipantDisplayName(p);
        }]))),
    userDefined: (...data) => concat(...data),
};

function getParticipantDisplayName(participant) {
    if (participant) {
        if (participant.name) {
            return participant.name;
        }

        if (participant.local) {
            return typeof interfaceConfig === 'object'
                ? interfaceConfig.DEFAULT_LOCAL_DISPLAY_NAME
                : 'me';
        }
    }

    return typeof interfaceConfig === 'object'
        ? interfaceConfig.DEFAULT_REMOTE_DISPLAY_NAME
        : 'Vmeeter';
}

/**
 * Creates a (redux) action which signals that a new set of remote endpoints need to be selected.
 *
 * @param {Array<string>} participantIds - The remote participants that are currently selected
 * for video forwarding from the bridge.
 * @returns {{
 *      type: SELECT_ENDPOINTS,
 *      particpantsIds: Array<string>
 * }}
 */
export function selectEndpoints(participantIds: Array<string>) {
    return {
        type: SELECT_ENDPOINTS,
        participantIds
    };
}

/**
 * Creates a (redux) action which signals set the page info.
 *
 * @param {number} pageInfo - The page info to be displayed.
 * pageInfo can be contains as following values
 * pageInfo = {
 *     current: number - The current page to be displayed.
 *     pageSize: number - The page size of current layout.
 *     totalPages: number - The total pages.
 * }
 * 
 * @returns {{
 *     type: SET_PAGE_INFO,
 *     pageInfo: Object
 * }}
 */
export function setPageInfo(pageInfo: Object) {
    return {
        type: SET_PAGE_INFO,
        pageInfo,
    };
}

/**
 * Creates a (redux) action which signals that the list of known participants
 * with screen shares has changed.
 *
 * @param {string} participantIds - The remote participants which currently have active
 * screen share streams.
 * @returns {{
 *     type: SCREEN_SHARE_REMOTE_PARTICIPANTS_UPDATED,
 *     participantId: string
 * }}
 */
export function setRemoteParticipantsWithScreenShare(participantIds: Array<string>) {
    return {
        type: SCREEN_SHARE_REMOTE_PARTICIPANTS_UPDATED,
        participantIds
    };
}

/**
 * Creates a (redux) action which signals to set the UI layout to be tiled view
 * or not.
 *
 * @param {boolean} enabled - Whether or not tile view should be shown.
 * @returns {{
 *     type: SET_TILE_VIEW,
 *     enabled: ?boolean
 * }}
 */
export function setTileView(enabled: ?boolean) {
    return {
        type: SET_TILE_VIEW,
        enabled
    };
}

/**
 * Creates a (redux) action which signals either to exit tile view if currently
 * enabled or enter tile view if currently disabled.
 *
 * @returns {Function}
 */
export function toggleTileView() {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const tileViewActive = shouldDisplayTileView(getState());

        dispatch(setTileView(!tileViewActive));
    };
}

/**
 * Creates a (redux) action which set page order.
 *
 * @returns {Function}
 */
export function setPageOrder(order) {
    return {
        type: SET_PAGE_ORDER,
        order
    };
}

/**
 * Create a (redux) action which signals to move participant video to first
 * in tileview
 * 
 * @returns {Function}
 */
export function moveToFirst(id) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const { data = [] } = getState()['features/video-layout'].pageInfo;
        const found = findIndex(data, p => p.id === id);

        if (found > 0) {
            dispatch(setPageInfo({ data: arrayMove(data, found, 0) }));
        }
    };
}

/**
 * Create a (redux) action which signals to move participant video to last
 * in tileview
 * 
 * @returns {Function}
 */
export function moveToLast(id) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const { data = [] } = getState()['features/video-layout'].pageInfo;
        const found = findIndex(data, p => p.id === id);

        if (found >= 0 && found !== data.length - 1) {
            dispatch(setPageInfo({ data: arrayMove(data, found, data.length - 1) }));
        }
    };
}

/**
 * Create a (redux) action which signals to move participant video to next
 * in tileview
 * 
 * @returns {Function}
 */
export function moveToNext(id) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const { data = [] } = getState()['features/video-layout'].pageInfo;
        const found = findIndex(data, p => p.id === id);

        if (found >= 0 && found !== data.length - 1) {
            dispatch(setPageInfo({ data: arrayMove(data, found, found + 1) }));
        }
    };
}

/**
 * Create a (redux) action which signals to move participant video to previous
 * in tileview
 * 
 * @returns {Function}
 */
export function moveToPrev(id) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const { data = [] } = getState()['features/video-layout'].pageInfo;
        const found = findIndex(data, p => p.id === id);

        if (found > 0) {
            dispatch(setPageInfo({ data: arrayMove(data, found, found - 1) }));
        }
    };
}

export function updatePageInfo() {
    return debounce((dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const currentLayout = getCurrentLayout(state);
        const participantCount = getParticipantCount(state);
        const participants = getParticipants(state);
        const { current = 1 } = state['features/video-layout'].pageInfo || {};
        let pageSize = 1, totalPages = 1;
        let data = [];

        if (currentLayout === LAYOUTS.VERTICAL_FILMSTRIP_VIEW) {
            const { clientHeight } = state['features/base/responsive-ui'];
            // padding(30)
            // localVideo(124)
            // pageButton(24 * 2)
            // toolButton(24)
            const thumbHeight = 124;    // 120 + topBottomMargin(4)
            const pageHeight = clientHeight - 30 - thumbHeight - 24;
    
            pageSize = Math.floor(pageHeight < (participantCount-1) * thumbHeight
                ? (pageHeight - (24 * 2)) / thumbHeight
                : pageHeight / thumbHeight);
            totalPages = Math.ceil((participantCount-1) / pageSize);
            data = participants.filter(p => !p.local);
        } else if (currentLayout === LAYOUTS.TILE_VIEW) {
            pageSize = getMaxColumnCount(state) * getMaxColumnCount(state);
            totalPages = Math.ceil(participantCount / pageSize);
            data = participants;
        } else {
            console.error('ERROR: (getPageInfo) Unexpected layout!', currentLayout);
            return;
        }

        const conference = getCurrentConference(state);
        let ordered = data;
        if (conference) {
            // sort
            const { order } = state['features/video-layout'];
            const dataMap = keyBy(data, 'id');
            const isTileViewActive = currentLayout === LAYOUTS.TILE_VIEW;
            let part = [];
            
            if (order.videoMuted) {
                const tracks = state['features/base/tracks'];

                // split videoMuted order
                part.push([]);
                part.push([]);

                data.forEach(p => {
                    const isVideoMuted = p.local
                        ? isLocalCameraTrackMuted(tracks)
                        : conference.getParticipantById(p.id)?.isVideoMuted();
                    part[isVideoMuted ? 1 : 0].push(p);
                });
            } else {
                part = data;
            }

            if (orderBy[order.by]) {
                ordered = orderBy[order.by](...part);
            }
    
            // save page information
            dispatch(setPageInfo({ data: ordered, current, pageSize, totalPages }));

            // notify video list to video bridge
            const page = getPageData(state);
            conference.recvVideoParticipants(map(page, 'id'));
        }
    }, 300);
}
