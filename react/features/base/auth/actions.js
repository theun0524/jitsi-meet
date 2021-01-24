import tokenLocalStorage from '../../../api/tokenLocalStorage';
import { setJWT } from '../jwt';

import { SET_CURRENT_USER } from './actionTypes';

/**
 * Load current logged in user.
 *
 * @returns {Function}
 */
export function loadCurrentUser() {
    return async (dispatch, getState) => {
        try {
            const token = tokenLocalStorage.getItem(getState());
            if (token) {
                dispatch(setJWT(token));
            }
        } catch (e) {
            console.error('loadCurrentUser is failed:', e.message);
        }
    };
}

/**
 * Set user information.
 *
 * @param {Object} user - The user's information.
 * @returns {{
 *     type: SET_CURRENT_USER,
 * }}
 */
export function setCurrentUser(user) {
    return {
        type: SET_CURRENT_USER,
        user
    };
}
