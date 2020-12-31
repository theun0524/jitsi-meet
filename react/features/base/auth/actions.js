/* global process */
// import axios from 'axios';

import { jitsiLocalStorage } from '@jitsi/js-utils';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

// import logger from './logger';
import tokenLocalStorage from '../../../api/tokenLocalStorage';
import { setJWT } from '../jwt';

import { SET_CURRENT_USER } from './actionTypes';

// const AUTH_API_BASE = process.env.REACT_APP_AUTH_API_BASE;
const AUTH_JWT_TOKEN = process.env.JWT_APP_ID;
const JWT_TOKEN_VERSION = process.env.JWT_TOKEN_VERSION;

function getValidAuthToken(state) {
    const rememberMe = Cookies.get('remember_me');
    const token = navigator.product === 'ReactNative'
        ? tokenLocalStorage.getItem(state)
        : jitsiLocalStorage.getItem(AUTH_JWT_TOKEN);

    if (rememberMe && token) {
        const { exp, context } = jwtDecode(token);

        // 유효한 토큰인 경우만 token을 리턴한다.
        if (Date.now() < exp * 1000 && context.tv === JWT_TOKEN_VERSION) {
            return token;
        }
    }

    return null;
}

function clearAuthToken(state) {
    Cookies.remove('remember_me');
    navigator.product === 'ReactNative'
        ? tokenLocalStorage.removeItem(state)
        : jitsiLocalStorage.removeItem(AUTH_JWT_TOKEN);
}

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
            const token = getValidAuthToken(getState());
            if (token) {
                dispatch(setJWT(token));
            } else {
                clearAuthToken(getState());
            }
        } catch (e) {
            console.error('loadCurrentUser is failed:', e.message);
            clearAuthToken(getState());
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
