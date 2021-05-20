// @flow
/* global APP */

import {
    getParticipantCountWithFake,
    getPinnedParticipant
} from '../base/participants';
import { toState } from '../base/redux';

import { TILE_ASPECT_RATIO } from './constants';

declare var interfaceConfig: Object;

/**
 * Returns true if the filmstrip on mobile is visible, false otherwise.
 *
 * NOTE: Filmstrip on web behaves differently to mobile, much simpler, but so
 * function lies here only for the sake of consistency and to avoid flow errors
 * on import.
 *
 * @param {Object | Function} stateful - The Object or Function that can be
 * resolved to a Redux state object with the toState function.
 * @returns {boolean}
 */
export function isFilmstripVisible(stateful: Object | Function) {
    const { hideLocalVideo, hideRemoteVideos } = toState(stateful)['features/base/config'];
    return toState(stateful)['features/filmstrip'].visible &&
        !(hideLocalVideo && hideRemoteVideos);
}

/**
 * Determines whether the remote video thumbnails should be displayed/visible in
 * the filmstrip.
 *
 * @param {Object} state - The full redux state.
 * @returns {boolean} - If remote video thumbnails should be displayed/visible
 * in the filmstrip, then {@code true}; otherwise, {@code false}.
 */
export function shouldRemoteVideosBeVisible(state: Object) {
    if (state['features/invite'].calleeInfoVisible) {
        return false;
    }

    // Include fake participants to derive how many thumbnails are dispalyed,
    // as it is assumed all participants, including fake, will be displayed
    // in the filmstrip.
    const participantCount = getParticipantCountWithFake(state);
    let pinnedParticipant;

    return !state['features/base/config'].hideRemoteVideos &&
        Boolean(
            participantCount > 2

            // Always show the filmstrip when there is another participant to
            // show and the filmstrip is hovered, or local video is pinned, or
            // the toolbar is displayed.
            || (participantCount > 1
                && (state['features/filmstrip'].hovered
                    || state['features/toolbox'].visible
                    || ((pinnedParticipant = getPinnedParticipant(state))
                        && pinnedParticipant.local)))

            || (typeof interfaceConfig === 'object'
                && interfaceConfig.filmStripOnly)

            || state['features/base/config'].disable1On1Mode);
}

/**
 * Calculates the size for thumbnails when in horizontal view layout.
 *
 * @param {number} clientHeight - The height of the app window.
 * @returns {{local: {height, width}, remote: {height, width}}}
 */
export function calculateThumbnailSizeForHorizontalView(clientHeight: number = 0) {
    const topBottomMargin = 15;
    const availableHeight = Math.min(clientHeight, (interfaceConfig.FILM_STRIP_MAX_HEIGHT || 120) + topBottomMargin);
    const height = availableHeight - topBottomMargin;

    return {
        local: {
            height,
            width: Math.floor(interfaceConfig.LOCAL_THUMBNAIL_RATIO * height)
        },
        remote: {
            height,
            width: Math.floor(interfaceConfig.REMOTE_THUMBNAIL_RATIO * height),
            visibleRows: Math.floor(clientHeight / height),
        }
    };
}

/**
 * Calculates the size for thumbnails when in tile view layout.
 *
 * @param {Object} dimensions - The desired dimensions of the tile view grid.
 * @returns {{height, width}}
 */
export function calculateThumbnailSizeForTileView({
    columns,
    rows,
    visibleRows,
    clientWidth,
    clientHeight
}: Object) {
    // The distance from the top and bottom of the screen, as set by CSS, to
    // avoid overlapping UI elements.
    const topBottomPadding = (28 + 82); // was initially 200

    // Minimum space to keep between the sides of the tiles and the sides
    // of the window.
    const sideMargins = 4; // was initailly 30 * 2
    const verticalMargins = visibleRows * 4;
    const viewWidth = clientWidth - (sideMargins * columns);
    const viewHeight = clientHeight - topBottomPadding - verticalMargins;
    const initialWidth = viewWidth / columns;
    const initialHeight = viewHeight / Math.max(visibleRows, 2);

    let height = Math.floor(initialHeight);
    const width = Math.floor(initialWidth);
    let lastRowWidth = width;

    const participants = getParticipantCountWithFake(APP.store.getState());
    const unbalancedThumbNailCount = participants % columns;

    if (columns > 1) {
        // adjusting the height with respect to aspect ratio in case of two participants only
        height = Math.floor(Math.max(height, width / TILE_ASPECT_RATIO));
    }

    if (visibleRows > 1) {
        height = Math.floor(Math.min(height, initialHeight));
        if (unbalancedThumbNailCount !== 0) {
            lastRowWidth = (clientWidth - (sideMargins * unbalancedThumbNailCount)) / unbalancedThumbNailCount;
        }
    }

    return {
        height,
        width,
        lastRowWidth,
        unbalancedThumbNailCount
    };
}

/**
 * Returns the width of the visible area (doesn't include the left margin/padding) of the the vertical filmstrip.
 *
 * @returns {number} - The width of the vertical filmstrip.
 */
export function getVerticalFilmstripVisibleAreaWidth() {
    // Adding 11px for the 2px right margin, 2px borders on the left and right and 5px right padding.
    // Also adding 7px for the scrollbar. Note that we are not counting the left margins and paddings because this
    // function is used for calculating the available space and they are invisible.
    // TODO: Check if we can remove the left margins and paddings from the CSS.
    // FIXME: This function is used to calculate the size of the large video, etherpad or shared video. Once everything
    // is reactified this calculation will need to move to the corresponding components.
    const filmstripMaxWidth = (interfaceConfig.FILM_STRIP_MAX_HEIGHT || 120) + 18;

    return Math.min(filmstripMaxWidth, window.innerWidth);
}
