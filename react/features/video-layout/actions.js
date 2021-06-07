// @flow

import arrayMove from 'array-move';
import { findIndex, keyBy, map, sortBy } from 'lodash';
import type { Dispatch } from 'redux';
import { getParticipantCount, getParticipants, setParticipants } from '../base/participants';

import {
    SCREEN_SHARE_REMOTE_PARTICIPANTS_UPDATED,
    SELECT_ENDPOINTS,
    SET_PAGINATION,
    SET_TILE_VIEW
} from './actionTypes';
import { LAYOUTS } from './constants';
import { getCurrentLayout, getMaxColumnCount, shouldDisplayTileView } from './functions';

declare var interfaceConfig;

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
 * @param {number} pagination - The pagination to be displayed.
 * pagination can be contains as following values
 * pagination = {
 *     current: number - The current page to be displayed.
 *     pageSize: number - The page size of current layout.
 *     totalPages: number - The total pages.
 * }
 * 
 * @returns {{
 *     type: SET_PAGINATION,
 *     pagination: Object
 * }}
 */
export function setPagination(pagination: Object) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const newState = state['features/video-layout'].pagination;
        const participants = getParticipants(state);

        if (!pagination) {
            // reset pagination.
            const currentLayout = getCurrentLayout(state);
            const participantCount = participants.length;

            if (currentLayout === LAYOUTS.VERTICAL_FILMSTRIP_VIEW) {
                const { clientHeight } = state['features/base/responsive-ui'];
                // padding(30)
                // localVideo(124)
                // pageButton(24 * 2)
                // toolButton(24)
                const thumbHeight = 124;    // 120 + topBottomMargin(4)
                const pageHeight = clientHeight - 30 - thumbHeight - 24;
        
                newState.pageSize = Math.floor(pageHeight < (participantCount-1) * thumbHeight
                    ? (pageHeight - (24 * 2)) / thumbHeight
                    : pageHeight / thumbHeight);
                newState.totalPages = Math.max(Math.ceil((participantCount-1) / newState.pageSize), 1);
                // data = participants.filter(p => !p.local);
            } else if (currentLayout === LAYOUTS.TILE_VIEW) {
                newState.pageSize = getMaxColumnCount(state) * getMaxColumnCount(state);
                newState.totalPages = Math.max(Math.ceil(participantCount / newState.pageSize), 1);
                // data = participants;
            } else {
                console.error('ERROR: (updateParticipants) Unexpected layout!', currentLayout);
                return;
            }
        } else {
            for (const key in pagination) {
                if (pagination.hasOwnProperty(key)) {
                    newState[key] = pagination[key];
                }
            }
        }

        if (newState.totalPages < newState.current) {
            newState.current = newState.totalPages;
        }

        if (newState.order) {
            const orderedBefore = map(participants, 'id').join(',');
            const ordered = sortBy(participants, ...newState.order);
            const orderedAfter = map(ordered, 'id').join(',');

            if (orderedBefore !== orderedAfter) {
                dispatch(setParticipants(ordered));
            }
        }

        dispatch({
            type: SET_PAGINATION,
            pagination: newState,
        });
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
 * Create a (redux) action which signals to move participant video to first
 * in tileview
 * 
 * @returns {Function}
 */
export function moveToFirst(id) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const participants = state['features/base/participants'];

        const found = findIndex(participants, p => p.id === id);

        if (found > 0) {
            dispatch(setParticipants(arrayMove(participants, found, 0)));
            dispatch(setPagination({ order: null }));
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
        const state = getState();
        const participants = state['features/base/participants'];

        const found = findIndex(participants, p => p.id === id);

        if (found >= 0 && found !== participants.length - 1) {
            dispatch(setParticipants(arrayMove(participants, found, participants.length - 1)));
            dispatch(setPagination({ order: null }));
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
        const state = getState();
        const participants = state['features/base/participants'];

        const found = findIndex(participants, p => p.id === id);

        if (found >= 0 && found !== participants.length - 1) {
            dispatch(setParticipants(arrayMove(participants, found, found + 1)));
            dispatch(setPagination({ order: null }));
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
        const state = getState();
        const participants = state['features/base/participants'];

        const found = findIndex(participants, p => p.id === id);

        if (found > 0) {
            dispatch(setParticipants(arrayMove(participants, found, found - 1)));
            dispatch(setPagination({ order: null }));
        }
    };
}

export function changePageOrder(ids) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const { current, pageSize, totalPages } = state['features/video-layout'].pagination;
        const participants = state['features/base/participants'];
        const mapData = keyBy(participants, 'id');
        const page = map(ids, id => mapData[id]);

        dispatch(setParticipants([
            ...participants.slice(0, (current - 1) * pageSize),
            ...page,
            ...participants.slice(current * pageSize, totalPages * pageSize)
        ]));
        dispatch(setPagination({ order: null }));
    };
}

export function updateParticipants() {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const currentLayout = getCurrentLayout(state);
        const participantCount = getParticipantCount(state);
        const { current = 1 } = state['features/video-layout'].pagination || {};
        let pageSize = 1, totalPages = 1;

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
            // data = participants.filter(p => !p.local);
        } else if (currentLayout === LAYOUTS.TILE_VIEW) {
            pageSize = getMaxColumnCount(state) * getMaxColumnCount(state);
            totalPages = Math.ceil(participantCount / pageSize);
            // data = participants;
        } else {
            console.error('ERROR: (updateParticipants) Unexpected layout!', currentLayout);
            return;
        }

        // const conference = getCurrentConference(state);
        // let ordered = data;
        // if (conference) {
        //     // sort
        //     const { order } = state['features/video-layout'].pagination;
        //     let part = [];
            
        //     if (order.by !== ORDER_BY.USER_DEFINED) {
        //         const dataMap = keyBy(data, 'id');
        //         const isTileViewActive = currentLayout === LAYOUTS.TILE_VIEW;

        //         if (order.videoMuted) {
        //             const tracks = state['features/base/tracks'];
    
        //             // split videoMuted order
        //             part.push([]);
        //             part.push([]);
    
        //             data.forEach(p => {
        //                 const isVideoMuted = p.local
        //                     ? isLocalCameraTrackMuted(tracks)
        //                     : conference.getParticipantById(p.id)?.isVideoMuted();
        //                 part[isVideoMuted ? 1 : 0].push(p);
        //             });
        //         } else {
        //             part = data;
        //         }
    
        //         if (orderBy[order.by]) {
        //             ordered = orderBy[order.by](...part);
        //         }

        //         // save page information
        //         dispatch(setPagination({ current, pageSize, totalPages }));
        //     } else {
        //         // check exists in data and add participants
        //         const { data: origin } = state['features/video-layout'].pagination;
        //         const dataMap = keyBy(origin, 'id');

        //         part = [...origin];
        //         data.forEach(p => {
        //             if (!dataMap[p.id]) part.push(p);
        //         });
        
        //         // save page information
        //         dispatch(setPagination({ current, pageSize, totalPages }));
        //     }
        // }
        dispatch(setPagination({ current, pageSize, totalPages }));
    };
}
