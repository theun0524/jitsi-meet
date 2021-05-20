// @flow

import { getPinnedParticipant, getParticipantCount } from '../base/participants';
import { calculateThumbnailSizeForHorizontalView } from '../filmstrip/functions.web';
import { isYoutubeVideoPlaying } from '../youtube-player/functions';

import { LAYOUTS } from './constants';

declare var interfaceConfig: Object;

/**
 * Returns the {@code LAYOUTS} constant associated with the layout
 * the application should currently be in.
 *
 * @param {Object} state - The redux state.
 * @returns {string}
 */
export function getCurrentLayout(state: Object) {
    if (shouldDisplayTileView(state)) {
        return LAYOUTS.TILE_VIEW;
    } else if (interfaceConfig.VERTICAL_FILMSTRIP) {
        return LAYOUTS.VERTICAL_FILMSTRIP_VIEW;
    }

    return LAYOUTS.HORIZONTAL_FILMSTRIP_VIEW;
}

/**
 * Returns how many columns should be displayed in tile view. The number
 * returned will be between 1 and 5, inclusive.
 *
 * @returns {number}
 */
export function getMaxColumnCount() {
    const configuredMax = interfaceConfig.TILE_VIEW_MAX_COLUMNS || 5; // was initially 5

    // console.log("InterfaceConfig.TILE_VIEW_MAX_COLUMNS is " + interfaceConfig.TILE_VIEW_MAX_COLUMNS);
    // console.log('Configured value for max number of columns for tile_view is : ', configuredMax);

    return Math.max(configuredMax, 1); // It should be configurable by TILE_VIEW_MAX_COLUMNS
}

/**
 * Returns how many participant should be displayed in a page.
 *
 * @param {Object} state - The redux store state.
 * @param {number} layout - The target layout to be displayed.
 * @returns {number}
 */
export function getPageInfo(state) {
    const currentLayout = getCurrentLayout(state);
    const participantCount = getParticipantCount(state);
    const current = state['features/video-layout'].pageInfo?.current || 1;
    let pageSize = 1, totalPages = 1;

    if (currentLayout === LAYOUTS.VERTICAL_FILMSTRIP_VIEW) {
        const clientHeight = state['features/base/responsive-ui'].clientHeight;
        // padding(30)
        // toolbar(64)
        // localVideo(124)
        // pageButton(36 * 2)
        // toolButton(24)
        const thumbHeight = 124;    // 120 + topBottomMargin(4)
        const pageHeight = clientHeight - 30 - 64 - thumbHeight - 24;

        pageSize = Math.floor(pageHeight < (participantCount-1) * thumbHeight
            ? (pageHeight - (24 * 2)) / thumbHeight
            : pageHeight / thumbHeight);
        totalPages = Math.ceil((participantCount-1) / pageSize);
    } else if (currentLayout === LAYOUTS.TILE_VIEW) {
        pageSize = getMaxColumnCount() * getMaxColumnCount();
        totalPages = Math.ceil(participantCount / pageSize);
    } else {
        console.error('getPageInfo: Unexpected layout error!', currentLayout);
    }

    return { current, pageSize, totalPages };
}

/**
 * Returns the cell count dimensions for tile view. Tile view tries to uphold
 * equal count of tiles for height and width, until maxColumn is reached in
 * which rows will be added but no more columns.
 *
 * @param {Object} state - The redux store state.
 * @param {number} maxColumns - The maximum number of columns that can be
 * displayed.
 * @returns {Object} An object is return with the desired number of columns,
 * rows, and visible rows (the rest should overflow) for the tile view layout.
 */
export function getTileViewGridDimensions(state: Object, maxColumns: number = getMaxColumnCount()) {
    // When in tile view mode, we must discount ourselves (the local participant) because our
    // tile is not visible.
    const { iAmRecorder } = state['features/base/config'];
    const numberOfParticipants = state['features/base/participants'].length - (iAmRecorder ? 1 : 0);

    const columnsToMaintainASquare = Math.ceil(Math.sqrt(numberOfParticipants));
    const columns = Math.min(columnsToMaintainASquare, maxColumns);
    const rows = Math.ceil(numberOfParticipants / columns);
    const visibleRows = Math.min(maxColumns, rows);

    return {
        columns,
        rows,
        visibleRows
    };
}

/**
 * Selector for determining if the UI layout should be in tile view. Tile view
 * is determined by more than just having the tile view setting enabled, as
 * one-on-one calls should not be in tile view, as well as etherpad editing.
 *
 * @param {Object} state - The redux state.
 * @returns {boolean} True if tile view should be displayed.
 */
export function shouldDisplayTileView(state: Object = {}) {
    const participantCount = getParticipantCount(state);

    // In case of a lonely meeting, we don't allow tile view.
    // But it's a special case too, as we don't even render the button,
    // see TileViewButton component.
    if (participantCount < 2) {
        return false;
    }

    const { tileViewEnabled } = state['features/video-layout'];

    if (tileViewEnabled !== undefined) {
        // If the user explicitly requested a view mode, we
        // do that.
        return tileViewEnabled;
    }

    // None tile view mode is easier to calculate (no need for many negations), so we do
    // that and negate it only once.
    const shouldDisplayNormalMode = Boolean(

        // Reasons for normal mode:

        // Editing etherpad
        state['features/etherpad']?.editing

        // We're in filmstrip-only mode
        || (typeof interfaceConfig === 'object' && interfaceConfig?.filmStripOnly)

        // We pinned a participant
        || getPinnedParticipant(state)

        // prevent auto tileview
        || state['features/base/config'].autoTileViewDisabled

        // It's a 1-on-1 meeting
        || participantCount < 3

        // There is a shared YouTube video in the meeting
        || isYoutubeVideoPlaying(state)
    );

    return !shouldDisplayNormalMode;
}
