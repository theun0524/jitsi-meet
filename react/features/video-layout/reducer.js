// @flow

import { ReducerRegistry } from '../base/redux';

import {
    SCREEN_SHARE_REMOTE_PARTICIPANTS_UPDATED,
    SELECT_ENDPOINTS,
    SET_PAGE_INFO,
    SET_PAGE_ORDER,
    SET_TILE_VIEW,
} from './actionTypes';

const DEFAULT_STATE = {
    remoteScreenShares: [],

    /**
     * The indicator which determines whether the video layout should display
     * video thumbnails in a tiled layout.
     *
     * Note: undefined means that the user hasn't requested anything in particular yet, so
     * we use our auto switching rules.
     *
     * @public
     * @type {boolean}
     */
    tileViewEnabled: undefined,

    pageInfo: {
        order: {
            videoMuted: true,
            by: 'displayName'
        },
        data: []
    }
};

const STORE_NAME = 'features/video-layout';

ReducerRegistry.register(STORE_NAME, (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SCREEN_SHARE_REMOTE_PARTICIPANTS_UPDATED: {
        return {
            ...state,
            remoteScreenShares: action.participantIds
        };
    }

    case SELECT_ENDPOINTS: {
        return {
            ...state,
            selectedEndpoints: action.participantIds
        };
    }

    case SET_TILE_VIEW:
        return {
            ...state,
            tileViewEnabled: action.enabled
        };

    case SET_PAGE_INFO: {
        return {
            ...state,
            pageInfo: {
                ...(state.pageInfo || {}),
                ...action.pageInfo
            }
        };
    }
    }

    return state;
});
