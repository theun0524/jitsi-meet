/* global process */
// import axios from 'axios';

import jwtDecode from 'jwt-decode';
// import logger from './logger';
import { SET_CURRENT_USER } from './actionTypes';
import { jitsiLocalStorage } from '@jitsi/js-utils';
import { setJWT } from '../jwt';

// const AUTH_API_BASE = process.env.REACT_APP_AUTH_API_BASE;
const AUTH_JWT_TOKEN = process.env.JWT_APP_ID;

/**
 * Load current logged in user.
 *
 * @returns {Function}
 */
export function loadCurrentUser() {
    return async dispatch => {
        // try {
        //     const resp = await axios.get(`${AUTH_API_BASE}/current-user`, { withCredentials: true });
        //     dispatch(setCurrentUser(resp.data));
        // } catch (err) {
        //     logger.warn('Failed to load current user.', err);
        //     dispatch(setCurrentUser());
        // }
        try {
            const token = jitsiLocalStorage.getItem(AUTH_JWT_TOKEN);
            if (token) {
                const { exp } = jwtDecode(token);
                // check expire of jwt token
                if (Date.now() < exp * 1000) {
                    dispatch(setJWT(token));
                } else {
                    jitsiLocalStorage.removeItem(AUTH_JWT_TOKEN);
                }
            }
        } catch(e) {
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
