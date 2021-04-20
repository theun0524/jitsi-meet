// @flow

import { toggleDialog } from '../base/dialog';
import { ModeratorSelection } from './components';

/**
 * Action that triggers toggle of the ModeratorSelection dialog.
 *
 * @returns {Function}
 */
 export function toggleModeratorSelectionDialog(_conference) {
    return function(dispatch: (Object) => Object) {
        dispatch(toggleDialog(ModeratorSelection, {conference: _conference}));
    };
}