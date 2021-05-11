// @flow

import { ReducerRegistry } from '../base/redux';

import {
    ORDERED_TILE_VIEW,
    SCREEN_SHARE_PARTICIPANTS_UPDATED,
    SET_PAGE_INFO,
    SET_TILE_VIEW,
    SET_TILE_VIEW_ORDER
} from './actionTypes';

const DEFAULT_STATE = {
    screenShares: [],

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

    order: {
        videoMuted: true,
        by: 'displayName'
    }
};

const STORE_NAME = 'features/video-layout';

ReducerRegistry.register(STORE_NAME, (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SCREEN_SHARE_PARTICIPANTS_UPDATED: {
        return {
            ...state,
            screenShares: action.participantIds
        };
    }

    case SET_PAGE_INFO: {
        return {
            ...state,
            pageInfo: {
                ...(state.pageInfo || {}),
                ...action.pageInfo
            }
        };
    }

    case SET_TILE_VIEW: {
        return {
            ...state,
            tileViewEnabled: action.enabled
        };
    }

    case SET_TILE_VIEW_ORDER: {
        return {
            ...state,
            order: action.order
        };
    }

    case ORDERED_TILE_VIEW: {
        return {
            ...state,
            ordered: action.ordered
        };
    }
    }

    return state;
});
