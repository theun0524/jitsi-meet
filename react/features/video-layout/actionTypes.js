/**
 * The type of the action which sets the list of known participant IDs which
 * have an active screen share.
 *
 * @returns {{
 *     type: SCREEN_SHARE_PARTICIPANTS_UPDATED,
 *     participantIds: Array<string>
 * }}
 */
export const SCREEN_SHARE_PARTICIPANTS_UPDATED
    = 'SCREEN_SHARE_PARTICIPANTS_UPDATED';

/**
 * The type of the action which enables or disables the feature for showing
 * video thumbnails in a two-axis tile view.
 *
 * @returns {{
 *     type: SET_TILE_VIEW,
 *     enabled: boolean
 * }}
 */
export const SET_TILE_VIEW = 'SET_TILE_VIEW';

/**
 * The type of the action which reorder the video thumbnails for tile view
 * 
 * @return {{
 *     type: SET_TILE_VIEW_ORDER,
 *     order: Object
 * }}
 */
export const SET_TILE_VIEW_ORDER = 'SET_TILE_VIEW_ORDER';

/**
 * The type of the action which save the ordered video thumbnails for tile view
 * 
 * @return {{
 *     type: ORDERED_TILE_VIEW,
 *     order: Object
 * }}
 */
export const ORDERED_TILE_VIEW = 'ORDERED_TILE_VIEW';
