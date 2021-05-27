// @flow

import arrayMove from 'array-move';
import { map } from 'lodash';
import type { Dispatch } from 'redux';
// import { getVideoId } from '../../../modules/UI/videolayout/VideoLayout';

import {
    ORDERED_TILE_VIEW,
    SCREEN_SHARE_REMOTE_PARTICIPANTS_UPDATED,
    SELECT_ENDPOINTS,
    SET_PAGE_INFO,
    SET_TILE_VIEW,
    SET_TILE_VIEW_ORDER
} from './actionTypes';
import { getPageInfo, shouldDisplayTileView } from './functions';

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
 * Creates a (redux) action which signals to reorder the video thumbnails
 * for tile view.
 *
 * @returns {Function}
 */
export function setTileViewOrder(order) {
    return {
        type: SET_TILE_VIEW_ORDER,
        order
    };
}

/**
 * Creates a (redux) action which signals to save the video thumbnails orders
 * for tile view.
 *
 * @returns {Function}
 */
export function orderedTileView(ordered) {
    return {
        type: ORDERED_TILE_VIEW,
        ordered
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
        // const nodes = document.getElementById('filmstripRemoteVideosContainer')?.childNodes;
        // const ordered = map(nodes, getVideoId);
        // const found = ordered.indexOf(id);

        // if (found >= 0 && found !== 0) {
        //     dispatch(setTileViewOrder(arrayMove(ordered, found, 0)));
        // }
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
        // const nodes = document.getElementById('filmstripRemoteVideosContainer')?.childNodes;
        // const ordered = map(nodes, getVideoId);
        // const found = ordered.indexOf(id);

        // if (found >= 0 && found !== nodes.length - 1) {
        //     dispatch(setTileViewOrder(arrayMove(ordered, found, nodes.length - 1)));
        // }
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
        // const nodes = document.getElementById('filmstripRemoteVideosContainer')?.childNodes;
        // const ordered = map(nodes, getVideoId);
        // const found = ordered.indexOf(id);

        // if (found >= 0 && found !== nodes.length - 1) {
        //     dispatch(setTileViewOrder(arrayMove(ordered, found, found + 1)));
        // }
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
        // const nodes = document.getElementById('filmstripRemoteVideosContainer')?.childNodes;
        // const ordered = map(nodes, getVideoId);
        // const found = ordered.indexOf(id);

        // if (found > 0) {
        //     dispatch(setTileViewOrder(arrayMove(ordered, found, found - 1)));
        // }
    };
}

export function updatePageInfo() {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        dispatch(setPageInfo(getPageInfo(state)));
    };
}
