/* global process */
// import axios from 'axios';

import { jitsiLocalStorage } from '@jitsi/js-utils';
import jwtDecode from 'jwt-decode';

// import logger from './logger';
import tokenLocalStorage from '../../../api/tokenLocalStorage';
import { setJWT } from '../jwt';

import { SET_CURRENT_USER } from './actionTypes';

// const AUTH_API_BASE = process.env.REACT_APP_AUTH_API_BASE;
const AUTH_JWT_TOKEN = process.env.JWT_APP_ID;
const JWT_TOKEN_VERSION = process.env.JWT_TOKEN_VERSION;

/**
 * Load current logged in user.
 *
 * @returns {Function}
 */
export function loadCurrentUser() {
    return async (dispatch, getState) => {
        // try {
        //     const resp = await axios.get(`${AUTH_API_BASE}/current-user`, { withCredentials: true });
        //     dispatch(setCurrentUser(resp.data));
        // } catch (err) {
        //     logger.warn('Failed to load current user.', err);
        //     dispatch(setCurrentUser());
        // }
        try {
            const token = navigator.product === 'ReactNative'
                ? tokenLocalStorage.getItem(getState())
                : jitsiLocalStorage.getItem(AUTH_JWT_TOKEN);

            if (token) {
                const { exp, context } = jwtDecode(token);

                // check expire of jwt token
                if (Date.now() < exp * 1000 && context.tv === JWT_TOKEN_VERSION) {
                    dispatch(setJWT(token));
                } else {
                    navigator.product === 'ReactNative'
                        ? tokenLocalStorage.removeItem(getState())
                        : jitsiLocalStorage.removeItem(AUTH_JWT_TOKEN);
                }
            }
        } catch (e) {
            jitsiLocalStorage.removeItem(AUTH_JWT_TOKEN);
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
