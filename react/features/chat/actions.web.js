// @flow

import VideoLayout from '../../../modules/UI/videolayout/VideoLayout';

import { TOGGLE_CHAT } from './actionTypes';

import { NOTIFICATION_TIMEOUT, showNotification } from '../../features/notifications';

export * from './actions.any';

/**
 * Toggles display of the chat side panel while also taking window
 * resize into account.
 *
 * @returns {Function}
 */
export function toggleChat() {
    return function(dispatch: (Object) => Object) {
        dispatch({ type: TOGGLE_CHAT });
        VideoLayout.onResize();
    };
}

// Start of added portion

/**
 * Pop-up notification at the bottom of screen
 * when chat search results reach the end
 * 
 */
export function notifyEndOfSearchResults() {
    return (dispatch) => {

        dispatch(showNotification({
            titleKey: 'notify.endOfSearchResults',
        }, NOTIFICATION_TIMEOUT * 1));
    };
}

/**
 * Pop-up notification at the bottom of screen
 * when there is no results for chat search input
 * 
 */
export function notifyNoResultsFound() {
    return (dispatch) => {
        dispatch(showNotification({
            titleKey: 'notify.noSearchResultsFound',
        }, NOTIFICATION_TIMEOUT * 1));
    };
}

// End of added portion